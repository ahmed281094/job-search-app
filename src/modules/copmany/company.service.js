import { companyModel } from "../../DB/models/company.model.js";
import { asyncHandler } from "../../utilits/error/errorHandling.js";
import cloudinary from "../../utilits/cloudinary/index.js"
import { roleTypes } from "../../DB/models/user.model.js";


export const addCompany = asyncHandler(async (req, res, next) => {
    const { HRs, companyName, companyEmail, description, industry, address, numberOfEmployees } = req.body
    if (!req.files || !req.files.logo || !req.files.coverPic || !req.files.legalAttachment) {
        return next(new Error("Please upload a logo, coverPic, and legalAttachment", { cause: 400 }));
    }
    const existingCompany = await companyModel.findOne({
        $or: [{ companyName }, { companyEmail }],
    })
    if (existingCompany) {
        return next(new Error("Company name or email already exists", { cause: 400 }))
    }
    const logoUpload = await cloudinary.uploader.upload(req.files.logo[0].path, {
        folder: "jobSearch/users",
    })
    const coverPicUpload = await cloudinary.uploader.upload(req.files.coverPic[0].path, {
        folder: "jobSearch/users",
    })

    const legalAttachment = await cloudinary.uploader.upload(req.files.legalAttachment[0].path, {
        folder: "jobSearch/users",
    })
    const newCompany = await companyModel.create({
        companyName,
        description,
        industry,
        address,
        numberOfEmployees,
        companyEmail,
        createdBy: req.user._id,
        HRs,
        logo: {
            secure_url: logoUpload.secure_url,
            public_id: logoUpload.public_id,
        },
        coverPic: {
            secure_url: coverPicUpload.secure_url,
            public_id: coverPicUpload.public_id,
        },
        legalAttachment: {
            secure_url: legalAttachment.secure_url,
            public_id: legalAttachment.public_id
        },
    })

    return res.status(201).json({
        message: "Company added successfully",
        newCompany,
    })
})


export const updateCompany = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params
    const company = await companyModel.findOne({ _id: companyId, createdBy: req.user._id })

    if (!company) {
        return next(new Error("Company not found or unauthorized", { cause: 403 }))
    }

    if (req.files?.logo) {
        await cloudinary.uploader.destroy(company.logo.public_id)
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.logo[0].path, {
            folder: "jobSearch/companies",
        })
        req.body.logo = { secure_url, public_id }
    }
    if (req.files?.coverPic) {
        await cloudinary.uploader.destroy(company.coverPic.public_id)
        const { secure_url, public_id } = await cloudinary.uploader.upload(req.files.coverPic[0].path, {
            folder: "jobSearch/companies",
        })
        req.body.coverPic = { secure_url, public_id }
    }
    if (req.body?.legalAttachment) {
        return next(new Error("You cannot update the legal attachment", { cause: 400 }))
    }

    const updatedCompany = await companyModel.findByIdAndUpdate(
        companyId,
        req.body,
        { new: true }
    )

    return res.status(200).json({ message: "Company updated successfully", updatedCompany });
})

export const freezeCompany = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params
    const condition = req.user.role === roleTypes.admin
        ? { _id: companyId, isDeleted: { $exists: false } }
        : { _id: companyId, createdBy: req.user._id, isDeleted: { $exists: false } }
    const company = await companyModel.findOneAndUpdate(
        condition,
        { isDeleted: true, deletedAt: Date.now() },
        { new: true }
    )
    if (!company) {
        return next(new Error("Company not found or already deleted", { cause: 404 }))
    }
    return res.status(200).json({ message: "Company soft deleted successfully", company })
})

export const getCompanyWithJobs = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params

    const company = await companyModel.findOne({ _id: companyId, isDeleted: { $ne: true } }).populate("jobs")

    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    }
    return res.status(200).json({ message: "Success", company })
})


export const searchCompany = asyncHandler(async (req, res, next) => {
    const { name } = req.query;

    if (!name) {
        return next(new Error("Company name is required for search", { cause: 400 }))
    }

    const company = await companyModel.findOne({
        companyName: { $regex: name, $options: "i" },
        isDeleted: { $ne: true }
    })

    if (company.length === 0) {
        return res.status(404).json({ message: "No company found" })
    }

    return res.status(200).json({ message: "done", company })
})

export const uploadCompanyLogo = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params
    const company = await companyModel.findOne({
        _id: companyId,
        createdBy: req.user._id
    })
    if (!company) {
        return next(new Error("Company not found or unauthorized", { cause: 403 }))
    }
    if (company.logo?.public_id) {
        await cloudinary.uploader.destroy(company.logo.public_id);
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: "jobSearch/companies"
    })
    company.logo = { secure_url, public_id }
    await company.save()

    return res.status(200).json({ message: "Company logo updated successfully", logo: company.logo })
})


export const uploadCompanyCoverPic = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params
    const company = await companyModel.findOne({
        _id: companyId,
        createdBy: req.user._id
    })
    if (!company) {
        return next(new Error("Company not found or unauthorized", { cause: 403 }))
    }
    if (company.coverPic?.public_id) {
        await cloudinary.uploader.destroy(company.coverPic.public_id);
    }
    const { secure_url, public_id } = await cloudinary.uploader.upload(req.file.path, {
        folder: "jobSearch/companies"
    })
    company.coverPic = { secure_url, public_id }
    await company.save()

    return res.status(200).json({ message: "Company coverPic updated successfully", coverPic: company.coverPic })
})


export const deleteCompanyLogo = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params;

    const company = await companyModel.findById(companyId);
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }));
    }

    if (company.createdBy.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized! Only the company owner can delete the logo", { cause: 403 }));
    }

    if (!company.logo?.public_id) {
        return next(new Error("No logo to delete", { cause: 400 }))
    }
    await cloudinary.uploader.destroy(company.logo.public_id);
    await companyModel.findByIdAndUpdate(
        companyId,
        { logo: { secure_url: "", public_id: "" } },
        { new: true }
    )

    return res.status(200).json({ message: "Company logo deleted successfully" })
})



export const deleteCompanyCoverPic = asyncHandler(async (req, res, next) => {
    const { companyId } = req.params

    const company = await companyModel.findById(companyId)
    if (!company) {
        return next(new Error("Company not found", { cause: 404 }))
    }

    if (company.createdBy.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized! Only the company owner can delete the logo", { cause: 403 }))
    }

    if (!company.coverPic?.public_id) {
        return next(new Error("No coverPic to delete", { cause: 400 }))
    }
    await cloudinary.uploader.destroy(company.coverPic.public_id)
    await companyModel.findByIdAndUpdate(
        companyId,
        { coverPic: { secure_url: "", public_id: "" } },
        { new: true }
    )

    return res.status(200).json({ message: "Company coverPic deleted successfully" })
})



