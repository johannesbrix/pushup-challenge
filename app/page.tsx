"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useHabit } from "@/context/HabitContext";
import { useUser } from "@clerk/nextjs";
import { createSubmission } from "@/actions/submissions-actions";
import { getUserByClerkId } from "@/actions/users-actions";
import { getHabitsByUserId } from "@/actions/habits-actions";
import BottomNav from "@/components/bottom-nav";
import { getRecentSubmissions } from "@/actions/submissions-actions";

export default function Home() {
  const { habitData } = useHabit();
  const { user } = useUser();
  const [minutes, setMinutes] = useState([parseInt(habitData.dailyGoal)]);
  const [rating, setRating] = useState("5");
  const [message, setMessage] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const dailyGoal = parseInt(habitData.dailyGoal);
  const points = (minutes[0] / dailyGoal).toFixed(1);
  const [recentSubmissions, setRecentSubmissions] = useState([]);
  const [feedLoading, setFeedLoading] = useState(true);

  function formatTimeAgo(dateString: string) {
    const now = new Date();
    const submissionDate = new Date(dateString);
    const diffInMs = now.getTime() - submissionDate.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    
    // Check if it's the same day
    const isSameDay = now.toDateString() === submissionDate.toDateString();
    
    if (isSameDay) {
      if (diffInMinutes < 60) {
        return diffInMinutes <= 1 ? "just now" : `${diffInMinutes}m ago`;
      } else {
        return `${diffInHours}h ago`;
      }
    } else {
      return submissionDate.toLocaleDateString();
    }
  }

  // Load recent submissions for the feed
  useEffect(() => {
    async function loadSubmissions() {
      try {
        const submissions = await getRecentSubmissions(5); // Get last 5 submissions
        setRecentSubmissions(submissions);
      } catch (error) {
        console.error("Failed to load submissions:", error);
      } finally {
        setFeedLoading(false);
      }
    }
    
    loadSubmissions();
  }, [isSubmitted]); // Reload when user submits new data
  
  const resetForm = () => {
    setMinutes([parseInt(habitData.dailyGoal)]);
    setRating("5");
    setMessage("");
    setIsSubmitted(false);
  };

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-sm mx-auto px-4 pt-6">

        <div className="mb-6 text-center">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full inline-block">
            <span className="font-semibold text-sm">Week 2 • Day 10</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">36 days remaining</p>
        </div>

        <Card className="shadow-sm">
        <CardHeader className="pb-4">
            <CardTitle className="text-lg">Daily Check-in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">Today's Goal: {dailyGoal} {habitData.habitUnit} {habitData.habitName}</h3>
              <p className="text-sm text-gray-600">How much did you achieve?</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium">{habitData.habitUnit.charAt(0).toUpperCase() + habitData.habitUnit.slice(1)}: {minutes[0]}</p>
                <span className="text-xs text-gray-500">Goal: {dailyGoal}</span>
              </div>
              <Slider
                value={minutes}
                onValueChange={setMinutes}
                max={dailyGoal * 3}
                min={0}
                step={Math.max(1, Math.floor(dailyGoal / 20))}
                className="w-full mb-4"
              />
              <div className="flex justify-between text-xs text-gray-400 mb-3">
                <span>0</span>
                <span>{Math.floor(dailyGoal * 1.5)}</span>
                <span>{dailyGoal * 3}</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm">
                  {points} points! 🎉
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-3">How did it feel? (1-10)</p>
              <RadioGroup value={rating} onValueChange={setRating} className="space-y-3">
                <div className="flex gap-3 justify-center">
                  {[1,2,3,4,5].map(num => (
                    <div key={num} className="flex items-center space-x-1">
                      <RadioGroupItem value={num.toString()} id={`r${num}`} />
                      <Label htmlFor={`r${num}`} className="text-sm cursor-pointer">{num}</Label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 justify-center">
                  {[6,7,8,9,10].map(num => (
                    <div key={num} className="flex items-center space-x-1">
                      <RadioGroupItem value={num.toString()} id={`r${num}`} />
                      <Label htmlFor={`r${num}`} className="text-sm cursor-pointer">{num}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              <p className="text-sm text-gray-600 mt-2 text-center">Rating: {rating}/10</p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Optional note</p>
              <textarea
                placeholder="How was your session today?"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {!isSubmitted ? (
              <Button 
                className="w-full py-3 text-base font-medium" 
                disabled={isLoading}
                onClick={async () => {
                  if (!user) return;
                  
                  setIsLoading(true);
                  try {
                    // Get user and habit IDs
                    const dbUser = await getUserByClerkId(user.id);
                    if (!dbUser) throw new Error("User not found");
                    
                    const habits = await getHabitsByUserId(dbUser.id);
                    if (habits.length === 0) throw new Error("No habit found");
                    
                    // Save submission to database
                    await createSubmission({
                      user_id: dbUser.id,
                      habit_id: habits[0].id,
                      submission_date: new Date().toISOString().split('T')[0], // Today's date
                      actual_amount: minutes[0],
                      points: parseFloat(points),
                      perceived_rating: rating,
                      note: message || undefined,
                    });
                    
                    setIsSubmitted(true);
                  } catch (error) {
                    console.error("Failed to save submission:", error);
                    alert("Failed to save progress. Please try again.");
                  } finally {
                    setIsLoading(false);
                  }
                }}
              >
                {isLoading ? "Saving..." : "Log Progress"}
              </Button>
            ) : (
              <div className="text-center py-2">
                <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg mb-3">
                  ✅ Progress saved to database!
                </div>
                <Button 
                  variant="outline" 
                  className="w-full py-3" 
                  onClick={resetForm}
                >
                  Log Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-8 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          
          {feedLoading ? (
            <Card className="shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-gray-500">Loading recent activity...</p>
              </CardContent>
            </Card>
          ) : recentSubmissions.length === 0 ? (
            <Card className="shadow-sm">
              <CardContent className="p-4 text-center">
                <p className="text-gray-500">No recent activity yet. Be the first to log progress!</p>
              </CardContent>
            </Card>
          ) : (
            recentSubmissions.map((submission: any) => {
              const isGoalReached = submission.points >= 1.0;
              const userName = submission.user_first_name || "Someone";
              
              return (
                <Card 
                  key={submission.id} 
                  className={`shadow-sm ${isGoalReached ? 'bg-green-50 border-green-200' : ''}`}
                >
                  <CardContent className="p-4">
                  <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">
                          {userName} {isGoalReached ? 'completed their goal! 🎉' : 'logged progress'}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {submission.actual_amount} {submission.habit_unit} {submission.habit_name} • {submission.points} points
                          {submission.note && ` • "${submission.note}"`}
                        </p>
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                        {formatTimeAgo(submission.created_at)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        
      </div>
      <BottomNav />
    </main>
  );
}