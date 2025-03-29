import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import NutritionCalculator from "@/components/nutrition/NutritionCalculator";

export default function NutritionCalculatorPage() {
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nutrition Calculator</h1>
          <p className="text-sm text-gray-500">Calculate your daily calorie and nutrition needs based on your body metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <NutritionCalculator />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Personalized Tracking</CardTitle>
              <CardDescription>Use the calculator results for your daily goals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                The calculator provides a scientific starting point for your nutrition goals. 
                Track your actual results and adjust as needed based on your progress.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Weight-Based Nutrition</CardTitle>
              <CardDescription>Understand how your body metrics affect your needs</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Your weight, height, age, and activity level all impact how many calories and macronutrients 
                your body needs. This calculator helps you find the right balance.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Macronutrient Balance</CardTitle>
              <CardDescription>Optimal ratios for your specific goals</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Different fitness goals require different macronutrient ratios. Weight loss typically needs 
                higher protein, while muscle gain benefits from more carbs for energy.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>About the Calculation Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              This calculator uses the Mifflin-St Jeor equation to determine your Basal Metabolic Rate (BMR), 
              which is the number of calories your body needs at rest. Your BMR is then adjusted based on your 
              activity level to calculate your Total Daily Energy Expenditure (TDEE).
            </p>
            <p className="text-sm text-gray-600 mb-4">
              For weight loss, we recommend a 20% calorie deficit from your TDEE.
              For maintenance, we use your calculated TDEE.
              For muscle gain, we recommend a 10% calorie surplus above your TDEE.
            </p>
            <p className="text-sm text-gray-600">
              Macronutrient ratios are adjusted based on your fitness goal, with higher protein for weight loss 
              and higher carbohydrates for muscle gain to provide adequate energy for workouts and recovery.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}