"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHabit } from "@/context/HabitContext";
import { useUser } from "@clerk/nextjs";
import { SignOutButton } from "@clerk/nextjs";
import { createHabit, getHabitsByUserId, updateHabit } from "@/actions/habits-actions";
import { getUserByClerkId } from "@/actions/users-actions";
import { calculateUserCompletionRate, calculateUserTotalPoints, calculateUserDaysActive, calculateUserDayStreak } from "@/actions/submissions-actions";
import BottomNav from "@/components/bottom-nav";
import { Skeleton } from "@/components/ui/skeleton";
import { updateUserNames, updateUserPrivacySettings } from "@/actions/users-actions";
import { Switch } from "@/components/ui/switch";

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
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    completionRate: 0,
    dayStreak: 0,
    daysActive: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [namesLoading, setNamesLoading] = useState(true);
  const [namesSaved, setNamesSaved] = useState(false);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(true);
  const [showPostsInFeed, setShowPostsInFeed] = useState(true);
  const [privacyLoading, setPrivacyLoading] = useState(true);
  const [privacySaved, setPrivacySaved] = useState(false);

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
        console.error("Failed to get user ID");
      }
    }
    
    getDbUserId();
  }, [user]);

  // Load user stats
  useEffect(() => {
    async function loadUserStats() {
      if (!user) return;
      
      try {
        const dbUser = await getUserByClerkId(user.id);
        if (dbUser) {
          const [totalPoints, completionData, dayStreak, daysActive] = await Promise.all([
            calculateUserTotalPoints(dbUser.id),
            calculateUserCompletionRate(dbUser.id),
            calculateUserDayStreak(dbUser.id),
            calculateUserDaysActive(dbUser.id)
          ]);
          
          setUserStats({
            totalPoints,
            completionRate: completionData.completion_rate,
            dayStreak,
            daysActive,
          });
        }
      } catch (error) {
        console.error("Failed to load user stats");
      } finally {
        setStatsLoading(false);
      }
    }
    
    loadUserStats();
  }, [user]);

  // Load current user names
  useEffect(() => {
    async function loadUserNames() {
      if (!user) return;
      
      try {
        const dbUser = await getUserByClerkId(user.id);
        if (dbUser) {
          setFirstName(dbUser.first_name || "");
          setLastName(dbUser.last_name || "");
        }
      } catch (error) {
        console.error("Failed to load user names");
      } finally {
        setNamesLoading(false);
      }
    }
    
    loadUserNames();
  }, [user]);

  // Load current privacy settings
  useEffect(() => {
    async function loadPrivacySettings() {
      if (!user) return;
      
      try {
        const dbUser = await getUserByClerkId(user.id);
        if (dbUser) {
          setShowOnLeaderboard(dbUser.show_on_leaderboard ?? true);
          setShowPostsInFeed(dbUser.show_posts_in_feed ?? true);
        }
      } catch (error) {
        console.error("Failed to load privacy settings");
      } finally {
        setPrivacyLoading(false);
      }
    }
    
    loadPrivacySettings();
  }, [user]);
  
  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-sm mx-auto px-4 pt-6">
        
      <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-gray-800">Your Profile</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your habit challenge</p>
        </div>

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
                      setSavedHabitName(habitName);
                      setSavedHabitUnit(habitUnit);
                      setSavedDailyGoal(dailyGoal);
                      setIsSaved(true);
                    } catch (error) {
                      console.error("Failed to save habit");
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
          {statsLoading ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-3 w-20 mx-auto" />
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Skeleton className="h-8 w-16 mx-auto mb-2" />
                    <Skeleton className="h-3 w-24 mx-auto" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <Skeleton className="h-8 w-12 mx-auto mb-2" />
                    <Skeleton className="h-3 w-16 mx-auto" />
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Skeleton className="h-8 w-12 mx-auto mb-2" />
                    <Skeleton className="h-3 w-18 mx-auto" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{userStats.totalPoints}</p>
                    <p className="text-xs text-gray-600">Total Points</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{userStats.completionRate}%</p>
                    <p className="text-xs text-gray-600">Completion Rate</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-600">{userStats.dayStreak}</p>
                    <p className="text-xs text-gray-600">Day Streak</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-600">{userStats.daysActive}</p>
                    <p className="text-xs text-gray-600">Days Active</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm mt-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Name Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Display Name</h3>
              {namesLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">First Name</label>
                    <input
                      type="text"
                      placeholder="Enter your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Last Name</label>
                    <input
                      type="text"
                      placeholder="Enter your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {!namesSaved ? (
                    <button 
                      onClick={async () => {
                        if (!user) return;
                        try {
                          await updateUserNames({
                            clerk_id: user.id,
                            first_name: firstName,
                            last_name: lastName,
                          });
                          setNamesSaved(true);
                        } catch (error) {
                          console.error("Failed to update names");
                          alert("Failed to update names. Please try again.");
                        }
                      }}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                    >
                      Save Names
                    </button>
                  ) : (
                    <div className="text-center">
                      <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-3">
                        ✅ Names updated successfully!
                      </div>
                      <button 
                        onClick={() => setNamesSaved(false)}
                        className="w-full bg-gray-600 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                      >
                        Edit Names
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Privacy Settings Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Privacy Settings</h3>
              {privacyLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Display on Leaderboard</p>
                      <p className="text-xs text-gray-600">Show your progress and ranking to other users</p>
                    </div>
                    <Switch
                      checked={showOnLeaderboard}
                      onCheckedChange={setShowOnLeaderboard}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">Show Posts in Public Feed</p>
                      <p className="text-xs text-gray-600">Display your activity updates in the public feed</p>
                    </div>
                    <Switch
                      checked={showPostsInFeed}
                      onCheckedChange={setShowPostsInFeed}
                    />
                  </div>

                  {!privacySaved ? (
                    <button 
                      onClick={async () => {
                        if (!user) return;
                        try {
                          await updateUserPrivacySettings({
                            clerk_id: user.id,
                            show_on_leaderboard: showOnLeaderboard,
                            show_posts_in_feed: showPostsInFeed,
                          });
                          setPrivacySaved(true);
                        } catch (error) {
                          console.error("Failed to update privacy settings");
                          alert("Failed to update privacy settings. Please try again.");
                        }
                      }}
                      className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                    >
                      Save Privacy Settings
                    </button>
                  ) : (
                    <div className="text-center">
                      <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-3">
                        ✅ Privacy settings updated successfully!
                      </div>
                      <button 
                        onClick={() => setPrivacySaved(false)}
                        className="w-full bg-gray-600 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                      >
                        Edit Privacy Settings
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200"></div>

            {/* Sign Out Section */}
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-4">Account Actions</h3>
              <SignOutButton>
                <button className="w-full bg-red-600 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors">
                  Sign Out
                </button>
              </SignOutButton>
            </div>
          </CardContent>
        </Card>

      </div>
      <BottomNav />
    </main>
  );
}