import mongoose from "mongoose";
import { jobModel } from "./jop.model.js";

const companySchema = new mongoose.Schema(
    {
        companyName: {
            type: String,
            unique: true,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        industry: {
            type: String,
            required: true,
        },
        address: {
            type: String,
            required: true,
        },
        numberOfEmployees: {
            type: Number,
            required: true,
            min: 10,
            max: 20,
        },
        companyEmail: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        logo: {
            secure_url: String,
            public_id: String
        },
        coverPic: {
            secure_url: String,
            public_id: String
        },
        HRs: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },
        ],
        bannedAt: {
            type: Date
        },
        deletedAt: {
            type: Date
        },
        legalAttachment: {
            secure_url: String,
            public_id: String
        },
        approvedByAdmin: {
            type: Boolean,
            default: false,
        },
        isDeleted: Boolean,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
)
companySchema.virtual("jobs", {
    ref: "Job",
    localField: "_id",
    foreignField: "companyId"
})

companySchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    const companyId = this._id;
    const jobs = await jobModel.find({ companyId })
    const jobIds = jobs.map(job => job._id)

    await jobModel.deleteMany({ companyId })
    await applicationModel.deleteMany({ jobId: { $in: jobIds } })
    await chatModel.deleteMany({
        senderId: { $in: this.HRs },
        receiverId: { $in: this.HRs }
    })
    next()
})


export const companyModel = mongoose.model("Company", companySchema);

