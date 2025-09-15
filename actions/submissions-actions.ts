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
    console.log("Server Action: Calculating group completion rate...");
    
    const uniqueUsers = await db
      .selectDistinct({ user_id: submissions.user_id })
      .from(submissions);
    
    console.log("Found users:", uniqueUsers.length);
    
    let totalCompletedDays = 0;
    let totalChallengeDays = 0;
    
    for (const user of uniqueUsers) {
      const userCompletionData = await calculateUserCompletionRate(user.user_id);
      console.log(`User ${user.user_id}: ${userCompletionData.completed_days}/${userCompletionData.total_challenge_days} = ${userCompletionData.completion_rate}%`);
      
      totalCompletedDays += userCompletionData.completed_days;
      totalChallengeDays += userCompletionData.total_challenge_days;
    }
    
    console.log(`Group totals: ${totalCompletedDays}/${totalChallengeDays}`);
    
    const completionRate = totalChallengeDays > 0 ? (totalCompletedDays / totalChallengeDays) * 100 : 0;
    
    console.log(`Server Action: Group completion rate - ${totalCompletedDays}/${totalChallengeDays} = ${completionRate.toFixed(1)}%`);
    
    return {
      completed_days: totalCompletedDays,
      total_challenge_days: totalChallengeDays,
      completion_rate: Math.round(completionRate * 10) / 10,
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
      .where(eq(submissions.user_id, user_id))
      .orderBy(submissions.submission_date);
    
    if (userSubmissions.length === 0) {
      return {
        completed_days: 0,
        total_challenge_days: 0,
        completion_rate: 0,
      };
    }
    
    // Find first submission date (challenge start)
    const firstSubmissionDate = userSubmissions[0].submission_date;
    const today = new Date().toISOString().split('T')[0];
    
    // Calculate total days since challenge started
    const startDate = new Date(firstSubmissionDate);
    const currentDate = new Date(today);
    const totalChallengeDays = Math.floor((currentDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    // Group by date and sum points per day
    const dailyTotals: Record<string, number> = {};
    
    userSubmissions.forEach((submission) => {
      const date = submission.submission_date;
      if (!dailyTotals[date]) {
        dailyTotals[date] = 0;
      }
      dailyTotals[date] += submission.points;
    });
    
    // Count completed days (days with 1+ points)
    let completedDays = 0;
    Object.values(dailyTotals).forEach((dailyTotal) => {
      if (dailyTotal >= 1.0) {
        completedDays += 1;
      }
    });
    
    const completionRate = totalChallengeDays > 0 ? (completedDays / totalChallengeDays) * 100 : 0;
    
    console.log(`Server Action: User completion rate - ${completedDays}/${totalChallengeDays} = ${completionRate.toFixed(1)}%`);
    
    return {
      completed_days: completedDays,
      total_challenge_days: totalChallengeDays,
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

export async function calculateUserDayStreak(user_id: string) {
  try {
    console.log(`Server Action: Calculating day streak for user ${user_id}...`);
    
    const userSubmissions = await db
      .select({
        submission_date: submissions.submission_date,
        points: submissions.points,
      })
      .from(submissions)
      .where(eq(submissions.user_id, user_id))
      .orderBy(desc(submissions.submission_date));
    
    if (userSubmissions.length === 0) {
      return 0;
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
    
    // Get sorted dates (most recent first)
    const sortedDates = Object.keys(dailyTotals).sort().reverse();
    
    // Check if the most recent successful day is today or yesterday
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Find most recent day with 1+ points
    let mostRecentSuccessDay = null;
    for (const date of sortedDates) {
      if (dailyTotals[date] >= 1.0) {
        mostRecentSuccessDay = date;
        break;
      }
    }
    
    // If no successful day found, or most recent success is not today/yesterday, streak is 0
    if (!mostRecentSuccessDay || (mostRecentSuccessDay !== today && mostRecentSuccessDay !== yesterday)) {
      console.log(`Server Action: Streak broken - most recent success: ${mostRecentSuccessDay}`);
      return 0;
    }
    
    // Count consecutive days with 1+ points from most recent successful day
    let streak = 0;
    for (let i = 0; i < sortedDates.length; i++) {
      const currentDate = sortedDates[i];
      const dailyTotal = dailyTotals[currentDate];
      
      if (dailyTotal >= 1.0) {
        streak++;
      } else {
        break;
      }
      
      // Check for date gaps
      if (i < sortedDates.length - 1) {
        const nextDate = sortedDates[i + 1];
        const currentDateObj = new Date(currentDate);
        const nextDateObj = new Date(nextDate);
        const dayDifference = Math.floor((currentDateObj.getTime() - nextDateObj.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDifference > 1) {
          break;
        }
      }
    }
    
    console.log(`Server Action: Current day streak: ${streak} days`);
    return streak;
  } catch (error) {
    console.error("Server Action Error (calculateUserDayStreak):", error);
    throw new Error("Failed to calculate user day streak.");
  }
}

export async function generateMotivationalMessage(user_id: string) {
  try {
    console.log(`Server Action: Generating motivational message for user ${user_id}...`);
    
    const leaderboard = await calculateLeaderboard();
    
    if (leaderboard.length === 0) {
      return "Start logging your progress to see how you're doing!";
    }
    
    // Find current user's position
    const userIndex = leaderboard.findIndex(user => user.user_id === user_id);
    
    if (userIndex === -1) {
      return "Log your first activity to join the leaderboard!";
    }
    
    const currentUser = leaderboard[userIndex];
    const totalUsers = leaderboard.length;
    
    // Single user case
    if (totalUsers === 1) {
      return "You're building momentum! Keep up the consistency.";
    }
    
    // First place
    if (userIndex === 0) {
      const secondPlace = leaderboard[1];
      const pointLead = Math.round((currentUser.total_score - secondPlace.total_score) * 10) / 10;
      return `You're leading the pack! You're ${pointLead} points ahead of ${secondPlace.name}. Stay consistent to keep your edge.`;
    }
    
    // Last place
    if (userIndex === totalUsers - 1) {
      return "Every point counts! Focus on building your daily streak - you've got this.";
    }
    
    // Middle positions
    const userAbove = leaderboard[userIndex - 1];
    const pointsToClose = Math.round((userAbove.total_score - currentUser.total_score) * 10) / 10;
    
    if (pointsToClose <= 3) {
      return `You're ${pointsToClose} points behind ${userAbove.name} - totally catchable with a few good days!`;
    } else {
      return `Keep building momentum! You're making progress and every consistent day matters.`;
    }
    
  } catch (error) {
    console.error("Server Action Error (generateMotivationalMessage):", error);
    return "Keep up the great work on your daily habit!";
  }
}

export async function getDailyMotivationalMessage() {
  const messages = [
    "Every small step counts toward building lasting habits",
    "Consistency beats perfection every time",
    "You're building something meaningful with each day",
    "Progress isn't always visible, but it's always happening",
    "One day at a time builds extraordinary results",
    "Your future self will thank you for today's effort",
    "Small habits compound into big transformations",
    "Each day is a fresh chance to move forward",
    "You're stronger than you think you are",
    "Building habits is building a better version of yourself",
    "Today's effort is tomorrow's strength",
    "Persistence is the key that unlocks potential",
    "You don't have to be perfect, just consistent",
    "Every habit you build makes the next one easier",
    "You're creating positive change one day at a time",
    "Focus on progress, not perfection",
    "Your commitment today shapes your future",
    "Small wins add up to big victories",
    "You're developing the discipline that will serve you for life",
    "Each consistent day builds unshakeable confidence",
    "You're proving to yourself that you can do hard things",
    "Habits are the foundation of the person you're becoming",
    "Today is another opportunity to invest in yourself",
    "You're building momentum with every single day",
    "Consistency is your superpower",
    "You're writing your success story one day at a time",
    "Every day you show up, you're getting stronger",
    "Your dedication is shaping your character",
    "You're building the life you want through daily choices",
    "Trust the process - you're making real progress"
  ];
  
  const today = new Date();
  const dayOfMonth = today.getDate();
  const messageIndex = dayOfMonth % messages.length;
  
  return messages[messageIndex];
}