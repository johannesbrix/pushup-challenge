"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateLeaderboard, calculateCompletionRate, calculateTotalFriends, calculateGroupPoints, generateMotivationalMessage } from "@/actions/submissions-actions";
import BottomNav from "@/components/bottom-nav";
import { useUser } from "@clerk/nextjs";
import { useChallenge } from "@/hooks/useChallenge";
import { getUserByClerkId } from "@/actions/users-actions";
import { Skeleton } from "@/components/ui/skeleton";

// Define types
interface LeaderboardUser {
  user_id: string;
  name: string;
  total_score: number;
}

export default function Leaderboard() {
  const { user } = useUser();
  const { dailyMessage, challengeProgress } = useChallenge();
  const [completionRate, setCompletionRate] = useState(0);
  const [totalFriends, setTotalFriends] = useState(0);
  const [groupPoints, setGroupPoints] = useState(0);
  const [motivationalMessage, setMotivationalMessage] = useState("");

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-sm mx-auto px-4 pt-6">
        
        <div className="mb-6 text-center">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full inline-block">
            <span className="font-semibold text-sm">
              {challengeProgress.day > 0 ? `Week ${challengeProgress.week} • Day ${challengeProgress.day}` : "Week X • Day X"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{dailyMessage}</p>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Rankings 🏆</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LeaderboardList 
              onCompletionRateLoad={setCompletionRate} 
              onStatsLoad={(friends, points) => {
                setTotalFriends(friends);
                setGroupPoints(points);
              }}
              onMotivationalMessageLoad={setMotivationalMessage}
              userId={user?.id || null}
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm mt-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Challenge Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {totalFriends === 0 && completionRate === 0 && groupPoints === 0 ? (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Skeleton className="h-6 w-8 mx-auto mb-2" />
                    <Skeleton className="h-3 w-20 mx-auto" />
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Skeleton className="h-6 w-12 mx-auto mb-2" />
                    <Skeleton className="h-3 w-24 mx-auto" />
                  </div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <Skeleton className="h-8 w-16 mx-auto mb-2" />
                  <Skeleton className="h-3 w-20 mx-auto" />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-xl font-bold text-blue-600">{totalFriends}</p>
                    <p className="text-xs text-gray-600">Total Friends</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <p className="text-xl font-bold text-purple-600">{completionRate}%</p>
                    <p className="text-xs text-gray-600">Completion Rate</p>
                  </div>
                </div>
                
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">{groupPoints}</p>
                  <p className="text-xs text-gray-600">Group Points</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm mt-6">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800 mb-2">🔥 Keep Going!</p>
              {motivationalMessage ? (
                <p className="text-xs text-gray-600">{motivationalMessage}</p>
              ) : (
                <div className="space-y-2">
                  <Skeleton className="h-3 w-48 mx-auto" />
                  <Skeleton className="h-3 w-32 mx-auto" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
      </div>
      <BottomNav />
    </main>
  );
}

function LeaderboardList({ onCompletionRateLoad, onStatsLoad, onMotivationalMessageLoad, userId }: { 
  onCompletionRateLoad: (rate: number) => void;
  onStatsLoad: (friends: number, points: number) => void;
  onMotivationalMessageLoad: (message: string) => void;
  userId: string | null;
}) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [leaderboardData, completionData, friendsData, pointsData] = await Promise.all([
          calculateLeaderboard(),
          calculateCompletionRate(),
          calculateTotalFriends(),
          calculateGroupPoints()
        ]);
        setLeaderboard(leaderboardData as LeaderboardUser[]);
        onCompletionRateLoad(completionData.completion_rate);
        onStatsLoad(friendsData, pointsData);
        
        // Load motivational message if user is available
        if (userId) {
          const dbUser = await getUserByClerkId(userId);
          if (dbUser) {
            const message = await generateMotivationalMessage(dbUser.id);
            onMotivationalMessageLoad(message);
          }
        }
      } catch (error) {
        console.error("Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [onCompletionRateLoad, onStatsLoad, onMotivationalMessageLoad, userId]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Skeleton className="h-6 w-6 rounded" />
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-4 w-8" />
          </div>
        ))}
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return <p className="text-center text-gray-600">No rankings yet. Start logging progress!</p>;
  }

  return (
    <div className="space-y-3">
      {leaderboard.map((user: LeaderboardUser, index) => {
        const isFirst = index === 0;
        const isSecond = index === 1;
        const isThird = index === 2;
        
        let bgColor = "bg-white border-gray-200";
        let medal = `${index + 1}`;
        
        if (isFirst) {
          bgColor = "bg-yellow-50 border-yellow-200";
          medal = "🥇";
        } else if (isSecond) {
          bgColor = "bg-gray-50 border-gray-200";
          medal = "🥈";
        } else if (isThird) {
          bgColor = "bg-orange-50 border-orange-200";
          medal = "🥉";
        }
        
        return (
          <div key={user.user_id} className={`flex items-center justify-between p-3 ${bgColor} border rounded-lg`}>
            <div className="flex items-center space-x-3">
              <span className="text-lg font-bold text-gray-600">{medal}</span>
              <div>
                <p className="font-medium text-sm">{user.name.length > 25 ? user.name.substring(0, 25) + "..." : user.name}</p>
                <p className="text-xs text-gray-600">{user.total_score} points</p>
              </div>
            </div>
            <span className="text-sm font-bold text-gray-600">#{index + 1}</span>
          </div>
        );
      })}
    </div>
  );
}