import { Router } from "express";
import * as menuCtrl from "./menu.controller.js";
import { createMenuItemSchema, updateMenuItemSchema } from "./menu.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("menu").none();

router.get("/", menuCtrl.getAll);
router.post("/", uploaded, validate(createMenuItemSchema), menuCtrl.create);
router.get("/:id", menuCtrl.getOne);
router.patch("/:id", uploaded, validate(updateMenuItemSchema), menuCtrl.update);
router.patch("/:id/seq", uploadMiddleware("menu").none(), menuCtrl.changeSeq);

router.delete("/:id", menuCtrl.destroy);

export { router as menuItemRoutes };
