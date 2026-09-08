import { Router } from "express";
import * as statesCtrl from "./states.controller.js";
import { createStateSchema, updateStateSchema } from "./states.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const upload = uploadMiddleware("states");

router.get("/", statesCtrl.getList);
router.post(
  "/",
  upload.none(),
  validate(createStateSchema),
  statesCtrl.createState,
);
router.get("/:id", statesCtrl.getStateById);
router.patch(
  "/:id",
  upload.none(),
  validate(updateStateSchema),
  statesCtrl.updateStateById,
);
router.patch("/:id/status", upload.none(), statesCtrl.changeStatus);
router.patch("/:id/seq", upload.none(), statesCtrl.changeSeq);
router.delete("/:id", statesCtrl.deleteById);

export { router as StateRoutes };
