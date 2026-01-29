import { StatusCodes } from "http-status-codes";
import { sql } from "../db";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const createContest = asyncHandler(async (req, res) => {
  const { title, description, startTime, endTime } = req.body;

  const insertedContest = await sql`
  INSERT INTO contests (title, description, creator_id, start_time, end_time)
  VALUES (${title}, ${description}, ${req.user?.id}, ${startTime}, ${endTime})
  RETURNING *;
`;

  if (!insertedContest.length || insertedContest.length === 0) {
    return res.status(500).json(new ApiResponse(false, null, "SERVER_ERROR"));
  }

  const contest = insertedContest[0];
  if (!contest) {
    return res.status(500).json(new ApiResponse(false, null, "SERVER_ERROR"));
  }
  return res.status(201).json(new ApiResponse(true, contest, null));
});

export const getContest = asyncHandler(async (req, res) => {
  const contestId = req.params.contestId;
  if (!contestId) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "Contest not found"));
  }

  const isContestee = req.user?.role === "contestee";

  // const result = await sql`
  //   SELECT
  //     c.id,
  //     c.title,
  //     c.description,
  //     c.start_time AS "startTime",
  //     c.end_time AS "endTime",
  //     c.creator_id AS "creatorId",

  //     COALESCE(
  //       json_agg(
  //         DISTINCT (
  //           CASE
  //             WHEN ${isContestee} THEN
  //               jsonb_build_object(
  //                 'id', m.id,
  //                 'questionText', m.question_text,
  //                 'options', m.options,
  //                 'points', m.points
  //               )
  //             ELSE
  //               jsonb_build_object(
  //                 'id', m.id,
  //                 'questionText', m.question_text,
  //                 'options', m.options,
  //                 'points', m.points,
  //                 'correctOptionIndex', m.correct_option_index
  //               )
  //           END
  //         )
  //       ) FILTER (WHERE m.id IS NOT NULL),
  //       '[]'
  //     ) AS mcqs,

  //     COALESCE(
  //       json_agg(
  //         DISTINCT jsonb_build_object(
  //           'id', d.id,
  //           'title', d.title,
  //           'description', d.description,
  //           'tags', d.tags,
  //           'points', d.points,
  //           'timeLimit', d.time_limit,
  //           'memoryLimit', d.memory_limit
  //         )
  //       ) FILTER (WHERE d.id IS NOT NULL),
  //       '[]'
  //     ) AS "dsaProblems"

  //   FROM contests c
  //   LEFT JOIN mcq_questions m ON m.contest_id = c.id
  //   LEFT JOIN dsa_problems d ON d.contest_id = c.id
  //   WHERE c.id = ${contestId}
  //   GROUP BY c.id;
  // `;

  const data = await Promise.all([
    sql`select * from contests c
    where c.id=${contestId}`,
    sql`select * from mcq_questions where contest_id=${contestId}`,
    sql`select * from dsa_problems where contest_id=${contestId}`,
  ]);

  if (!data[0] || !data[1] || !data[2]) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "Contest not found"));
  }

  const mcqs = isContestee
    ? data[1].map(({ correct_option_index, ...rest }) => rest)
    : data[1];

  return res.status(200).json(
    new ApiResponse(
      true,
      {
        ...data[0][0],
        mcqs,
        dsaProblems: data[2],
      },
      null,
    ),
  );
});

export const addMcqToContest = asyncHandler(async (req, res) => {
  const contestId = req.params.contestId;
  const { questionText, options, correctOptionIndex, points } = req.body;

  const contest = await sql`
    SELECT * FROM contests WHERE id = ${contestId}
  `;

  if (!contest.length || contest.length === 0 || !contest[0]) {
    return res
      .status(500)
      .json(new ApiResponse(false, null, "CONTEST_NOT_FOUND"));
  }

  const result = await sql`
    INSERT INTO mcq_questions 
    (contest_id, question_text, options, correct_option_index, points)
    VALUES
    (${contestId}, ${questionText}, ${JSON.stringify(options)}, ${correctOptionIndex}, ${points})
    RETURNING *
  `;

  const mcq = result[0];

  if (!mcq) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiResponse(false, null, "SERVER_ERROR"));
  }

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(
      true,
      {
        id: mcq.id,
        contestId,
      },
      null,
    ),
  );
});

// TODO: use join to optimise
export const submitMcqAnswer = asyncHandler(async (req, res) => {
  const { contestId, questionId } = req.params;
  const { selectedOptionIndex } = req.body;

  const contest = await sql`
    SELECT * FROM contests WHERE id=${contestId};
  `;

  if (!contest.length || contest.length === 0 || !contest[0]) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "CONTEST_NOT_FOUND"));
  }

  const question = await sql`
    SELECT * FROM mcq_questions WHERE id=${questionId};
  `;

  if (!question.length || question.length === 0 || !question[0]) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "QUESTION_NOT_FOUND"));
  }

  const submittingTime = new Date();
  const contestEndTime = new Date(contest[0].end_time);

  if (submittingTime > contestEndTime) {
    return res
      .status(400)
      .json(new ApiResponse(false, null, "CONTEST_NOT_ACTIVE"));
  }

  const alreadySubmitted = await sql`
    SELECT * FROM mcq_submissions WHERE question_id=${questionId} and user_id=${req.user?.id};
  `;

  if (alreadySubmitted.length || alreadySubmitted[0]) {
    return res
      .status(404)
      .json(new ApiResponse(false, null, "ALREADY_SUBMITTED"));
  }

  const isCorrect = question[0].correct_option_index === selectedOptionIndex;
  const pointsEarned = isCorrect ? question[0].points : 0;

  const result = await sql`
    INSERT INTO mcq_submissions 
    (user_id, question_id, selected_option_index, is_correct, points_earned)
    VALUES
    (${req.user?.id}, ${questionId}, ${selectedOptionIndex}, ${isCorrect}, ${pointsEarned})
    RETURNING *
  `;

  const mcqSubmission = result[0];
  if (!mcqSubmission) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json(new ApiResponse(false, null, "SERVER_ERROR"));
  }

  return res
    .status(StatusCodes.CREATED)
    .json(new ApiResponse(true, { isCorrect, pointsEarned }, null));
});

export const addDsaProblem = asyncHandler(async (req, res) => {
  const contestId = req.params.contestId;
  const {
    title,
    description,
    tags,
    points,
    timeLimit,
    memoryLimit,
    testCases,
  } = req.body;

  console.log(testCases);

  // CTE
  const [result] = await sql.transaction([
    sql`
        WITH contest_check AS (
          SELECT id FROM contests WHERE id = ${contestId}
        ),
        inserted_problem AS (
          INSERT INTO dsa_problems
            (contest_id, title, description, tags, points, time_limit, memory_limit)
          SELECT
            ${contestId},
            ${title},
            ${description},
            ${JSON.stringify(tags)},
            ${points},
            ${timeLimit},
            ${memoryLimit}
          FROM contest_check
          RETURNING id
        ),
        inserted_test_cases AS (
          INSERT INTO test_cases
            (problem_id, input, expected_output, is_hidden)
          SELECT
            ip.id,
            tc.input,
            tc."expectedOutput",
            tc."isHidden"
          FROM inserted_problem ip,
          jsonb_to_recordset(${JSON.stringify(testCases)}::jsonb)
            AS tc(input text, "expectedOutput" text, "isHidden" boolean)
          RETURNING id
        )
        SELECT
          (SELECT id FROM inserted_problem) AS problem_id,
          COUNT(*) AS test_case_count
        FROM inserted_test_cases;
      `,
  ]);

  if (!result || !result[0]?.problem_id) {
    return res
      .status(StatusCodes.NOT_FOUND)
      .json(new ApiResponse(false, null, "CONTEST_NOT_FOUND"));
  }

  return res.status(StatusCodes.CREATED).json(
    new ApiResponse(
      true,
      {
        id: result[0].problem_id,
        contestId,
      },
      null,
    ),
  );
});

export const getContestLeaderboard = asyncHandler(async (req, res) => {});
