import { useState } from "react";
import { format } from "date-fns";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DailyOverview from "@/components/dashboard/DailyOverview";
import FoodTracker from "@/components/dashboard/FoodTracker";
import RecommendedRecipes from "@/components/dashboard/RecommendedRecipes";
import ExerciseTracker from "@/components/dashboard/ExerciseTracker";
import ShopSection from "@/components/dashboard/ShopSection";
import ContributeSection from "@/components/dashboard/ContributeSection";
import WaterTracker from "@/components/dashboard/WaterTracker";

export default function Dashboard() {
  // In a real app, this would come from a user context or API
  const [user] = useState({
    firstName: "Alex",
    lastName: "Smith",
    fitnessGoal: "musclegain",
    dailyCalorieGoal: 2200,
    dailyProteinGoal: 140,
    dailyCarbsGoal: 220,
    dailyFatGoal: 70
  });

  // Current nutritional progress
  const [nutritionProgress] = useState({
    calories: { consumed: 1450, goal: user.dailyCalorieGoal, remaining: user.dailyCalorieGoal - 1450 },
    protein: { consumed: 85, goal: user.dailyProteinGoal, remaining: user.dailyProteinGoal - 85 },
    carbs: { consumed: 120, goal: user.dailyCarbsGoal, remaining: user.dailyCarbsGoal - 120 },
    fat: { consumed: 45, goal: user.dailyFatGoal, remaining: user.dailyFatGoal - 45 }
  });

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user.firstName}</h1>
          <p className="text-sm text-gray-500">Track your fitness journey and nutrition goals</p>
        </div>
        <div className="mt-4 md:mt-0">
          <span className="text-sm font-medium text-gray-500">Today's Date:</span>
          <span className="ml-2 text-sm font-medium text-gray-900">{format(new Date(), "MMMM d, yyyy")}</span>
        </div>
      </div>

      <DailyOverview nutritionProgress={nutritionProgress} />
      
      <FoodTracker />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
        <div className="md:col-span-2">
          <RecommendedRecipes nutritionProgress={nutritionProgress} fitnessGoal={user.fitnessGoal} />
        </div>
        <div className="md:col-span-1">
          <WaterTracker userId={1} targetIntake={2500} />
        </div>
      </div>
      
      <div className="mt-8">
        <ExerciseTracker />
      </div>
      
      <div className="mt-8 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 shadow-md border-0">
          <CardContent className="p-0">
            <div className="flex flex-col md:flex-row items-center p-6">
              <div className="flex-1 mb-4 md:mb-0 md:mr-6">
                <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                  Calculate Your Personal Nutrition Needs
                </CardTitle>
                <CardDescription className="text-gray-600 mb-4">
                  Our nutrition calculator uses your weight, height, age, and activity level to determine your optimal calorie and macronutrient targets. Get personalized nutrition goals based on your fitness objectives.
                </CardDescription>
                <Link href="/nutrition/calculator">
                  <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    Go to Calculator
                  </a>
                </Link>
              </div>
              <div className="flex flex-col items-center justify-center text-center">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-blue-500 font-mono text-lg font-bold">Calories</div>
                    <div className="text-sm text-gray-500">Personalized targets</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-green-500 font-mono text-lg font-bold">Protein</div>
                    <div className="text-sm text-gray-500">For your body weight</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-yellow-500 font-mono text-lg font-bold">Carbs</div>
                    <div className="text-sm text-gray-500">Fuel your workouts</div>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow-sm">
                    <div className="text-purple-500 font-mono text-lg font-bold">Fat</div>
                    <div className="text-sm text-gray-500">For hormone health</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ShopSection />
      
      <ContributeSection />
    </div>
  );
}
