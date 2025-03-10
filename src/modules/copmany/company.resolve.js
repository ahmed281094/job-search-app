import { companyModel } from "../../DB/models/company.model.js";
import userModel from "../../DB/models/user.model.js";


export const toggleBanCompany = async (_, { id, adminId }) => {
    const admin = await userModel.findById(adminId);
    if ( admin.role !== roleTypes.admin) {
        throw new Error("Unauthorized: Only admins can ban or unban users");
    }
    const company = await companyModel.findById(id);
    if (!company) throw new Error("Company not found");
    const update = company.bannedAt ? { $unset: { bannedAt: "" } } : { bannedAt: new Date() };
    await companyModel.findByIdAndUpdate(id, update, { new: true });
    return company.bannedAt ? "Company unbanned successfully" : "Company banned successfully";
}


export const approveCompany = async (_, { id, adminId }) => {
    const admin = await userModel.findById(adminId);
     if ( admin.role !== roleTypes.admin) {
         throw new Error("Unauthorized: Only admins can ban or unban users");
     }
    await companyModel.findByIdAndUpdate(id, { approvedByAdmin: true }, { new: true })
    return "Company approved successfully"
}
