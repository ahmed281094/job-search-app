import { Router } from "express";
import * as JC from "./jop.service.js";
import * as JV from "./jop.validation.js";
import { validation } from "../../middleWare/validation.js";
import { authentcation } from "../../middleWare/auth.js";
import { fileTypes, multerHost } from "../../middleWare/multer.js";

const jopRouter = Router()

jopRouter.post('/addJob',
    validation(JV.addJopSchema),
    authentcation,
    JC.addJob
)
jopRouter.patch("/updateJob/:jobId",validation(JV.updateJobSchema), authentcation, JC.updateJob)
jopRouter.delete("/delete/:jobId",validation(JV.deleteJobSchema), authentcation, JC.deleteJob)

jopRouter.post(
    "/apply",
    authentcation,
    multerHost(fileTypes.pdf).single("userCV"),
    validation(JV.applyToJobSchema),
    JC.applyToJob
)

jopRouter.get(
    "/:jobId/applications",
    authentcation,
    validation(JV.getApplicationsSchema),
    JC.getApplicationsForJob
)

jopRouter.patch(
    "/application/:applicationId",
    authentcation,
    validation(JV.applicationStatusSchema),
    JC.acceptOrRejectApplication
)
jopRouter.get("/jobs", authentcation,validation(JV.getJobsSchema), JC.getJobs);


export default jopRouter