import { StatusCodes } from "http-status-codes";
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

  const data = await sql`
     SELECT
    c.id AS contest_id,
    m.id AS problem_id,
    c.creator_id,
    m.points,
    c.end_time,
    (NOW() <= c.end_time) AS contest_active
    FROM dsa_problems m
    JOIN contests c ON m.contest_id = c.id
    WHERE m.id = ${problemId};
   `;

  if (data.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "PROBLEM_NOT_FOUND"));
  }

  const row = data[0]!;
  if (!row.contest_active) {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "CONTEST_NOT_ACTIVE"));
  }

  const testCases = await sql`
    select * from test_cases where problem_id=${problemId}
  `;

  if (!testCases || testCases.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "TEST_CASES_NOT_FOUND"));
  }

  for (const testCase of testCases) {
    console.log("testcase", testCase);

    // TODO: execute code with testcases
  }

  const testCasesPassed = testCases.length;
  const totalTestCases = testCases.length;
  const problemPoints = row.points;

  const pointsEarned = Math.floor(
    (testCasesPassed / totalTestCases) * problemPoints,
  );

  // * SENDING ACCEPTED AS OF NOW
  const status = "accepted";
  const result = await sql`
    INSERT INTO dsa_submissions 
    (user_id, problem_id, code, language, status, points_earned, test_cases_passed, total_test_cases)
    VALUES
    (${req.user?.id}, ${problemId}, ${code}, ${language}, ${status}, ${pointsEarned}, ${testCasesPassed}, ${totalTestCases})
    RETURNING *
  `;

  const dsaSubmission = result[0];
  if (!dsaSubmission) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiResponse(false, null, "SERVER_ERROR"));
  }

  return res.status(201).json(
    new ApiResponse(
      true,
      {
        status,
        pointsEarned,
        testCasesPassed,
        totalTestCases,
      },
      null,
    ),
  );
});

