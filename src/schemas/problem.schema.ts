import z from "zod";

export const problemSubmitSchema = z.object({
  code: z.string({ error: "please enter code" }),
  language: z.string({ error: "please enter language" }),
});
