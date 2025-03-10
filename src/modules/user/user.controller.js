import { Router } from "express";
import * as US from "./user.service.js";
import * as UV from "./user.validation.js";
import { fileTypes, multerHost } from "../../middleWare/multer.js";
import { validation } from "../../middleWare/validation.js";
import { authentcation } from "../../middleWare/auth.js";


const userRouter = Router()

userRouter.post('/signUp',
    multerHost(fileTypes.image).fields([
        { name: "profilePic", maxCount: 1 },
        { name: "coverPic", maxCount: 1 }
    ]),
    validation(UV.signUpSchema),
    US.signUp
)


userRouter.patch('/confirmEmail', validation(UV.confirmEmailSchema), US.confirmOTPmail)
userRouter.post('/signIn', validation(UV.signInSchema), US.signIn)
userRouter.get('/refreshToken', validation(UV.refreshTokenSchema), US.refreshToken)
userRouter.post('/loginWithGmail', US.loginWithGmail)
userRouter.patch('/forgetPassword', validation(UV.forgetPasswordSchema), US.forgetPassword)
userRouter.patch('/resetPassword', validation(UV.resetPasswordSchema), US.resetPassword)
userRouter.patch('/updateProfile',
    multerHost(fileTypes.image).single("profilePic"),
    validation(UV.updateProfileSchema),
    authentcation,
    US.updateProfile,
)
userRouter.get('/getProfile',authentcation ,US.getProfile)
userRouter.get('/getUserProfile/:userId',validation(UV.getUserProfileSchema),authentcation ,US.getUserProfile)
userRouter.patch('/updatePassword', validation(UV.updatePasswordSchema), authentcation, US.updatePassword)
userRouter.patch(
    "/update-profile-pic",
    authentcation,
    multerHost(fileTypes.image).single("profilePic"),
    validation(UV.updateProfilePicSchema),
    US.updateProfilePic
)


userRouter.patch(
    "/update-cover-pic",
    authentcation,
    multerHost(fileTypes.image).single("coverPic"),
    validation(UV.updateCoverPicSchema),
    US.updateCoverPic
)

userRouter.delete('/deleteProfilePic/:userId',validation(UV.deleteProfilePicSchema),authentcation ,US.deleteProfilePic)
userRouter.delete('/deleteCoverPic/:userId',validation(UV.deleteoverPicSchema),authentcation ,US.deleteCoverPic)

userRouter.delete('/freezeAccount/:userId',
    validation(UV.freezeAccountcSchema),
    authentcation,
    US.freezeAccount
)
export default userRouter