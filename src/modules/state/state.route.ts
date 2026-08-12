import { Router } from "express";
import * as stateCtrl from "./state.controller.js";
import { createStateSchema, updateStateSchema } from "./state.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploaded = uploadMiddleware("state").none();

router.get("/", stateCtrl.getList);
router.post("/", uploaded, validate(createStateSchema), stateCtrl.createState);
router.get("/:id", stateCtrl.getStateById);
router.patch(
  "/:id",
  uploaded,
  validate(updateStateSchema),
  stateCtrl.updateStateById,
);
router.patch(
  "/:id/status",
  uploadMiddleware("state").none(),
  stateCtrl.changeStatus,
);
router.delete("/:id", stateCtrl.deleteById);

export { router as StateRoutes };
