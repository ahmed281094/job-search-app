import { Server } from "socket.io";
import { chatModel } from "../../DB/models/chat.model.js";


export const socketService = (server) => {
    const io = new Server(server, {
        cors: { origin: "*" } 
    })
    io.on("connection", (socket) => {
        console.log("User connected:", socket.id)
        socket.on("joinChat", ({ senderId, receiverId }) => {
            const room = [senderId, receiverId].sort().join("_")
            socket.join(room)
            console.log(`${senderId} joined room: ${room}`)
        })
        socket.on("sendMessage", async ({ senderId, receiverId, message }) => {
            const room = [senderId, receiverId].sort().join("_")
            const existingChat = await chatModel.findOne({
                $or: [
                    { senderId, receiverId },
                    { senderId: receiverId, receiverId: senderId }
                ]
            })

            if (!existingChat && !isHRorOwner(senderId)) {
                socket.emit("errorMessage", "Only HR or Company Owner can start a chat.")
                return
            }
             await chatModel.findOneAndUpdate(
                {
                    $or: [
                        { senderId, receiverId },
                        { senderId: receiverId, receiverId: senderId }
                    ]
                },
                {
                    $push: { messages: { message, senderId } }
                },
                { new: true, upsert: true }
            )
            io.to(room).emit("newMessage", { senderId, message })
        })
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id)
        })
    })
}
