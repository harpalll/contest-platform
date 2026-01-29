import { sql } from "../db";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getDsaProblemDetails = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  const data = await Promise.all([
    sql`select * from dsa_problems where id=${problemId}`,
    sql`select * from test_cases where problem_id=${problemId} and is_hidden=false`,
  ]);

  if (data[0].length === 0 || data[1].length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "PROBLEM_NOT_FOUND"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(true, { ...data[0][0], visibleTestCases: data[1] }, null),
    );
});

export const submitDsaAnswer = asyncHandler(async (req, res) => {
  const { problemId } = req.params;
  const { code, language } = req.body;

  

  // CONTEST_NOT_ACTIVE
  // PROBLEM_NOT_FOUND
});
