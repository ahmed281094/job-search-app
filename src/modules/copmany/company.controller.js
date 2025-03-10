import { Router } from "express";
import { authentcation } from "../../middleWare/auth.js";
import { validation } from "../../middleWare/validation.js";
import * as CS from "./company.service.js";
import * as CV from "./company.validation.js";
import { fileTypes, multerHost } from "../../middleWare/multer.js";

const companyRouter = Router()


companyRouter.post(
    "/addCompany",
    multerHost([...fileTypes.image, ...fileTypes.pdf]).fields([
        { name: "logo", maxCount: 1 },
        { name: "coverPic", maxCount: 1 },
        { name: "legalAttachment", maxCount: 1 },
    ]),
    authentcation,
    validation(CV.addCompanySchema),
    CS.addCompany
)

    companyRouter.patch(
        "/update/:companyId",
        validation(CV.updateCompanySchema),
        authentcation,
        multerHost(fileTypes.image).fields([{ name: "coverPic", maxCount: 1 }, { name: "logo" , maxCount: 1}]),
        CS.updateCompany
    )

    companyRouter.delete(
        "/freeze/:companyId",
        validation(CV.freezeCompanySchema),
        authentcation,
        CS.freezeCompany
    )

    companyRouter.get(
        "/getCompanyWithJobs/:companyId",
        validation(CV.getCompanyWithJobsSchema),
        authentcation,
        CS.getCompanyWithJobs
    )

    companyRouter.get(
        "/searchCompany",
        validation(CV.searchCompanySchema),
        authentcation,
        CS.searchCompany
    )

    companyRouter.patch(
        "/upload-logo/:companyId",
        authentcation,
        multerHost(fileTypes.image).single("logo"),
        validation(CV.uploadCompanyLogoSchema),
        CS.uploadCompanyLogo
    )

    companyRouter.patch(
        "/upload-coverPic/:companyId",
        authentcation,
        multerHost(fileTypes.image).single("coverPic"),
        validation(CV.uploadCompanyoverPicSchema),
        CS.uploadCompanyCoverPic
    )

    companyRouter.delete(
        "/delete-logo/:companyId",
        authentcation,
        validation(CV.deleteCompanyLogoSchema),
        CS.deleteCompanyLogo
    )
    companyRouter.delete(
        "/deleteCoverPic/:companyId",
        authentcation,
        validation(CV.deleteCompanyCoverPicSchema),
        CS.deleteCompanyCoverPic
    )
export default companyRouter