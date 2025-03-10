import userModel, { OTPtypes, providerTypes, roleTypes } from "../../DB/models/user.model.js"
import { decodedToken, tokenTypes } from "../../middleWare/auth.js"
import cloudinary from "../../utilits/cloudinary/index.js"
import { compareHashing, Decrypt, Hash } from "../../utilits/encryption/index.js"
import { asyncHandler } from "../../utilits/error/errorHandling.js"
import { eventEmitter } from "../../utilits/sendEmailEvents/sendEmail.event.js"
import { generateToken } from "../../utilits/token/generateToken.js"
import cron from "node-cron";



// auth apis

export const signUp = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, password, mobileNumber, role, gender, DOB } = req.body
    const emailExsit = await userModel.findOne({ email })
    if (emailExsit) {
        return next(new Error("Email already exists", { cause: 409 }))
    }
    if (!req?.files?.profilePic || !req?.files?.coverPic) {
        return next(new Error("Please upload profile and cover photos", { cause: 400 }));
    }
    const profilePicUpload = await cloudinary.uploader.upload(req.files.profilePic[0].path, {
        folder: "jobSearch/users",
    })
    const coverPicUpload = await cloudinary.uploader.upload(req.files.coverPic[0].path, {
        folder: "jobSearch/users",
    })
    const user = await userModel.create({
        firstName,
        lastName,
        email,
        password,
        mobileNumber,
        profilePic: {
            secure_url: profilePicUpload.secure_url,
            public_id: profilePicUpload.public_id,
        },
        coverPic: {
            secure_url: coverPicUpload.secure_url,
            public_id: coverPicUpload.public_id,
        },
        role,
        gender,
        DOB,
    })
    eventEmitter.emit("sendEmailConfirmation", { email })
    return res.status(201).json({ message: "User created successfully", user })
})

export const confirmOTPmail = asyncHandler(async (req, res, next) => {
    const { email, otp } = req.body
    const user = await userModel.findOne({ email })
    if (!user) {
        return next(new Error("User not found", { cause: 404 }))
    }
    const otpField = user.OTP?.find((args) => {
        return args.type === OTPtypes.confirmEmail
    }
    );
    if (!otpField) {
        return next(new Error("No OTP found for email confirmation", { cause: 400 }))
    }
    if (otpField.expiresIn < new Date()) {
        return next(new Error("OTP has expired", { cause: 400 }))
    }
    const isMatch = await compareHashing({ key: otp, hashed: otpField.code })
    if (!isMatch) {
        return next(new Error("Invalid OTP", { cause: 400 }));
    }
    await userModel.updateOne({ email }, { $set: { isConfirmed: true }, $pull: { OTP: { code: otpField.code } } });
    return res.status(200).json({ message: "Email confirmed successfully" })
})


export const signIn = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body
    const user = await userModel.findOne({ email, isConfirmed: true })
    if (!user) {
        return next(new Error("Invalid email or password", { cause: 401 }))
    }
    const match = await compareHashing({ key: password, hashed: user.password })
    if (!match) {
        return next(new Error("invalid password", { cause: 401 }))
    }
    const access_token = await generateToken({
        payload: { email, id: user._id },
        SIGNATURE: user.role == roleTypes.user ?
            process.env.SIGNATURE_TOKEN_USER : process.env.SIGNATURE_TOKEN_ADMIN,
        option: { expiresIn: "2d" }
    })
    const refresh_token = await generateToken({
        payload: { email, id: user._id },
        SIGNATURE: user.role == roleTypes.user ?
            process.env.REFRESH_SIGNATURE_USER : process.env.REFRESH_SIGNATURE_ADMIN,
        option: { expiresIn: "1w" }
    })
    return res.status(200).json({
        message: "Login successful",
        access_token,
        refresh_token
    })
})

export const refreshToken = asyncHandler(async (req, res, next) => {
    const { authorization } = req.body
    const user = await decodedToken({ authorization, tokenType: tokenTypes.refresh, next })
    const access_token = await generateToken({
        payload: { email: user.email, id: user._id },
        SIGNATURE: user.role == roleTypes.user ?
            process.env.SIGNATURE_TOKEN_USER : process.env.SIGNATURE_TOKEN_ADMIN,
        option: { expiresIn: "1d" }
    })
    return res.status(201).json({
        message: "done", token: {
            access_token,
        }
    })
})


export const loginWithGmail = asyncHandler(async (req, res, next) => {
    const { idToken } = req.body
    const client = new OAuth2Client();
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.CLIENT_ID,
        });
        const payload = ticket.getPayload();
        return payload
    }
    const { firstName, lastName, email, email_verified, picture } = await verify()
    let user = await userModel.findOne({ email })
    if (!user) {
        user = await userModel.create({
            firstName,
            lastName,
            email,
            isConfirmed: email_verified,
            profilePic: picture,
            provider: providerTypes.google
        })
    }
    if (user.provider != providerTypes.google) {
        return next(new Error("please login with system", { cause: 401 }))
    }
    const access_token = await generateToken({
        payload: { email, id: user._id },
        SIGNATURE: user.role == roleTypes.user ?
            process.env.SIGNATURE_TOKEN_USER : process.env.SIGNATURE_ADMIN,
        option: { expiresIn: "1d" }
    })
    return res.status(201).json({ message: "Done", token: access_token })
})


export const forgetPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body
    const user = await userModel.findOne({
        email,
        isDeleted: { $exists: false }
    })
    if (!user) {
        return next(new Error("email not exist", { cause: 404 }))
    }
    eventEmitter.emit("forgetPassword", { email })
    return res.status(201).json({ message: "done" })
})

export const resetPassword = asyncHandler(async (req, res, next) => {
    const { email, otp, newPassword } = req.body
    const user = await userModel.findOne({
        email,
        isDeleted: { $exists: false }
    })
    if (!user) {
        return next(new Error("email not exists", { cause: 404 }))
    }
    const otpField = user.OTP?.find((args) => {
        return args.type === OTPtypes.forgetPassword
    }
    )
    if (!otpField) {
        return next(new Error("Invalid or expired OTP", { cause: 400 }))
    }
    if (otpField.expiresIn < new Date()) {
        return next(new Error("OTP has expired", { cause: 400 }))
    }
    const match = await compareHashing({ key: otp, hashed: otpField.code })
    if (!match) {
        return next(new Error("invalid otp", { cause: 401 }))
    }
    user.password = newPassword;
    user.changeCredentialTime = new Date();
    user.OTP = user.OTP.filter(entry => entry.type !== OTPtypes.forgetPassword)
    await user.save();
    return res.status(201).json({ message: "done" })
})

cron.schedule("0 */6 * * *", async () => {
    const result = await userModel.updateMany(
        {},
        { $pull: { OTP: { expiresIn: { $lt: new Date() } } } }
    );
    console.log("Expired OTPs deleted", result)
})



// user apis

export const updateProfile = asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.user._id);
    if (!user) return next(new Error("User not found", { cause: 404 }));
    if (req.body.mobileNumber) {
        user.mobileNumber = req.body.mobileNumber
    }
    await user.save()
    const newUser = await userModel.findByIdAndUpdate(
        { _id: req.user._id },
        req.body,
        {
            new: true,
        }
    )
    return res.status(201).json({ message: "done", newUser })
})

export const getProfile = asyncHandler(async (req, res, next) => {
    const user = await userModel.findById(req.user._id)
    if (!user) {
        return next(new Error("User not found", { cause: 404 }))
    }
    return res.status(200).json({ message: "User profile retrieved", user })
})


export const getUserProfile = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const user = await userModel.findById(userId).select("firstName lastName mobileNumber profilePic coverPic -_id")
    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }
    return res.status(200).json({
        message: "User profile retrieved",
        user: {
            username: user.username,
            mobileNumber: user.mobileNumber,
            profilePic: user.profilePic,
            coverPic: user.coverPic,
        }
    })
})

export const updatePassword = asyncHandler(async (req, res, next) => {
    const { email, oldPassword, newPassword } = req.body
    const emailexsit = await userModel.findOne({
        email,
        isDeleted: { $exists: false }
    })
    if (!emailexsit) {
        return next(new Error("email not exsist", { cause: 400 }))
    }
    if (!await compareHashing({ key: oldPassword, hashed: req.user.password })) {
        return next(new Error("inValid old password ", { cause: 400 }))
    }
    const hash = await Hash({ key: newPassword, SALT_ROUNDS: process.env.SALT_ROUNDS })
    const user = await userModel.findByIdAndUpdate(
        { _id: req.user._id },
        {
            password: hash,
            changeCredentialTime: Date.now()
        },
        { new: true }

    )
    return res.status(201).json({ message: "password updated successfully", user })
})


export const updateProfilePic = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new Error("Please upload an image", { cause: 400 }));
    }
    const user = await userModel.findById(req.user._id);
    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }
    if (user.profilePic?.public_id) {
        await cloudinary.uploader.destroy(user.profilePic.public_id);
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: "jobSearch/users",
    })
    await userModel.findByIdAndUpdate({ _id: req.user._id },
        {
            profilePic: { secure_url, public_id }
        },
        { new: true }
    )

    return res.status(200).json({ message: "Profile picture updated successfully", profilePic: user.profilePic });
})

export const updateCoverPic = asyncHandler(async (req, res, next) => {
    if (!req.file) {
        return next(new Error("Please upload an image", { cause: 400 }));
    }
    const user = await userModel.findById(req.user._id);
    if (!user) {
        return next(new Error("User not found", { cause: 404 }));
    }
    if (user.coverPic?.public_id) {
        await cloudinary.uploader.destroy(user.coverPic.public_id);
    }

    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: "jobSearch/users",
    })
    await userModel.findByIdAndUpdate({ _id: req.user._id },
        {
            coverPic: { secure_url, public_id }
        },
        { new: true }
    )

    return res.status(200).json({ message: "cover picture updated successfully", coverPic: user.coverPic });
})

export const deleteProfilePic = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) {
        return next(new Error("User not found", { cause: 404 }))
    }
    if (!user.profilePic?.public_id) {
        return next(new Error("No profile picture to delete", { cause: 400 }));
    }
    if (user.profilePic?.public_id) {
        await cloudinary.uploader.destroy(user.profilePic.public_id)
    }
    await userModel.findByIdAndUpdate({ _id: req.user._id },
        {
            profilePic: { secure_url: "", public_id: "" }
        },
        { new: true }
    )
    return res.status(200).json({ message: "profile picture deleted successfully" });
})

export const deleteCoverPic = asyncHandler(async (req, res, next) => {
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) {
        return next(new Error("User not found", { cause: 404 }))
    }
    if (!user.coverPic?.public_id) {
        return next(new Error("No cover picture to delete", { cause: 400 }));
    }
    if (user.coverPic?.public_id) {
        await cloudinary.uploader.destroy(user.coverPic.public_id)
    }
    await userModel.findByIdAndUpdate({ _id: req.user._id },
        {
            coverPic: { secure_url: "", public_id: "" }
        },
        { new: true }
    )
    return res.status(200).json({ message: "cover picture deleted successfully" })
})


export const freezeAccount = asyncHandler(async (req, res, next) => {
    const { userId } = req.params
    const condition = req.user.role === roleTypes.admin ? {} : { _id: req.user._id }
    const user = await userModel.findOneAndUpdate(
        { _id: userId, ...condition, isDeleted: { $exists: false } },
        { isDeleted: true, updatedBy: req.user._id, deletedAt: Date.now() },
        { new: true }
    )
    if (!user) {
        return next(new Error("user not found or already deleted", { cause: 404 }))
    }
    return res.status(201).json({ message: "done", user })
})