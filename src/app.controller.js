import connectionDB from "./DB/DBconnection.js"
import companyRouter from "./modules/copmany/company.controller.js"

import userRouter from "./modules/user/user.controller.js"
import { globalErrorHandling } from "./utilits/error/errorHandling.js"
import { createHandler } from 'graphql-http/lib/use/express';
import {schema} from "./modules/schema.js"
import cors from "cors"
import path from "path"
import chatRouter from "./modules/chat/chat.controller.js"
import jopRouter from "./modules/job/jop.controller.js";
import { rateLimit } from 'express-rate-limit'
const limiter = rateLimit({
  limit:5,
  windowMs: 15 * 60 * 1000, 
  message: {error:"Too many requests from this IP, please try again in 15 minutes."},
  handler:
  (req, res, next) => {
    return next(new Error("Too many requests from this IP, please try again in 15 minutes.",{cause:429}))
  }
})


const bootstrap = (app, express) => {
    app.use(cors())
    app.use(limiter)
    app.use(express.json())
    connectionDB()
    app.use("/users",userRouter)
    app.use("/company",companyRouter)
    app.use("/jop",jopRouter)
    app.use("/chat",chatRouter)
    app.use('/graphql', createHandler({schema}));
    app.use("*", (req, res, next) => {
        return next(new Error(`no url found ${req.originalUrl}`))
    })
    app.use(globalErrorHandling)
}

export default bootstrap