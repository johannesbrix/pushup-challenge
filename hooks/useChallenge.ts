import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { getUserByClerkId } from '@/actions/users-actions';
import { calculateChallengeProgress, getDailyMotivationalMessage } from '@/actions/submissions-actions';

export function useChallenge() {
  const { user } = useUser();
  const [dailyMessage, setDailyMessage] = useState("...");
  const [challengeProgress, setChallengeProgress] = useState({ day: 0, week: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadChallengeData() {
      try {
        // Load daily message (no user needed)
        const message = await getDailyMotivationalMessage();
        setDailyMessage(message);

        // Load challenge progress (needs user)
        if (user) {
          const dbUser = await getUserByClerkId(user.id);
          if (dbUser) {
            const progress = await calculateChallengeProgress(dbUser.id);
            setChallengeProgress(progress);
          }
        }
      } catch (error) {
        console.error("Failed to load challenge data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadChallengeData();
  }, [user]);

  return {
    dailyMessage,
    challengeProgress,
    isLoading
  };
}