import { Router } from "express";
import * as uploadCtrl from "./upload.controller.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const upload = uploadMiddleware("upload").single("file");

router.post("/", upload, uploadCtrl.uploadSingle);

export { router as UploadRoutes };
