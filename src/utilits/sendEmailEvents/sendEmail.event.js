import { EventEmitter } from "events";
import { sendEmail } from "../../service/sendMail.js";
import { nanoid,customAlphabet } from "nanoid";
import { Hash } from "../encryption/index.js";
import userModel, { OTPtypes } from "../../DB/models/user.model.js";
import { html } from "../../service/templateHtml-Email.js";



export const eventEmitter = new EventEmitter()



eventEmitter.on("sendEmailConfirmation", async (data) => {
    const { email } = data;
    const otp = customAlphabet("0123456789",4)()
   const hash = await Hash({ key: otp, SALT_ROUNDS: process.env.SALT_ROUNDS })
   await userModel.updateOne({email},{ 
    $push: { OTP: { code: hash, type: OTPtypes.confirmEmail, expiresIn: new Date(Date.now() + 10 * 60 * 1000) } }  
})
    await sendEmail(email, "confirm email", html({code:otp,message:"confirm email" }))
})



eventEmitter.on("forgetPassword", async (data) => {
    const { email,id } = data;
    const otp = customAlphabet("0123456789",4)()
   const hash = await Hash({ key: otp, SALT_ROUNDS: process.env.SALT_ROUNDS })
   await userModel.updateOne({email},{ 
    $push: { OTP: { code: hash, type: OTPtypes.forgetPassword, expiresIn: new Date(Date.now() + 10 * 60 * 1000) } }  
})
    await sendEmail(email, "forget password", html({code:otp,message:"Forgot password"}))
})
