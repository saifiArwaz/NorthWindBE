import { Router } from "express";
import * as pageCtrl from "./page.controller.js";
import { createPageSchema, updatePageSchema } from "./page.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";
import { authenticate, authorize } from "../../middlewares/auth.middleware.js";

const router = Router();
const uploaded = uploadMiddleware("page").fields([
  { name: "desktop_file", maxCount: 1 },
  { name: "mobile_file", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
  { name: "mobile_thumbnail", maxCount: 1 },
]);

router.get("/distict-list", authenticate, pageCtrl.getDistictPageList);
router.get("/", pageCtrl.getAll);
router.get("/parent-stiemap", pageCtrl.getParentPages);
router.get("/list/:parentId", pageCtrl.getParentPages);
router.post("/", uploaded, validate(createPageSchema), pageCtrl.create);
router.get("/:id", pageCtrl.getOne);
router.patch("/:id", uploaded, validate(updatePageSchema), pageCtrl.update);
router.patch("/:id/seq", uploadMiddleware("page").none(), pageCtrl.changeSeq);

router.patch(
  "/:id/status",
  uploadMiddleware("page").none(),
  pageCtrl.changeStatus,
);
router.delete("/:id", pageCtrl.deleteById);

export { router as pageRoutes };
