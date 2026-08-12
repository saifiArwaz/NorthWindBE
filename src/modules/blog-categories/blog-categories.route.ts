import { Router } from "express";
import * as blogCategoriesCtrl from "./blog-categories.controller.js";
import {
  createBlogCategoriesSchema,
  updateBlogCategoriesSchema,
} from "./blog-categories.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

router.get("/", blogCategoriesCtrl.getList);
router.post(
  "/",
  uploadMiddleware("blog-categories").none(),
  validate(createBlogCategoriesSchema),
  blogCategoriesCtrl.createBlogCategories,
);
router.get("/:id", blogCategoriesCtrl.getBlogCategoriesById);
router.patch(
  "/:id",
  uploadMiddleware("blog-categories").none(),
  validate(updateBlogCategoriesSchema),
  blogCategoriesCtrl.updateBlogCategoriesById,
);
router.patch(
  "/:id/status",
  uploadMiddleware("blog-categories").none(),
  blogCategoriesCtrl.changeStatus,
);
router.delete("/:id", blogCategoriesCtrl.deleteById);

export { router as BlogCategoriesRoutes };
