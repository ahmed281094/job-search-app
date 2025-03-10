import { Router } from "express";

import { validation } from "../../middleWare/validation.js";
import { authentcation } from "../../middleWare/auth.js";
import { getChatHistory } from "./chat.service.js";

const chatRouter = Router()




chatRouter.get("/:userId", authentcation, getChatHistory);

export default chatRouter