"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useHabit } from "@/context/HabitContext";
import { SignOutButton } from "@clerk/nextjs";
import BottomNav from "@/components/bottom-nav";

export default function Profile() {
  const { habitData, updateHabit } = useHabit();
  const [habitName, setHabitName] = useState(habitData.habitName);
  const [habitUnit, setHabitUnit] = useState(habitData.habitUnit);
  const [dailyGoal, setDailyGoal] = useState(habitData.dailyGoal);
  const [isSaved, setIsSaved] = useState(false);
  const [savedHabitName, setSavedHabitName] = useState("");
  const [savedHabitUnit, setSavedHabitUnit] = useState("");
  const [savedDailyGoal, setSavedDailyGoal] = useState("");
  
  // Check if user is new (hasn't saved anything yet)
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
                onClick={() => {
                  if (habitName && habitUnit && dailyGoal) {
                    updateHabit({ habitName, habitUnit, dailyGoal });
                    localStorage.setItem('habitSaved', 'true');
                    setSavedHabitName(habitName);
                    setSavedHabitUnit(habitUnit);
                    setSavedDailyGoal(dailyGoal);
                    setIsSaved(true);
                  } else {
                    alert("Please fill in all fields first!");
                  }
                }}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-md font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  Save Habit Goal
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