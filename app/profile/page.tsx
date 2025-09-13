"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHabit } from "@/context/HabitContext";
import { useUser } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";
import { createHabit, getHabitsByUserId, updateHabit } from "@/actions/habits-actions";
import { getUserByClerkId } from "@/actions/users-actions";
import { calculateUserCompletionRate, calculateUserTotalPoints, calculateUserDaysActive } from "@/actions/submissions-actions";
import BottomNav from "@/components/bottom-nav";

export default function Profile() {
  const { habitData, updateHabit: updateHabitContext, isLoading: contextLoading } = useHabit();
  const { user } = useUser();
  const [habitName, setHabitName] = useState("");
  const [habitUnit, setHabitUnit] = useState("");
  const [dailyGoal, setDailyGoal] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [savedHabitName, setSavedHabitName] = useState("");
  const [savedHabitUnit, setSavedHabitUnit] = useState("");
  const [savedDailyGoal, setSavedDailyGoal] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dbUserId, setDbUserId] = useState<string>("");
  
  // Initialize form with context data only once when context loads
  useEffect(() => {
    if (!contextLoading && habitData) {
      setHabitName(habitData.habitName);
      setHabitUnit(habitData.habitUnit);
      setDailyGoal(habitData.dailyGoal);
    }
  }, [contextLoading, habitData]);

  // Get database user ID
  useEffect(() => {
    async function getDbUserId() {
      if (!user) return;
      
      try {
        const dbUser = await getUserByClerkId(user.id);
        if (dbUser) {
          setDbUserId(dbUser.id);
        }
      } catch (error) {
        console.error("Failed to get user ID:", error);
      }
    }
    
    getDbUserId();
  }, [user]);

  // Check if user is new
  const isNewUser = !localStorage.getItem('habitSaved');
  
  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-sm mx-auto px-4 pt-6">
        
      <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-800">Your Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your habit challenge</p>
        </div>

        {isNewUser && (
          <Card className="shadow-sm mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <h2 className="font-semibold text-blue-800 mb-2">Welcome to your 6-week challenge!</h2>
              <p className="text-sm text-blue-700">Set up your daily habit below to get started. You'll track this same habit for 6 weeks with your friends.</p>
            </CardContent>
          </Card>
        )}

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Habit Setup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">What habit do you want to build?</label>
<input
                type="text"
                placeholder="e.g., reading, pushups, meditation"
                value={habitName}
                onChange={(e) => setHabitName(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">How do you measure it?</label>
              <select 
                value={habitUnit}
                onChange={(e) => setHabitUnit(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="">Choose unit type...</option>
                <option value="minutes">Minutes</option>
                <option value="reps">Reps</option>
                <option value="pages">Pages</option>
                <option value="hours">Hours</option>
                <option value="times">Times</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Daily goal amount</label>
              <input
                type="number"
                placeholder="e.g., 30, 100, 5"
                min="1"
                value={dailyGoal}
                onChange={(e) => setDailyGoal(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">How much do you want to achieve each day?</p>
            </div>

            <div className="pt-2">
              {!isSaved ? (
                <button 
                onClick={async () => {
                  if (habitName && habitUnit && dailyGoal && dbUserId) {
                    setIsLoading(true);
                    try {
                      // Check if user already has a habit
                      const existingHabits = await getHabitsByUserId(dbUserId);
                      
                      if (existingHabits.length > 0) {
                        // Update existing habit
                        await updateHabit({
                          id: existingHabits[0].id,
                          name: habitName,
                          unit: habitUnit,
                          daily_goal: parseInt(dailyGoal),
                        });
                      } else {
                        // Create new habit
                        await createHabit({
                          user_id: dbUserId,
                          name: habitName,
                          unit: habitUnit,
                          daily_goal: parseInt(dailyGoal),
                        });
                      }
                      
                      // Update context and UI
                      updateHabitContext({ habitName, habitUnit, dailyGoal });
                      localStorage.setItem('habitSaved', 'true');
                      setSavedHabitName(habitName);
                      setSavedHabitUnit(habitUnit);
                      setSavedDailyGoal(dailyGoal);
                      setIsSaved(true);
                    } catch (error) {
                      console.error("Failed to save habit:", error);
                      alert("Failed to save habit. Please try again.");
                    } finally {
                      setIsLoading(false);
                    }
                  } else {
                    alert("Please fill in all fields first!");
                  }
                }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  {isLoading ? "Saving..." : "Save Habit Goal"}
                </button>
              ) : (
                <div className="text-center">
                  <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-3">
                    ✅ Habit saved: {savedDailyGoal} {savedHabitUnit} {savedHabitName}!
                  </div>
                  <button 
                    onClick={() => setIsSaved(false)}
                    className="w-full bg-gray-600 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                  >
                    Edit Habit
                  </button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm mt-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Your Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">15.5</p>
                <p className="text-xs text-gray-600">Total Points</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">78%</p>
                <p className="text-xs text-gray-600">Completion Rate</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <p className="text-2xl font-bold text-orange-600">7</p>
                <p className="text-xs text-gray-600">Day Streak</p>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-600">12</p>
                <p className="text-xs text-gray-600">Days Active</p>
              </div>
            </div>

          </CardContent>
        </Card>
        
        <Card className="shadow-sm mt-6">
          <CardContent className="p-4 text-center">
            <button 
              onClick={async () => {
                if (!user) return;
                try {
                  const dbUser = await getUserByClerkId(user.id);
                  if (dbUser) {
                    const result = await calculateUserCompletionRate(dbUser.id);
                    console.log("User completion rate result:", result);
                    alert(`Your Completion Rate: ${result.completion_rate}%\nCompleted: ${result.completed_days}/${result.total_active_days} days`);
                  }
                } catch (error) {
                  console.error("Test failed:", error);
                  alert("Test failed - check console");
                }
              }}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md text-sm"
            >
              Test My Completion Rate
            </button>

            <button 
              onClick={async () => {
                if (!user) return;
                try {
                  const dbUser = await getUserByClerkId(user.id);
                  if (dbUser) {
                    const result = await calculateUserTotalPoints(dbUser.id);
                    console.log("User total points result:", result);
                    alert(`Your Total Points: ${result} points`);
                  }
                } catch (error) {
                  console.error("Test failed:", error);
                  alert("Test failed - check console");
                }
              }}
              className="w-full bg-green-600 text-white py-2 px-4 rounded-md text-sm mt-2"
            >
              Test My Total Points
            </button>

            <button 
              onClick={async () => {
                if (!user) return;
                try {
                  const dbUser = await getUserByClerkId(user.id);
                  if (dbUser) {
                    const result = await calculateUserDaysActive(dbUser.id);
                    console.log("User days active result:", result);
                    alert(`Your Days Active: ${result} days`);
                  }
                } catch (error) {
                  console.error("Test failed:", error);
                  alert("Test failed - check console");
                }
              }}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md text-sm mt-2"
            >
              Test My Days Active
            </button>
          </CardContent>
        </Card>

        <Card className="shadow-sm mt-6">
          <CardContent className="p-4 text-center">
            <SignOutButton>
              <button className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
                Sign Out
              </button>
            </SignOutButton>
          </CardContent>
        </Card>

      </div>
      <BottomNav />
    </main>
  );
}