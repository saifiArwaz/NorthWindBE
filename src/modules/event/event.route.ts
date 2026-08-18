import { Router } from "express";
import * as eventController from "./event.controller.js";
import { validate } from "../../middlewares/validate.js";
import { eventSchema } from "./event.schema.js";
import { uploadMiddleware } from "../../middlewares/multer-s3.middleware.js";

const router = Router();

router.post("/", uploadMiddleware("events").none(), validate(eventSchema.create), eventController.create);
router.get("/", eventController.getAll);
router.get("/:id", eventController.getOne);
router.patch("/:id", uploadMiddleware("events").none(), validate(eventSchema.update), eventController.update);
router.patch("/status/:id", uploadMiddleware("events").none(), validate(eventSchema.changeStatus), eventController.changeStatus);
router.patch("/seq/:id", uploadMiddleware("events").none(), validate(eventSchema.changeSeq), eventController.changeSeq);
router.delete("/:id", eventController.destroy);

export { router as eventRoutes };
