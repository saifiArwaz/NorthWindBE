import { Router } from "express";
import * as newsCtrl from "./news.controller.js";
import { createNewsSchema, updateNewsSchema } from "./news.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploaded = uploadMiddleware("news").single("logo");

router.get("/", newsCtrl.getAll);
router.post("/", uploaded, validate(createNewsSchema), newsCtrl.create);
router.get("/:id", newsCtrl.getOne);
router.patch("/:id", uploaded, validate(updateNewsSchema), newsCtrl.update);
router.patch(
  "/:id/status",
  uploadMiddleware("news").none(),
  newsCtrl.changeStatus,
);
router.delete("/:id", newsCtrl.remove);

export { router as NewsRoutes };
