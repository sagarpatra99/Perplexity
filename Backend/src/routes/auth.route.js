import { Router } from "express";
import { controllerRegister, controllerLogin } from "../controllers/auth.controller.js"
import { validate } from "../middlewares/validate.middleware.js";
import { loginSchema, registerSchema } from "../validations/auth.validator.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), controllerRegister);
authRouter.post("/login", validate(loginSchema), controllerLogin);