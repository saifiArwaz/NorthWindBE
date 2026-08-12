import { Router } from "express";
import * as citiesCtrl from "./cities.controller.js";
import { createCitiesSchema, updateCitiesSchema } from "./cities.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploaded = uploadMiddleware("cities").fields([
  { name: "desktopFile", maxCount: 1 },
  { name: "mobileFile", maxCount: 1 },
  { name: "thumbnail", maxCount: 1 },
]);

router.get("/", citiesCtrl.getList);
router.post(
  "/",
  uploadMiddleware("cities").none(),
  validate(createCitiesSchema),
  citiesCtrl.createCities,
);
router.get("/:id", citiesCtrl.getCitiesById);
router.patch(
  "/:id",
  uploadMiddleware("cities").none(),
  validate(updateCitiesSchema),
  citiesCtrl.updateCitiesById,
);
router.patch(
  "/:id/status",
  uploadMiddleware("cities").none(),
  citiesCtrl.changeStatus,
);
router.delete("/:id", citiesCtrl.deleteById);

export { router as CitiesRoutes };
