"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { calculateLeaderboard, calculateCompletionRate, calculateTotalFriends, calculateGroupPoints } from "@/actions/submissions-actions";
import BottomNav from "@/components/bottom-nav";

export default function Leaderboard() {
  const [completionRate, setCompletionRate] = useState(0);
  const [totalFriends, setTotalFriends] = useState(0);
  const [groupPoints, setGroupPoints] = useState(0);

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-sm mx-auto px-4 pt-6">
        
        <div className="mb-6 text-center">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full inline-block">
            <span className="font-semibold text-sm">Week 2 • Day 10</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">Challenge Progress</p>
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
            />
          </CardContent>
        </Card>

        <Card className="shadow-sm mt-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Challenge Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xl font-bold text-blue-600">{totalFriends}</p>
                <p className="text-xs text-gray-600">Total Friends</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xl font-bold text-green-600">{groupPoints}</p>
                <p className="text-xs text-gray-600">Group Points</p>
              </div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xl font-bold text-purple-600">{completionRate}%</p>
              <p className="text-xs text-gray-600">Average Completion Rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm mt-6">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-800 mb-2">🔥 Keep Going!</p>
              <p className="text-xs text-gray-600">You're doing great! Sarah is only 10 points ahead - you can catch up!</p>
            </div>
          </CardContent>
        </Card>
        
      </div>
      <BottomNav />
    </main>
  );
}

function LeaderboardList({ onCompletionRateLoad, onStatsLoad }: { 
  onCompletionRateLoad: (rate: number) => void;
  onStatsLoad: (friends: number, points: number) => void;
}) {
  const [leaderboard, setLeaderboard] = useState([]);
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
        setLeaderboard(leaderboardData);
        onCompletionRateLoad(completionData.completion_rate);
        onStatsLoad(friendsData, pointsData);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, [onCompletionRateLoad, onStatsLoad]);

  if (isLoading) {
    return <p className="text-center text-gray-600">Loading rankings...</p>;
  }

  if (leaderboard.length === 0) {
    return <p className="text-center text-gray-600">No rankings yet. Start logging progress!</p>;
  }

  return (
    <div className="space-y-3">
      {leaderboard.map((user: any, index) => {
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
                <p className="font-medium text-sm">{user.name}</p>
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