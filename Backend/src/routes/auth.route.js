import { Router } from "express";
import { controllerRegister, controllerLogin, controllerVerifyEmail, controllerGetMe } from "../controllers/auth.controller.js"
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validations/auth.validator.js";
import { identifyUser } from "../middlewares/auth.middleware.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), controllerRegister);
authRouter.post("/login", validate(loginSchema), controllerLogin);
authRouter.get("/verify-email", controllerVerifyEmail)
authRouter.get("/get-me", identifyUser, controllerGetMe)