
import mongoose from "mongoose";

export const jobLocationTypes = {
    onsite: 'onsite',
    remotely: 'remotely',
    hybrid: 'hybrid'
}

export const workingTimeTypes = {
    part_time: 'part_time',
    full_time: 'full_time'
    
}

export const seniorityLevelTypes = {
    Fresh: 'Fresh',
    Junior: 'Junior',
    Mid_Level: 'Mid-Level',
    Senior: 'Senior',
    Team_Lead: 'Team-Lead',
    CTO: 'CTO'
 
    
}



const jobSchema = new mongoose.Schema(
    {
        jobTitle: { type: String, required: true, trim: true },
        jobLocation: { type: String, enum: Object.values(jobLocationTypes), required: true },
        workingTime: { type: String, enum: Object.values(workingTimeTypes), required: true },
        seniorityLevel: {
            type: String,
            enum:Object.values(seniorityLevelTypes),
            required: true
        },
        jobDescription: { type: String, required: true },
        technicalSkills: { type: [String], required: true },
        softSkills: { type: [String], required: true },
        addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "HRs", required: true },
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "HRs" },
        closed: { type: Boolean, default: false },
        companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true }
    },
    { timestamps: true }
)


jobSchema.pre("deleteOne", { document: true, query: false }, async function (next) {
    const jobId = this._id;
    await applicationModel.deleteMany({ jobId })
    next()
})


export const jobModel = mongoose.model("Job", jobSchema)
