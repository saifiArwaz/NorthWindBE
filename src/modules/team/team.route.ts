import { Router } from "express";
import * as teamCtrl from "./team.controller.js";
import { createTeamSchema, updateTeamSchema } from "./team.schema.js";
import { validate } from "../../middlewares/validate.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

const uploaded = uploadMiddleware("team").fields([
  { name: "image", maxCount: 1 },
]);

router.get("/", teamCtrl.getAll);
router.post("/", uploaded, validate(createTeamSchema), teamCtrl.create);
router.get("/:id", teamCtrl.getOne);
router.patch("/:id", uploaded, validate(updateTeamSchema), teamCtrl.update);
router.patch("/:id/seq", uploadMiddleware("team").none(), teamCtrl.changeSeq);
router.patch(
  "/:id/isFounder",
  uploadMiddleware("team").none(),
  teamCtrl.changeTeamFounder,
);
router.patch(
  "/:id/status",
  uploadMiddleware("team").none(),
  teamCtrl.changeStatus,
);
router.delete("/:id", teamCtrl.destroy);

export { router as TeamRoutes };
