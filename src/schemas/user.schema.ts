import { z } from "zod";

const strongPasswordRegex = new RegExp(
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
);

export const userRegistrationSchema = z.object({
  name: z.string({ error: "please enter name" }),
  email: z
    .string({
      error: "please enter an email",
    })
    .email({
      error: "please enter an email",
    }),
  password: z
    .string({ error: "please enter password" })
    .regex(strongPasswordRegex, {
      message:
        "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
    }),
  role: z.enum(["creator", "contestee"], {
    error: "please enter role ('creator', 'contestee')",
  }),
});

export const userLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().regex(strongPasswordRegex, {
    message:
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one digit, and one special character",
  }),
});
