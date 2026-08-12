import { Router } from "express";
import * as countryCtrl from "./country.controller.js";
import { createCountrySchema, updateCountrySchema } from "./country.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();
const uploaded = uploadMiddleware("country").none();

router.get("/", countryCtrl.getList);
router.post(
  "/",
  uploaded,
  validate(createCountrySchema),
  countryCtrl.createCountry,
);
router.get("/:id", countryCtrl.getCountryById);
router.patch(
  "/:id",
  uploaded,
  validate(updateCountrySchema),
  countryCtrl.updateCountryById,
);
router.patch(
  "/:id/status",
  uploadMiddleware("country").none(),
  countryCtrl.changeStatus,
);
router.delete("/:id", countryCtrl.deleteById);

export { router as CountryRoutes };
