import multer from "multer"
export const fileTypes = {
    image: ["image/jpeg", "image/png", "image/gif"],
    pdf: ["application/pdf"],
    doc: ["application/msword"],
    docx: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    video: ["video/mp4"],
    audio: ["audio/mp3"],
    zip: ["application/zip"]
}



export const multerHost = (customValidation = []) => {
    const storage = multer.diskStorage({})
    function fileFilter(req, file, cb) {
        if (customValidation.includes(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error('InValid file format', false))
        }
    }
    const upload = multer({ storage, fileFilter })
    return upload
}


