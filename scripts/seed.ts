import { sql } from "../src/db";

async function seed() {
  console.log("Seeding database...");
  try {
    const creatorPassword = await Bun.password.hash("Creator!123", { algorithm: "bcrypt", cost: 5 });
    const contesteePassword = await Bun.password.hash("Contestee!123", { algorithm: "bcrypt", cost: 5 });

    // 1. Create Users
    let creatorId;
    const existingCreator = await sql`SELECT id FROM users WHERE email='ada@creator.com'`;
    if (existingCreator.length > 0) {
      creatorId = existingCreator[0]?.id;
    } else {
      const creator = await sql`
        INSERT INTO users (name, email, password, role)
        VALUES ('Ada Lovelace', 'ada@creator.com', ${creatorPassword}, 'creator')
        RETURNING id;
      `;
      creatorId = creator[0]?.id;
    }

    let contesteeId;
    const existingContestee = await sql`SELECT id FROM users WHERE email='alan@contestee.com'`;
    if (existingContestee.length > 0) {
      contesteeId = existingContestee[0]?.id;
    } else {
      const contestee = await sql`
        INSERT INTO users (name, email, password, role)
        VALUES ('Alan Turing', 'alan@contestee.com', ${contesteePassword}, 'contestee')
        RETURNING id;
      `;
      contesteeId = contestee[0]?.id;
    }

    // 2. Create Contest
    const contest = await sql`
      INSERT INTO contests (title, description, creator_id, start_time, end_time)
      VALUES (
        'Ultimate Algorithms Challenge', 
        'Test your theoretical computer science and algorithmic coding skills!', 
        ${creatorId}, 
        (NOW() - INTERVAL '1 hour'), 
        (NOW() + INTERVAL '7 days')
      )
      RETURNING id;
    `;
    const contestId = contest[0]?.id;

    const opt1 = JSON.stringify(["O(1)", "O(log n)", "O(n)", "O(n log n)"]);
    const opt2 = JSON.stringify(["Queue", "Tree", "Graph", "Stack"]);

    // 3. Create MCQs
    await sql`
      INSERT INTO mcq_questions (contest_id, question_text, options, correct_option_index, points)
      VALUES
      (${contestId}, 'What is the time complexity of a standard binary search?', ${opt1}, 1, 10),
      (${contestId}, 'Which data structure follows the LIFO principle?', ${opt2}, 3, 10);
    `;

    const tags = JSON.stringify(["Array", "Hash Table"]);

    // 4. Create DSA Problem
    const dsaProblem = await sql`
      INSERT INTO dsa_problems (contest_id, title, description, tags, points, time_limit, memory_limit)
      VALUES (
        ${contestId}, 
        'Two Sum', 
        'Given an array of integers and an integer target, return indices of the two numbers such that they add up to target.', 
        ${tags}, 
        50, 
        2, 
        256
      )
      RETURNING id;
    `;
    const problemId = dsaProblem[0]?.id;

    // 5. Create Test Cases for DSA
    await sql`
      INSERT INTO test_cases (problem_id, input, expected_output, is_hidden)
      VALUES
      (${problemId}, '[2,7,11,15]\n9', '[0,1]', false),
      (${problemId}, '[3,2,4]\n6', '[1,2]', false),
      (${problemId}, '[3,3]\n6', '[0,1]', true);
    `;

    console.log("Database seeded successfully!");
    console.log("Creator Login: ada@creator.com | Creator!123");
    console.log("Contestee Login: alan@contestee.com | Contestee!123");
  } catch (err: any) {
    console.error("Error seeding database message: ", err.message);
    console.error("Error query: ", err.query);
  } finally {
    process.exit(0);
  }
}

seed();
