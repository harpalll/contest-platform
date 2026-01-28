import { string, z } from "zod";

export const createContestSchema = z
  .object({
    title: z.string({ error: "please enter title" }),
    description: z.string({
      error: "please enter description",
    }),
    startTime: z.string({ error: "please enter starttime" }),
    endTime: z.string({ error: "please enter endTime" }),
  })
  .refine((data) => new Date(data.endTime) >= new Date(data.startTime), {
    message: "endTime must be after startTime",
    path: ["endTime"],
  });

export const createMcqSchema = z.object({
  questionText: z.string({ error: "please enter title" }),
  options: z.array(z.string()),
  correctOptionIndex: z.number({ error: "please enter correctOptionIndex" }),
  points: z.number({ error: "please enter points" }),
});

export const submitMcqSchema = z.object({
  selectedOptionIndex: z.number({ error: "please enter correctOptionIndex" }),
});

export const createDsaSchema = z.object({
  title: z.string({ error: "please enter title" }),
  description: z.string({ error: "please enter description" }),
  tags: z.array(z.string()),
  points: z.number({ error: "please enter points" }),
  timeLimit: z.number({ error: "please enter time limit" }),
  memoryLimit: z.number({ error: "please enter memory limit" }),
  testCases: z.array(
    z.object({
      input: z.string({ error: "please enter input" }),
      expectedOutput: z.string({ error: "please enter expected output" }),
      isHidden: z.boolean({ error: "please enter is hidden" }),
    }),
  ),
});
