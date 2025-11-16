"use server";

import { db } from "@/lib/db";

//test before auth and user id setup
const userId = "test-user-1";
const timeStamp = new Date().toISOString();

//get top 3 for leaderboard
export async function getTopThreeToday() {
  const result = await db().execute(`
    SELECT
      users.name,
      SUM(activities.points) as total_points
    FROM activities
    JOIN users ON activities.user_id = users.id
    GROUP BY users.id, users.name
    ORDER BY total_points DESC
    LIMIT 3
  `);

  return JSON.parse(JSON.stringify(result.rows));
}


//results user inputs after clicking call action
export async function logCallResult(result, notes = "") {
  console.log(`final value is ${result}`);


  await db().execute({
    sql: 'INSERT INTO call_records (user_id, result, timestamp, notes) VALUES (?, ?, ?, ?)',
    args: [userId, result, timeStamp, notes],
  });

}


export async function addActivity(value, notes = "", result = null) {
  let activity;
  switch (value) {
    case 20: activity = "lead";
      break;
    case 5: activity = "call";
      break;
    case 1: activity = "knock";
      break;
    case 10: activity = "inspection";
      break;
    case 20: activity = "presentation";
      break;
    case 50: activity = "close";
      break;
  }
  console.log(`activity is ${activity}`);

  await db().execute({
    sql: 'INSERT INTO activities (user_id, activity_type, points, notes, created_at, result) VALUES (?, ?, ?, ?, ?, ?)',
    args: [1, activity, value, notes, timeStamp, result],
  })
}

//get leaderboard rankings
export async function getLeaderboard(timePeriod = "today", office = "all") {
  const now = new Date();
  let periodStart = "";

  switch (timePeriod) {
    case "today":
      periodStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();
      break;
    case "week":
      periodStart = new Date(now.setDate(now.getDate() - 7)).toISOString();
      break;
    case "month":
      periodStart = new Date(now.setMonth(now.getMonth() - 1)).toISOString();
      break;
    case "year":
      periodStart = new Date(now.setFullYear(now.getFullYear() - 1)).toISOString();
      break;
    case "all":
      periodStart = "";
      break;
  }

  // Build office filter
  const officeFilter = office !== "all" ? `AND users.office = '${office}'` : "";

  const result = await db().execute(`
    SELECT
      users.id,
      users.name,
      users.office,
      ${periodStart ? `SUM(CASE WHEN activities.created_at >= '${periodStart}' THEN activities.points ELSE 0 END) as period_points,` : ''}
      SUM(activities.points) as total_points,
      COUNT(activities.id) as activity_count
    FROM activities
    JOIN users ON activities.user_id = users.id
    WHERE 1=1 ${officeFilter}
    GROUP BY users.id, users.name, users.office
    ORDER BY ${periodStart ? 'period_points' : 'total_points'} DESC, total_points DESC
  `);

  return JSON.parse(JSON.stringify(result.rows));
}


