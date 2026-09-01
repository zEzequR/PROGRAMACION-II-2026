import multer from "multer";
import { filePath } from '../config/uploadsPath.js'

export const upload = multer(
    {
        dest: filePath,
        limits: { fileSize: 1000 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            const permitidos = [
                "application/pdf",
                "application/zip",
                "image/png",
                "image/jpeg",
                "text/plain",
                "text/markdown",
                "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ];

            if (!permitidos.includes(file.mimetype)) {
                return cb(new Error("Tipo de archivo no permitido"));
            }
            cb(null, true);
        },
    }
);