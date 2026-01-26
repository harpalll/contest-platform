import { StatusCodes } from "http-status-codes";
import { sql } from "../db";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const createContest = asyncHandler(async (req, res, next) => {
  const { title, description, startTime, endTime } = req.body;

  const insertedContest = await sql`
  INSERT INTO contests (title, description, creator_id, start_time, end_time)
  VALUES (${title}, ${description}, ${req.user?.id}, ${startTime}, ${endTime})
  RETURNING *;
`;

  if (!insertedContest.length || insertedContest.length === 0) {
    return res.status(500).json(new ApiResponse(false, {}, "SERVER_ERROR"));
  }

  const contest = insertedContest[0];
  if (!contest) {
    return res.status(500).json(new ApiResponse(false, {}, "SERVER_ERROR"));
  }
  return res.status(201).json(new ApiResponse(true, contest, null));
});

export const getContest = asyncHandler(async (req, res, next) => {
  const contestId = req.params.contestId;

  const isContestee = req.user?.role === "contestee";

  const result = await sql`
  SELECT
    c.id,
    c.title,
    c.description,
    c.start_time AS "startTime",
    c.end_time AS "endTime",
    c.creator_id AS "creatorId",

    COALESCE(
      json_agg(
        DISTINCT (
          CASE
            WHEN ${isContestee} THEN
              jsonb_build_object(
                'id', m.id,
                'questionText', m.question_text,
                'options', m.options,
                'points', m.points
              )
            ELSE
              jsonb_build_object(
                'id', m.id,
                'questionText', m.question_text,
                'options', m.options,
                'points', m.points,
                'correctOptionIndex', m.correct_option_index
              )
          END
        )
      ) FILTER (WHERE m.id IS NOT NULL),
      '[]'
    ) AS mcqs,

    COALESCE(
      json_agg(
        DISTINCT jsonb_build_object(
          'id', d.id,
          'title', d.title,
          'description', d.description,
          'tags', d.tags,
          'points', d.points,
          'timeLimit', d.time_limit,
          'memoryLimit', d.memory_limit
        )
      ) FILTER (WHERE d.id IS NOT NULL),
      '[]'
    ) AS "dsaProblems"

  FROM contests c
  LEFT JOIN mcq_questions m ON m.contest_id = c.id
  LEFT JOIN dsa_problems d ON d.contest_id = c.id
  WHERE c.id = ${contestId}
  GROUP BY c.id;
`;

  const contest = result[0];

  if (!contest) {
    return res
      .status(500)
      .json(new ApiResponse(false, {}, "CONTEST_NOT_FOUND"));
  }
  return res.status(201).json(new ApiResponse(true, contest, null));
});

export const addMcqToContest = asyncHandler(async (req, res, next) => {
  const contestId = req.params.contestId;
  const { questionText, options, correctOptionIndex, points } = req.body;
  const optionsPayloadForSql = `[${options.map((o: string) => `"${o}"`)}]`;

  console.log(
    "query",
    `
    INSERT INTO mcq_questions 
    (contest_id, question_text, options, correct_option_index, points)
    VALUES
    (${contestId}, ${questionText}, ${optionsPayloadForSql}, ${correctOptionIndex}, ${points})
  `,
  );

  const contest = await sql`
    SELECT * FROM contests WHERE id = ${contestId}
  `;

  if (!contest.length || contest.length === 0 || !contest[0]) {
    return res
      .status(500)
      .json(new ApiResponse(false, {}, "CONTEST_NOT_FOUND"));
  }

  const result = await sql`
    INSERT INTO mcq_questions 
    (contest_id, question_text, options, correct_option_index, points)
    VALUES
    (${contestId}, ${questionText}, ${optionsPayloadForSql}, ${correctOptionIndex}, ${points})
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

