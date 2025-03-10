import { applicationModel } from "../../DB/models/application.model.js";
import { companyModel } from "../../DB/models/company.model.js";
import { jobModel } from "../../DB/models/jop.model.js";
import { roleTypes } from "../../DB/models/user.model.js";
import { sendEmail } from "../../service/sendMail.js";
import cloudinary from "../../utilits/cloudinary/index.js";
import { asyncHandler } from "../../utilits/error/errorHandling.js";
import { pagination } from "../../utilits/featurs/pagination.js";
import { Server } from "socket.io";

export const addJob = asyncHandler(async (req, res, next) => {
    const { companyId, jobTitle, jobLocation, workingTime, seniorityLevel, jobDescription, technicalSkills, softSkills } = req.body
    const company = await companyModel.findById(companyId)
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    }
    if (!company.approvedByAdmin) {
        return next(new Error("Company is not approved by admin. Job posting is not allowed.", { cause: 403 }))
    }
    const isOwner = company.createdBy.toString() === req.user._id.toString()
    const isHR = company.HRs?.some(hrId => hrId.toString() === req.user._id.toString())
    if (!isOwner && !isHR) {
        return next(new Error("Unauthorized: Only company owner or HR can create jobs", { cause: 403 }))
    }
    const job = await jobModel.create({
        companyId,
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
        addedBy: req.user._id
    })

    return res.status(201).json({ message: "Job added successfully", job })
})

export const updateJob = asyncHandler(async (req, res, next) => {
    const { jobId } = req.params
    const job = await jobModel.findById(jobId)

    if (!job) {
        return next(new Error("job not found or unauthorized", { cause: 403 }))
    }
    if (job.addedBy.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized: Only the job creator can update this job", { cause: 403 }));
    }

    const updatedJob = await jobModel.findByIdAndUpdate(
        jobId,
        req.body,
        { new: true }
    )

    return res.status(200).json({ message: "job updated successfully", updatedJob });
})


export const deleteJob = asyncHandler(async (req, res, next) => {
    const { jobId } = req.params
    const job = await jobModel.findById(jobId);
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }))
    }
    const company = await companyModel.findById(job.companyId)
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    }
    const isHR = company.HRs?.some(hrId => hrId.toString() === req.user._id.toString())
    if (!isHR) {
        return next(new Error("Unauthorized: Only company HRs can delete this job", { cause: 403 }))
    }
    await jobModel.findByIdAndDelete(jobId)

    return res.status(200).json({ message: "Job deleted successfully" })
})





export const applyToJob = asyncHandler(async (req, res, next) => {
    const { jobId } = req.body
    if (req.user.role !== roleTypes.user) {
        return next(new Error("Only users can apply for jobs", { cause: 403 }))
    }

    const job = await jobModel.findById(jobId)
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }))
    }

    const company = await companyModel.findById(job.companyId)
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    }

    if (!req.file) {
        return next(new Error("Please upload a PDF CV", { cause: 400 }))
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: "jobSearch/applications",
        resource_type: "auto"
    })
    const application = await applicationModel.create({
        jobId,
        userId: req.user._id,
        userCV: { secure_url, public_id }
    })
    const io = new Server(req.app.get("server"), { cors: { origin: "*" } })
    company.HRs.forEach(hrId => {
        io.to(hrId.toString()).emit("newApplication", { jobId, userId: req.user._id })
    })

    return res.status(201).json({ message: "Application submitted successfully", application })
})



export const getApplicationsForJob = asyncHandler(async (req, res, next) => {
    const { jobId } = req.params;
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query
    const job = await jobModel.findById(jobId)
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }))
    }
    const company = await companyModel.findById(job.companyId)
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    }
    const isOwner = company.createdBy.toString() === req.user._id.toString()
    const isHR = company.HRs?.some(hrId => hrId.toString() === req.user._id.toString())
    if (!isOwner && !isHR) {
        return next(new Error("Unauthorized: Only company owner or HRs can view applications", { cause: 403 }))
    }
    const { data, totalCount } = await pagination({
        model: applicationModel,
        filter: { jobId },
        populate: ["userData"],
        page,
        limit,
        sort
    })

    return res.status(200).json({
        message: "Applications retrieved successfully",
        totalCount,
        page,
        limit,
        applications: data
    })
})



export const acceptOrRejectApplication = asyncHandler(async (req, res, next) => {
    const { applicationId } = req.params
    const { status } = req.body
    if (!["accepted", "rejected"].includes(status)) {
        return next(new Error("Invalid status. Use 'accepted' or 'rejected'", { cause: 400 }))
    }
    const application = await applicationModel.findById(applicationId).populate("userId")
    if (!application) {
        return next(new Error("Application not found", { cause: 404 }))
    }

    const job = await jobModel.findById(application.jobId)
    if (!job) {
        return next(new Error("Job not found", { cause: 404 }))
    }
    const company = await companyModel.findById(job.companyId)
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    }
    const isHR = company.HRs?.some(hrId => hrId.toString() === req.user._id.toString())
    if (!isHR) {
        return next(new Error("Unauthorized: Only company HRs can update applications", { cause: 403 }))
    }
    await applicationModel.findByIdAndUpdate(applicationId, { status }, { new: true });
    const emailSubject = status === "accepted" ? "Job Application Accepted" : "Job Application Rejected";
    const emailMessage = status === "accepted"
        ? `Dear ${application.userId.firstName}, Congratulations! Your application for ${job.jobTitle} has been accepted.`
        : `Dear ${application.userId.firstName}, We regret to inform you that your application for ${job.jobTitle} has been rejected.`;

    await sendEmail(application.userId.email, emailSubject, emailMessage)

    return res.status(200).json({ message: `Application ${status} successfully` })
})


export const getJobs = asyncHandler(async (req, res, next) => {
    const { page = 1, limit = 10, sortBy = "createdAt", order = "desc", ...filters } = req.query
    
    let query = {}
    if (filters.workingTime) query.workingTime = filters.workingTime;
    if (filters.jobLocation) query.jobLocation = filters.jobLocation;
    if (filters.seniorityLevel) query.seniorityLevel = filters.seniorityLevel;
    if (filters.jobTitle) query.jobTitle = { $regex: filters.jobTitle, $options: "i" };
    if (filters.technicalSkills) query.technicalSkills = { $in: filters.technicalSkills.split(",") }

    const totalJobs = await jobModel.countDocuments(query)
    const jobs = await jobModel
        .find(query)
        .sort({ [sortBy]: order === "asc" ? 1 : -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit));

    return res.status(200).json({
        message: "Jobs retrieved successfully",
        totalJobs,
        currentPage: Number(page),
        totalPages: Math.ceil(totalJobs / limit),
        jobs
    })
})
