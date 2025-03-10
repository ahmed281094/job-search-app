import joi from "joi";
import { generalRules } from "../../utilits/generalRules/index.js";


export const deleteJobSchema = joi.object({
    userId: generalRules.objectId.required(),
})