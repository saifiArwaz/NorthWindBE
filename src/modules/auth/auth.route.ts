import { Router } from "express";
import * as authCtrl from "./auth.controller.js";
import { validate } from "../../middlewares/validate.js";
import { registerSchema, loginSchema } from "./auth.schema.js";

const router = Router();

router.post("/register", validate(registerSchema), authCtrl.register);
router.post("/login", validate(loginSchema), authCtrl.login);
router.post("/refresh", authCtrl.refreshToken);
router.post("/logout", authCtrl.logout);
// router.post("/update-password", authCtrl.updatePassword)
export { router as authRoutes };
