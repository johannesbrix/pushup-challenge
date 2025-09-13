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
    
    const allSubmissions = await db
      .select({
        user_id: submissions.user_id,
        submission_date: submissions.submission_date,
        points: submissions.points,
        user_first_name: users.first_name,
        user_last_name: users.last_name,
      })
      .from(submissions)
      .leftJoin(users, eq(submissions.user_id, users.id));
    
    // Group submissions by user and date
    const userDailyPoints: Record<string, Record<string, number>> = {};
    
    allSubmissions.forEach((submission) => {
      const userId = submission.user_id;
      const date = submission.submission_date;
      const points = submission.points;
      
      if (!userDailyPoints[userId]) {
        userDailyPoints[userId] = {};
      }
      
      if (!userDailyPoints[userId][date]) {
        userDailyPoints[userId][date] = 0;
      }
      
      // Add points for this submission to the daily total
      userDailyPoints[userId][date] += points;
    });
    
    // Calculate final scores with 3-point daily maximum
    const leaderboard = [];
    const userNames: Record<string, string> = {};
    
    // Get user names
    allSubmissions.forEach((submission) => {
      if (!userNames[submission.user_id]) {
        userNames[submission.user_id] = submission.user_first_name || "Anonymous";
      }
    });
    
    // Calculate total scores
    Object.keys(userDailyPoints).forEach((userId) => {
      let totalScore = 0;
      
      Object.keys(userDailyPoints[userId]).forEach((date) => {
        const dailyPoints = userDailyPoints[userId][date];
        // Apply 3-point daily maximum
        const cappedDailyPoints = Math.min(dailyPoints, 3);
        totalScore += cappedDailyPoints;
      });
      
      leaderboard.push({
        user_id: userId,
        name: userNames[userId],
        total_score: Math.round(totalScore * 10) / 10, // Round to 1 decimal
      });
    });
    
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

