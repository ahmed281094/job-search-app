import { asyncHandler } from "../utilits/error/errorHandling.js"


export const validation = (schema) => {
    return asyncHandler(async (req, res, next) => {
        const inputData = { ...req.body, ...req.query, ...req.params };
      
        if (req?.file) {
            inputData.file = req.file; 
        }

        if (req?.files?.profilePic) {
            inputData.profilePic = req.files.profilePic[0]
        }

        if (req?.files?.coverPic) {
            inputData.coverPic = req.files.coverPic[0]
        }

        if (req?.files?.logo) {
            inputData.logo = req.files.logo[0]
        }
        if (req?.files?.legalAttachment) {
            inputData.legalAttachment = req.files.legalAttachment[0]
        }
    
        const result = schema.validate(inputData, { abortEarly: false });
        if (result?.error) {
            return res.status(400).json({ msg: "Validation error", errors: result.error.details });
        }
        next();
    });
}
