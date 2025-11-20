"use server";

import { db } from "@/lib/db";
import { auth, currentUser } from "@clerk/nextjs/server";

//get top 3 for leaderboard
export async function getTopThreeToday() {
  const now = new Date();
  const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString();



  const result = await db().execute(`
    SELECT
      users.name,
      SUM(activities.points) as total_points
    FROM activities
    JOIN users ON activities.user_id = users.id
    WHERE activities.created_at >= '${todayStart}'
    GROUP BY users.id, users.name
    ORDER BY total_points DESC
    LIMIT 3
  `);

  return JSON.parse(JSON.stringify(result.rows));
}


//results user inputs after clicking call action
export async function logCallResult(result, notes = "") {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const timeStamp = new Date().toISOString();
  console.log(`final value is ${result}`);

  await db().execute({
    sql: 'INSERT INTO call_records (user_id, result, timestamp, notes) VALUES (?, ?, ?, ?)',
    args: [userId, result, timeStamp, notes],
  });

}


export async function addActivity(activityType, points, notes = "", result = null) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const timeStamp = new Date().toISOString();

  console.log(`activity is ${activityType}, points: ${points}`);

  await db().execute({
    sql: 'INSERT INTO activities (user_id, activity_type, points, notes, created_at, result) VALUES (?, ?, ?, ?, ?, ?)',
    args: [userId, activityType, points, notes, timeStamp, result],
  })
}

//create user in database after onboarding
export async function createUser(office) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      throw new Error("Unauthorized");
    }

    // Get user's name from Clerk
    const name = user.firstName || user.emailAddresses[0].emailAddress.split('@')[0];
    const email = user.emailAddresses[0].emailAddress;

    // Check if user already exists
    const existingUser = await db().execute({
      sql: 'SELECT id FROM users WHERE id = ?',
      args: [userId],
    });

    if (existingUser.rows.length > 0) {
      // Update existing user
      await db().execute({
        sql: 'UPDATE users SET name = ?, email = ?, office = ? WHERE id = ?',
        args: [name, email, office, userId],
      });
    } else {
      // Create new user
      await db().execute({
        sql: 'INSERT INTO users (id, name, email, office, created_at) VALUES (?, ?, ?, ?, ?)',
        args: [userId, name, email, office, new Date().toISOString()],
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Error in createUser:', error);
    throw new Error(error.message || 'Failed to create user');
  }
}

//check if user exists in database
export async function checkUserExists() {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  const result = await db().execute({
    sql: 'SELECT id FROM users WHERE id = ?',
    args: [userId],
  });

  return result.rows.length > 0;
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

//get activity distribution for current user
export async function getActivityDistribution(timePeriod = "today") {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

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
    case "all":
      periodStart = "";
      break;
  }

  const whereClause = periodStart ? `AND activities.created_at >= '${periodStart}'` : "";

  const result = await db().execute(`
    SELECT
      activity_type,
      COUNT(*) as count
    FROM activities
    WHERE user_id = '${userId}' ${whereClause}
    GROUP BY activity_type
    ORDER BY count DESC
  `);

  return JSON.parse(JSON.stringify(result.rows));
}

//get conversion rates for current user
export async function getConversionRates(timePeriod = "today") {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

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
    case "all":
      periodStart = "";
      break;
  }

  const whereClause = periodStart ? `WHERE created_at >= '${periodStart}' AND user_id = '${userId}'` : `WHERE user_id = '${userId}'`;

  const result = await db().execute(`
    SELECT
      SUM(CASE WHEN activity_type = 'knock' THEN 1 ELSE 0 END) as knocks,
      SUM(CASE WHEN activity_type = 'call' THEN 1 ELSE 0 END) as calls,
      SUM(CASE WHEN activity_type = 'lead' THEN 1 ELSE 0 END) as leads,
      SUM(CASE WHEN activity_type = 'inspection' THEN 1 ELSE 0 END) as inspections,
      SUM(CASE WHEN activity_type = 'presentation' THEN 1 ELSE 0 END) as presentations,
      SUM(CASE WHEN activity_type = 'close' THEN 1 ELSE 0 END) as closes
    FROM activities
    ${whereClause}
  `);

  const data = result.rows[0];

  // Calculate conversion rates
  const conversions = {
    callsToLeads: data.calls > 0 ? ((data.leads / data.calls) * 100).toFixed(1) : 0,
    leadsToInspections: data.leads > 0 ? ((data.inspections / data.leads) * 100).toFixed(1) : 0,
    inspectionsToPresent: data.inspections > 0 ? ((data.presentations / data.inspections) * 100).toFixed(1) : 0,
    presentToClose: data.presentations > 0 ? ((data.closes / data.presentations) * 100).toFixed(1) : 0,
    counts: {
      knocks: data.knocks || 0,
      calls: data.calls || 0,
      leads: data.leads || 0,
      inspections: data.inspections || 0,
      presentations: data.presentations || 0,
      closes: data.closes || 0
    }
  };

  return conversions;
}


