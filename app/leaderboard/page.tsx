import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/bottom-nav";

export default function Leaderboard() {
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
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-yellow-600">🥇</span>
                  <div>
                    <p className="font-medium text-sm">Sarah</p>
                    <p className="text-xs text-gray-600">25.5 points • 12 day streak</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-yellow-600">#1</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-600">🥈</span>
                  <div>
                    <p className="font-medium text-sm">You</p>
                    <p className="text-xs text-gray-600">15.5 points • 7 day streak</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-600">#2</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-orange-600">🥉</span>
                  <div>
                    <p className="font-medium text-sm">John</p>
                    <p className="text-xs text-gray-600">12.0 points • 5 day streak</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-orange-600">#3</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">4</span>
                  <div>
                    <p className="font-medium text-sm">Mike</p>
                    <p className="text-xs text-gray-600">8.5 points • 3 day streak</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-400">#4</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">5</span>
                  <div>
                    <p className="font-medium text-sm">Lisa</p>
                    <p className="text-xs text-gray-600">6.0 points • 2 day streak</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-400">#5</span>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-400">6</span>
                  <div>
                    <p className="font-medium text-sm">Alex</p>
                    <p className="text-xs text-gray-600">2.5 points • 1 day streak</p>
                  </div>
                </div>
                <span className="text-sm font-bold text-gray-400">#6</span>
              </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm mt-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">Challenge Stats</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <p className="text-xl font-bold text-blue-600">6</p>
                <p className="text-xs text-gray-600">Total Friends</p>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <p className="text-xl font-bold text-green-600">69.5</p>
                <p className="text-xs text-gray-600">Group Points</p>
              </div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-xl font-bold text-purple-600">83%</p>
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