import { z } from "zod";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username cannot exceed 20 characters")
    .trim(),

  email: z.string().email("Invalid email format").toLowerCase().trim(),

  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .refine(
      (val) =>
        /[A-Z]/.test(val) && // uppercase
        /[a-z]/.test(val) && // lowercase
        /[0-9]/.test(val) && // number
        /[^A-Za-z0-9]/.test(val), // special char
      {
        message:
          "Password must contain uppercase, lowercase, number, and special character",
      },
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase().trim(),

  password: z.string().min(6, "Password must be at least 6 characters"),
});
