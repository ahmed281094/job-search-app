import joi from "joi";
import { generalRules } from "../../utilits/generalRules/index.js";
import { genderTypes, roleTypes } from "../../DB/models/user.model.js";


export const signUpSchema = joi.object({
    firstName: joi.string().alphanum().min(3).max(50).required(),
    lastName: joi.string().alphanum().min(3).max(50).required(),
    role: joi.string().valid(roleTypes.user, roleTypes.admin).required(),
    email: generalRules.email.required(),
    password: generalRules.password.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).required(),
    gender: joi.string().valid(genderTypes.male, genderTypes.female).required(),
    cPassword: generalRules.password.valid(joi.ref("password")).required(),
    mobileNumber: joi.string().regex(/^01[0125][0-9]{8}$/).required(),
    profilePic: generalRules.file.required(),
    coverPic: generalRules.file.required(),
    DOB: joi.date()
        .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)))
        .iso()
        .required()
}).required()



export const confirmEmailSchema = joi.object({
    email: generalRules.email.required(),
    otp: joi.string().length(4).required()
}).required()



export const signInSchema = joi.object({
    email: generalRules.email.required(),
    password: generalRules.password.required()
}).required()


export const refreshTokenSchema = joi.object({
    authorization: joi.string().required()
}).required()



export const forgetPasswordSchema = joi.object({
    email: generalRules.email.required()
}).required()

export const resetPasswordSchema = joi.object({
    email: generalRules.email.required(),
    otp: joi.string().length(4).required(),
    newPassword: generalRules.password.required(),
    cPassword: generalRules.password.valid(joi.ref("newPassword")).required()
}).required()



export const updateProfileSchema = joi.object({
    firstName: joi.string().alphanum().min(3).max(50),
    lasttName: joi.string().alphanum().min(3).max(50),
    gender: joi.string().valid(genderTypes.male, genderTypes.female),
    mobileNumber: joi.string().regex(/^01[0125][0-9]{8}$/),
    DOB: joi.date()
        .max(new Date(new Date().setFullYear(new Date().getFullYear() - 18)))
        .iso()
})



export const getUserProfileSchema = joi.object({
    userId: generalRules.objectId.required(),
}).required()

export const updatePasswordSchema = joi.object({
        email: generalRules.email.required(),
        oldPassword: generalRules.password.regex(/^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/).required(),
        newPassword: generalRules.password.required(),
        cNewPassword: generalRules.password.valid(joi.ref("newPassword")).required().messages({ "any.only": "password dont match" })
    }).required()

    export const updateProfilePicSchema = joi.object({
        file: generalRules.file.required().messages({
            "any.required": "Please upload an image",
        }),
    }).required()

    export const updateCoverPicSchema = joi.object({
        file: generalRules.file.required().messages({
            "any.required": "Please upload an image",
        }),
    }).required()



    
export const deleteProfilePicSchema = joi.object({
    userId: generalRules.objectId.required(),
}).required()
   


export const deleteoverPicSchema = joi.object({
    userId: generalRules.objectId.required(),
}).required()


export const freezeAccountcSchema = joi.object({
    userId: generalRules.objectId.required(),
}).required()