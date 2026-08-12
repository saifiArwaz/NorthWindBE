import { Router } from "express";
import { validate } from "../../middlewares/validate.js";
import * as enquiryFlowCtrl from "./enquiry-flow.controller.js";
import {
  enquiryFlowPlatterSchema,
  enquiryFlowLocationSchema,
  enquiryFlowBudgetSchema,
  enquiryFlowProjectsSchema,
} from "./enquiry-flow.schema.js";

const router = Router();

router.get(
  "/platters",
  validate(enquiryFlowPlatterSchema),
  enquiryFlowCtrl.getPlatters,
);
router.get(
  "/locations",
  validate(enquiryFlowLocationSchema),
  enquiryFlowCtrl.getLocations,
);
router.get(
  "/budgets",
  validate(enquiryFlowBudgetSchema),
  enquiryFlowCtrl.getBudgets,
);
router.get(
  "/projects",
  validate(enquiryFlowProjectsSchema),
  enquiryFlowCtrl.getProjects,
);

export { router as EnquiryFlowRoutes };
