import dotenv from "dotenv"
import path from "path"
dotenv.config({path:path.resolve("src/config/.env")})
import express from 'express'
import bootstrap from "./src/app.controller.js"
import { socketService } from "./src/modules/chat/socketio.js"
const app = express()
const port = process.env.PORT 
bootstrap(app,express)
app.get('/', (req, res) => res.send('Hello World!'))
const httpServer = app.listen(port, () => 
    console.log(`Server running on port ${port}`)
  )
  
  socketService(httpServer)