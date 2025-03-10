import userModel, { roleTypes } from "../../DB/models/user.model.js"

export const toggleBanUser = async (_, { id, adminId }) => {
    const admin = await userModel.findById(adminId);
    if ( admin.role !== roleTypes.admin) {
        throw new Error("Unauthorized: Only admins can ban or unban users");
    }
    const user = await userModel.findById(id)
    if (!user) throw new Error("User not found")
    const update = user.bannedAt ? { $unset: { bannedAt: "" } } : { bannedAt: new Date() }
    await userModel.findByIdAndUpdate(id, update, { new: true})
    return user.bannedAt ? "User unbanned successfully" : "User banned successfully"
}