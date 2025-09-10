import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="flex justify-around max-w-md mx-auto">
        <Link href="/">
          <Button variant="ghost" size="sm">
            🏠 Home
          </Button>
        </Link>
        <Link href="/leaderboard">
          <Button variant="ghost" size="sm">
            🏆 Leaderboard
          </Button>
        </Link>
        <Link href="/profile">
          <Button variant="ghost" size="sm">
            👤 Profile
          </Button>
        </Link>
      </div>
    </div>
  );
}