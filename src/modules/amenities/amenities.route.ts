import { Router } from "express";
import * as amenitiesCtrl from "./amenities.controller.js";
import {
  createAmenitiesSchema,
  updateAmenitiesSchema,
} from "./amenities.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("amenities").fields([
  { name: "image", maxCount: 1 },
]);

router.get("/", amenitiesCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createAmenitiesSchema),
  amenitiesCtrl.create,
);
router.get("/:id", amenitiesCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updateAmenitiesSchema),
  amenitiesCtrl.update,
);
router.patch(
  "/:id/status",
  uploadMiddleware("amenities").none(),
  amenitiesCtrl.changeStatus,
);
router.delete("/:id", amenitiesCtrl.destroy);

export { router as AmenitiesRoutes };
