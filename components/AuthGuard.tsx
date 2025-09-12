"use client";

import { useUser } from "@clerk/nextjs";
import { SignIn } from "@clerk/nextjs";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Welcome to Pushup Challenge!</h1>
            <p className="text-gray-600 mt-2">Sign in to track your habits with friends</p>
          </div>
          <SignIn routing="hash" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}