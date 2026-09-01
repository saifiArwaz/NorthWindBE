import { Router } from "express";
import * as csrCategoryCtrl from "./csrCategory.controller.js";
import { validate } from "../../middlewares/validate.js";
import { createCsrCategorySchema, updateCsrCategorySchema } from "./csrCategory.schema.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploaded = uploadMiddleware();

router.get("/", csrCategoryCtrl.getAll);
router.post("/", validate(createCsrCategorySchema), uploaded.none(), csrCategoryCtrl.create);
router.get("/:id", csrCategoryCtrl.getOne);
router.patch("/:id", validate(updateCsrCategorySchema), uploaded.none(), csrCategoryCtrl.update);
router.patch("/:id/seq", uploaded.none(), csrCategoryCtrl.changeSeq);
router.patch("/:id/status", uploaded.none(), csrCategoryCtrl.changeStatus);
router.delete("/:id", csrCategoryCtrl.remove);

export { router as CsrCategoryRoutes };
