import { Router } from "express";
import * as citiesContentDetailCtrl from "./citiesContentDetails.controller.js";
import {
  createcitiesContentDetailSchema,
  updatecitiesContentDetailSchema,
} from "./citiesContentDetails.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("citiesContentDetails").fields([
  { name: "image", maxCount: 1 },
]);

router.get("/:type/list", citiesContentDetailCtrl.getAll);
router.post(
  "/",
  uploaded,
  validate(createcitiesContentDetailSchema),
  citiesContentDetailCtrl.create,
);
router.get("/:id", citiesContentDetailCtrl.getOne);
router.patch(
  "/:id",
  uploaded,
  validate(updatecitiesContentDetailSchema),
  citiesContentDetailCtrl.update,
);
router.patch(
  "/:id/seq",
  uploadMiddleware("citiesContentDetails").none(),
  citiesContentDetailCtrl.changeSeq,
);
router.patch(
  "/:id/status",
  uploadMiddleware("citiesContentDetails").none(),
  citiesContentDetailCtrl.changeStatus,
);
router.delete("/:id", citiesContentDetailCtrl.remove);

export { router as CitiesContentDetailsRoutes };
