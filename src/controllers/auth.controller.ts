import { sql } from "../db";
import { asyncHandler } from "../utils/asyncHandler";
import * as z from "zod";

export const signUp = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const result = await sql`SELECT version()`;

  return res.status(200).json({
    msg: "success",
    data: result[0],
  });
});

export const login = asyncHandler(async (req, res) => {});
