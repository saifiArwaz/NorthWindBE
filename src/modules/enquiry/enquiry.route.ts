import { Router } from "express";
import * as enquiriesCtrl from "./enquiry.controller.js";

const router = Router();

router.get("/newsletter", enquiriesCtrl.getNewsletterEnquiry);
router.get("/job-application", enquiriesCtrl.getJobApplication);
router.get("/contact", enquiriesCtrl.getContactEnquiry);
router.get("/projects", enquiriesCtrl.getProjectEnquiry);
router.get("/floorplan-tower", enquiriesCtrl.getFloorplanTowerEnquiry);

router.get(
  "/download-job-resume/:id",
  enquiriesCtrl.downloadResumeJobApplication,
);

router.get("/land-owner-connect", enquiriesCtrl.getLandOwnerConnectEnquiry);

export { router as EnquiriesRoutes };
