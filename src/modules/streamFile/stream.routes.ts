import { Router } from "express";
import * as streamCtrl from "./stream.controller.js";

const router = Router();

router.post("/start", streamCtrl.startMultipart);
router.post("/part-url", streamCtrl.getPartUrl);
router.post("/complete", streamCtrl.completeMultipart);

export { router as StreamRoutes };
