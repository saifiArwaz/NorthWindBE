import { Router } from "express";
import * as brandsCtrl from "./brands.controller.js";
import { createBrandsSchema, updateBrandsSchema } from "./brands.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("brands").fields([
  { name: "logo", maxCount: 10 },
]);

router.get("/", brandsCtrl.getAll);
router.post("/", uploaded, validate(createBrandsSchema), brandsCtrl.create);
router.get("/:id", brandsCtrl.getOne);
router.patch("/:id", uploaded, validate(updateBrandsSchema), brandsCtrl.update);
router.patch(
  "/:id/status",
  uploadMiddleware("brands").none(),
  brandsCtrl.changeStatus,
);
router.delete("/:id", brandsCtrl.destroy);

export { router as BrandsRoutes };
