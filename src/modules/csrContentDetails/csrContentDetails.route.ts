import { Router } from "express";
import * as csrContentDetailCtrl from "./csrContentDetails.controller.js";
import {
  createcsrContentDetailSchema,
  updatecsrContentDetailSchema,
} from "./csrContentDetails.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("csrCommunities").fields([
  { name: "icon", maxCount: 1 },
]);

router.get("/", csrContentDetailCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createcsrContentDetailSchema),
  csrContentDetailCtrl.create,
);
router.get("/:id", csrContentDetailCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updatecsrContentDetailSchema),
  csrContentDetailCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("csrContentDetails").none(),
  csrContentDetailCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("csrContentDetails").none(),
  csrContentDetailCtrl.changeStatus,
);
router.delete("/:id", csrContentDetailCtrl.remove);

export { router as CsrContentDetailsRoutes };
