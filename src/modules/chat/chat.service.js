import { chatModel } from "../../DB/models/chat.model.js";
import { asyncHandler } from "../../utilits/error/errorHandling.js";


export const getChatHistory = asyncHandler(async (req, res, next) => {
    const { userId } = req.params

    const chat = await chatModel.findOne({
        $or: [
            { senderId: req.user._id, receiverId: userId },
            { senderId: userId, receiverId: req.user._id }
        ]
    }).populate("messages.senderId", "firstName lastName")

    if (!chat) {
        return res.status(200).json({ message: "No chat history found", chat: [] })
    }
    return res.status(200).json({ message: "Chat history retrieved", chat })
})