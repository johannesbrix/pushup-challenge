"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import BottomNav from "@/components/bottom-nav";

export default function Home() {
  const [minutes, setMinutes] = useState([30]);
  const [rating, setRating] = useState("5");
  const dailyGoal = 30;
  const points = (minutes[0] / dailyGoal).toFixed(1);
  const [isSubmitted, setIsSubmitted] = useState(false);  
  const [message, setMessage] = useState("");

  const resetForm = () => {
    setMinutes([30]);
    setRating("5");
    setMessage("");
    setIsSubmitted(false);
  };

  return (
    <main className="min-h-screen p-4 bg-gray-50 pb-20">
      <div className="max-w-md mx-auto pt-8">

        <div className="mb-4 text-center">
          <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full inline-block">
            <span className="font-semibold text-sm">Week 2 • Day 10</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">36 days remaining</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily Check-in</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Today's Goal: {dailyGoal} minutes reading</h3>
              <p className="text-sm text-gray-600">How much did you achieve?</p>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-medium">Minutes: {minutes[0]}</p>
                <span className="text-xs text-gray-500">Goal: {dailyGoal}</span>
              </div>
              <Slider
                value={minutes}
                onValueChange={setMinutes}
                max={90}
                min={0}
                step={5}
                className="w-full mb-3"
              />
              <div className="flex justify-between text-xs text-gray-400 mb-2">
                <span>0</span>
                <span>45</span>
                <span>90</span>
              </div>
              <div className="text-center">
                <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-bold">
                  {points} points! 🎉
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">How did it feel? (1-10)</p>
              <RadioGroup value={rating} onValueChange={setRating} className="space-y-2">
                <div className="flex gap-2 justify-center">
                  {[1,2,3,4,5].map(num => (
                    <div key={num} className="flex items-center space-x-1">
                      <RadioGroupItem value={num.toString()} id={`r${num}`} />
                      <Label htmlFor={`r${num}`} className="text-sm">{num}</Label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 justify-center">
                  {[6,7,8,9,10].map(num => (
                    <div key={num} className="flex items-center space-x-1">
                      <RadioGroupItem value={num.toString()} id={`r${num}`} />
                      <Label htmlFor={`r${num}`} className="text-sm">{num}</Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              <p className="text-sm text-gray-600 mt-1">Rating: {rating}/10</p>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">Optional note</p>
              <textarea
                placeholder="How was your session today?"
                rows={2}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {!isSubmitted ? (
              <Button 
                className="w-full" 
                onClick={() => setIsSubmitted(true)}
              >
                Log Progress
              </Button>
            ) : (
              <div className="text-center py-4">
                <div className="bg-green-100 text-green-700 px-4 py-3 rounded-lg">
                  ✅ Progress logged successfully!
                </div>
                <Button 
                  variant="outline" 
                  className="mt-3 w-full" 
                  onClick={resetForm}
                >
                  Log Again
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <BottomNav />

      <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
          
          <Card>
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">John logged progress</p>
                  <p className="text-xs text-gray-600">45 pushups • 0.45 points • "Feeling strong today!"</p>
                </div>
                <span className="text-xs text-gray-400">2h ago</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-sm">Sarah completed her goal! 🎉</p>
                  <p className="text-xs text-gray-600">35 minutes meditation • 1.17 points</p>
                </div>
                <span className="text-xs text-gray-400">4h ago</span>
              </div>
            </CardContent>
          </Card>
        </div>
    </main>
  );
}