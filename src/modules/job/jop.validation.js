import joi from "joi";
import { generalRules } from "../../utilits/generalRules/index.js";
import { jobLocationTypes, seniorityLevelTypes, workingTimeTypes } from "../../DB/models/jop.model.js";



export const addJopSchema = joi.object({
    companyId: generalRules.objectId.required(),
    jobTitle: joi.string().min(3).max(100).required(),
    jobLocation: joi.string().valid(jobLocationTypes.onsite,jobLocationTypes.remotely,jobLocationTypes.hybrid).required(),
    workingTime: joi.string().valid(workingTimeTypes.full_time,workingTimeTypes.part_time).required(),
    seniorityLevel: joi.string()
        .valid(seniorityLevelTypes.Fresh,
            seniorityLevelTypes.Junior,
            seniorityLevelTypes.CTO,
            seniorityLevelTypes.Team_Lead,
            seniorityLevelTypes.Mid_Level,
            seniorityLevelTypes.Senior
        )
        .required(),
    jobDescription: joi.string().min(10).max(1000).required(),
    technicalSkills: joi.array().items(joi.string().min(2).max(50)).min(1).required(),
    softSkills: joi.array().items(joi.string().min(2).max(50)).min(1).required()
})


export const updateJobSchema = joi.object({
    jobId: generalRules.objectId.required(),
    jobTitle: joi.string().min(3).max(100),
    jobLocation: joi.string().valid(jobLocationTypes.onsite,jobLocationTypes.remotely,jobLocationTypes.hybrid),
    workingTime: joi.string().valid(workingTimeTypes.full_time,workingTimeTypes.part_time),
    seniorityLevel: joi.string()
        .valid(seniorityLevelTypes.Fresh,
            seniorityLevelTypes.Junior,
            seniorityLevelTypes.CTO,
            seniorityLevelTypes.Team_Lead,
            seniorityLevelTypes.Mid_Level,
            seniorityLevelTypes.Senior
        ),
    jobDescription: joi.string().min(10).max(1000),
    technicalSkills: joi.array().items(joi.string().min(2).max(50)).min(1),
    softSkills: joi.array().items(joi.string().min(2).max(50)).min(1)
})



export const deleteJobSchema = joi.object({
    jobId: generalRules.objectId.required(),
})

export const applyToJobSchema = joi.object({
    jobId: generalRules.objectId.required(),
    file: generalRules.file.required()
}).required()


export const getApplicationsSchema = joi.object({
    jobId: generalRules.objectId.required(),
    page: joi.number().integer().min(1),
    limit: joi.number().integer().min(1),
    sort: joi.string()
}).required()


export const applicationStatusSchema = joi.object({
    applicationId: generalRules.objectId.required(),
    status: joi.string().valid("accepted", "rejected").required()
}).required()



export const getJobsSchema = joi.object({
    page: joi.number().integer().min(1),
    limit: joi.number().integer().min(1),
    sortBy: joi.string().valid("createdAt", "jobTitle", "workingTime"),
    order: joi.string().valid("asc", "desc"),
    workingTime: joi.string().valid(workingTimeTypes.full_time,workingTimeTypes.part_time),
    jobLocation: joi.string().valid(jobLocationTypes.onsite,jobLocationTypes.remotely,jobLocationTypes.hybrid),
    seniorityLevel: joi.string().valid(seniorityLevelTypes.Fresh,
        seniorityLevelTypes.Junior,
        seniorityLevelTypes.CTO,
        seniorityLevelTypes.Team_Lead,
        seniorityLevelTypes.Mid_Level,
        seniorityLevelTypes.Senior
    ),
    jobTitle: joi.string().min(2).max(100),
    technicalSkills: joi.string(),
}).required()