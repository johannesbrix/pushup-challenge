import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BottomNav from "@/components/bottom-nav";

export default function Profile() {
  return (
    <main className="min-h-screen p-4 bg-gray-50 pb-20">
      <div className="max-w-md mx-auto pt-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Your profile info coming soon! 👤</p>
          </CardContent>
        </Card>
      </div>
      <BottomNav />
    </main>
  );
}