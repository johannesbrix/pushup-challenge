import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/bottom-nav"

export default function Leaderboard() {
    return (
        <main className="min-h-screen p-4 bg-gray-50">
        <div className="max-w-md mx-auto pt-8">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Rankings coming soon! 🏆</p>
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </main>
    )

}