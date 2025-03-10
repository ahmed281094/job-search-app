
import joi from "joi";
import { generalRules } from "../../utilits/generalRules/index.js";



export const addCompanySchema = joi.object({
    companyName: joi.string().required(),
    description: joi.string().required(),
    industry: joi.string().required(),
    address: joi.string().required(),
    numberOfEmployees: joi.number().integer().min(10).max(20).required(),
    companyEmail: generalRules.email.required(),
    HRs: generalRules.objectId,
    logo:  generalRules.file.required(),
    coverPic:  generalRules.file.required(),
    legalAttachment:  generalRules.file.required(),
}).required();




export const updateCompanySchema = joi.object({
    companyId: generalRules.objectId.required(),
    companyName: joi.string(),
    description: joi.string(),
    industry: joi.string(),
    address: joi.string(),
    numberOfEmployees: joi.number().integer().min(10).max(20),
    logo: generalRules.file,
    coverPic: generalRules.file,
    companyEmail: generalRules.email,
}).required()

export const freezeCompanySchema = joi.object({
    companyId: generalRules.objectId.required(),
}).required()

export const getCompanyWithJobsSchema = joi.object({
    companyId: generalRules.objectId.required(),
}).required()


export const searchCompanySchema = joi.object({
    name: joi.string().min(2).max(100).required().messages({
        "any.required": "Company name is required"
    })
})
export const uploadCompanyLogoSchema = joi.object({
    companyId: generalRules.objectId.required(),
    file: generalRules.file.required()
}).required()

export const uploadCompanyoverPicSchema = joi.object({
    companyId: generalRules.objectId.required(),
    file: generalRules.file.required()
}).required()


export const deleteCompanyLogoSchema = joi.object({
    companyId: generalRules.objectId.required(),

}).required()

export const deleteCompanyCoverPicSchema = joi.object({
    companyId: generalRules.objectId.required(),

}).required()