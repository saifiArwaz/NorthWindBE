import { Router } from "express";
import * as seoCtrl from "./seo.controller.js";
import { validate } from "../../middlewares/validate.js";
import multer from "multer";

const router = Router();
const upload = multer();

router.get("/footer-links", seoCtrl.getSeoFooterLinks);
router.get("/:slug", seoCtrl.getSeoPage);

export { router as SeoRoutes };
