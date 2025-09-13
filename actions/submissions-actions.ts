"use server";

import { db } from "@/db";
import { submissions } from "@/db/schema/submissions-schema";
import { eq, and } from "drizzle-orm";
import { users } from "@/db/schema/users-schema";
import { habits } from "@/db/schema/habits-schema";
import { desc } from "drizzle-orm";

export async function getRecentSubmissions(limit: number = 10) {
    try {
      console.log("Server Action: Fetching recent submissions...");
      
      const recentSubmissions = await db
        .select({
          id: submissions.id,
          submission_date: submissions.submission_date,
          actual_amount: submissions.actual_amount,
          points: submissions.points,
          perceived_rating: submissions.perceived_rating,
          note: submissions.note,
          created_at: submissions.created_at,
          // Join with users and habits to get names
          user_first_name: users.first_name,
          user_last_name: users.last_name,
          habit_name: habits.name,
          habit_unit: habits.unit,
          habit_daily_goal: habits.daily_goal,
        })
        .from(submissions)
        .leftJoin(users, eq(submissions.user_id, users.id))
        .leftJoin(habits, eq(submissions.habit_id, habits.id))
        .orderBy(desc(submissions.created_at))
        .limit(limit);
      
      console.log(`Server Action: Fetched ${recentSubmissions.length} submissions`);
      return recentSubmissions;
    } catch (error) {
      console.error("Server Action Error (getRecentSubmissions):", error);
      throw new Error("Failed to fetch recent submissions.");
    }
  }

export async function createSubmission({
  user_id,
  habit_id,
  submission_date,
  actual_amount,
  points,
  perceived_rating,
  note,
}: {
  user_id: string;
  habit_id: string;
  submission_date: string; // Format: "2025-01-15"
  actual_amount: number;
  points: number;
  perceived_rating: string;
  note?: string;
}) {
  try {
    console.log("Server Action: Creating submission...");
    
    const [newSubmission] = await db
      .insert(submissions)
      .values({
        user_id,
        habit_id,
        submission_date,
        actual_amount,
        points,
        perceived_rating,
        note: note || null,
      })
      .returning();
    
    console.log("Server Action: Submission created:", newSubmission);
    return newSubmission;
  } catch (error) {
    console.error("Server Action Error (createSubmission):", error);
    throw new Error("Failed to create submission.");
  }
}

export async function calculateLeaderboard() {
  try {
    console.log("Server Action: Calculating leaderboard...");
    
    // Get all unique users who have submitted
    const uniqueUsers = await db
      .select({
        user_id: submissions.user_id,
        user_first_name: users.first_name,
        user_last_name: users.last_name,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.user_id, users.id))
      .groupBy(submissions.user_id, users.first_name, users.last_name);
    
    // Calculate total points for each user
    const leaderboard = [];
    
    for (const user of uniqueUsers) {
      const totalScore = await calculateUserTotalPoints(user.user_id);
      
      leaderboard.push({
        user_id: user.user_id,
        name: user.user_first_name || "Anonymous",
        total_score: totalScore,
      });
    }
    
    // Sort by highest score first
    leaderboard.sort((a, b) => b.total_score - a.total_score);
    
    console.log(`Server Action: Calculated leaderboard for ${leaderboard.length} users`);
    return leaderboard;
  } catch (error) {
    console.error("Server Action Error (calculateLeaderboard):", error);
    throw new Error("Failed to calculate leaderboard.");
  }
}

export async function calculateCompletionRate() {
  try {
    console.log("Server Action: Calculating completion rate...");
    
    const allSubmissions = await db
      .select({
        user_id: submissions.user_id,
        submission_date: submissions.submission_date,
        points: submissions.points,
      })
      .from(submissions);
    
    // Group submissions by user and date, sum points per day
    const userDailyTotals: Record<string, Record<string, number>> = {};
    
    allSubmissions.forEach((submission) => {
      const userId = submission.user_id;
      const date = submission.submission_date;
      const points = submission.points;
      
      if (!userDailyTotals[userId]) {
        userDailyTotals[userId] = {};
      }
      
      if (!userDailyTotals[userId][date]) {
        userDailyTotals[userId][date] = 0;
      }
      
      userDailyTotals[userId][date] += points;
    });
    
    // Calculate completion rate for each user
    let totalCompletedDays = 0;
    let totalActiveDays = 0;
    
    Object.keys(userDailyTotals).forEach((userId) => {
      const userDays = userDailyTotals[userId];
      
      Object.keys(userDays).forEach((date) => {
        const dailyTotal = userDays[date];
        totalActiveDays += 1;
        
        // Count as completed if they got 1.0+ points that day
        if (dailyTotal >= 1.0) {
          totalCompletedDays += 1;
        }
      });
    });
    
    const completionRate = totalActiveDays > 0 ? (totalCompletedDays / totalActiveDays) * 100 : 0;
    
    console.log(`Server Action: Completion rate calculated - ${totalCompletedDays}/${totalActiveDays} = ${completionRate.toFixed(1)}%`);
    
    return {
      completed_days: totalCompletedDays,
      total_active_days: totalActiveDays,
      completion_rate: Math.round(completionRate * 10) / 10, // Round to 1 decimal
    };
  } catch (error) {
    console.error("Server Action Error (calculateCompletionRate):", error);
    throw new Error("Failed to calculate completion rate.");
  }
}

export async function calculateTotalFriends() {
  try {
    console.log("Server Action: Calculating total friends...");
    
    const uniqueUsers = await db
      .selectDistinct({ user_id: submissions.user_id })
      .from(submissions);
    
    const totalFriends = uniqueUsers.length;
    console.log(`Server Action: Found ${totalFriends} total friends`);
    
    return totalFriends;
  } catch (error) {
    console.error("Server Action Error (calculateTotalFriends):", error);
    throw new Error("Failed to calculate total friends.");
  }
}

export async function calculateGroupPoints() {
  try {
    console.log("Server Action: Calculating group points...");
    
    const leaderboard = await calculateLeaderboard();
    const groupPoints = leaderboard.reduce((total, user) => total + user.total_score, 0);
    
    console.log(`Server Action: Group points total: ${groupPoints}`);
    return Math.round(groupPoints * 10) / 10; // Round to 1 decimal
  } catch (error) {
    console.error("Server Action Error (calculateGroupPoints):", error);
    throw new Error("Failed to calculate group points.");
  }
}

export async function calculateUserCompletionRate(user_id: string) {
  try {
    console.log(`Server Action: Calculating completion rate for user ${user_id}...`);
    
    const userSubmissions = await db
      .select({
        submission_date: submissions.submission_date,
        points: submissions.points,
      })
      .from(submissions)
      .where(eq(submissions.user_id, user_id));
    
    if (userSubmissions.length === 0) {
      return {
        completed_days: 0,
        total_active_days: 0,
        completion_rate: 0,
      };
    }
    
    // Group by date and sum points per day
    const dailyTotals: Record<string, number> = {};
    
    userSubmissions.forEach((submission) => {
      const date = submission.submission_date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = 0;
      }
      dailyTotals[date] += submission.points;
    });
    
    // Calculate completion rate
    let completedDays = 0;
    const totalActiveDays = Object.keys(dailyTotals).length;
    
    Object.values(dailyTotals).forEach((dailyTotal) => {
      if (dailyTotal >= 1.0) {
        completedDays += 1;
      }
    });
    
    const completionRate = totalActiveDays > 0 ? (completedDays / totalActiveDays) * 100 : 0;
    
    console.log(`Server Action: User completion rate - ${completedDays}/${totalActiveDays} = ${completionRate.toFixed(1)}%`);
    
    return {
      completed_days: completedDays,
      total_active_days: totalActiveDays,
      completion_rate: Math.round(completionRate * 10) / 10,
    };
  } catch (error) {
    console.error("Server Action Error (calculateUserCompletionRate):", error);
    throw new Error("Failed to calculate user completion rate.");
  }
}

export async function calculateUserTotalPoints(user_id: string) {
  try {
    console.log(`Server Action: Calculating total points for user ${user_id}...`);
    
    const userSubmissions = await db
      .select({
        submission_date: submissions.submission_date,
        points: submissions.points,
      })
      .from(submissions)
      .where(eq(submissions.user_id, user_id));
    
    if (userSubmissions.length === 0) {
      return 0;
    }
    
    // Group submissions by date and sum points per day
    const dailyTotals: Record<string, number> = {};
    
    userSubmissions.forEach((submission) => {
      const date = submission.submission_date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = 0;
      }
      dailyTotals[date] += submission.points;
    });
    
    // Calculate total score with 3-point daily maximum
    let totalScore = 0;
    
    Object.values(dailyTotals).forEach((dailyTotal) => {
      const cappedDailyPoints = Math.min(dailyTotal, 3);
      totalScore += cappedDailyPoints;
    });
    
    const roundedScore = Math.round(totalScore * 10) / 10;
    console.log(`Server Action: User total points: ${roundedScore}`);
    
    return roundedScore;
  } catch (error) {
    console.error("Server Action Error (calculateUserTotalPoints):", error);
    throw new Error("Failed to calculate user total points.");
  }
}

export async function calculateUserDaysActive(user_id: string) {
  try {
    console.log(`Server Action: Calculating days active for user ${user_id}...`);
    
    const distinctDates = await db
      .selectDistinct({ submission_date: submissions.submission_date })
      .from(submissions)
      .where(eq(submissions.user_id, user_id));
    
    const daysActive = distinctDates.length;
    console.log(`Server Action: User has been active for ${daysActive} days`);
    
    return daysActive;
  } catch (error) {
    console.error("Server Action Error (calculateUserDaysActive):", error);
    throw new Error("Failed to calculate user days active.");
  }
}