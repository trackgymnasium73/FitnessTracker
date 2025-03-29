import { useState } from "react";
import { format } from "date-fns";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Food, FoodLog } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AddFoodForm from "@/components/nutrition/AddFoodForm";
import DailyOverview from "@/components/dashboard/DailyOverview";
import ContributeSection from "@/components/dashboard/ContributeSection";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FoodLogWithDetails extends FoodLog {
  food?: Food;
}

export default function Nutrition() {
  const [date, setDate] = useState(new Date());
  const [mealType, setMealType] = useState("breakfast");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // In a real app, this userId would come from auth context
  const userId = 1;

  // Fetch food logs for the selected date
  const { data: foodLogs, isLoading } = useQuery<FoodLogWithDetails[]>({
    queryKey: [`/api/food-logs/${userId}`, { date: date.toISOString().split('T')[0] }],
    enabled: false, // Disabled for demo, would be enabled in a real app
  });

  // Current user nutritional goals - would come from user profile in a real app
  const nutritionGoals = {
    calories: 2200,
    protein: 140,
    carbs: 220,
    fat: 70
  };

  // Sample data for demo
  const sampleFoodLogs: FoodLogWithDetails[] = [
    {
      id: 1,
      userId: 1,
      foodId: 1,
      quantity: 1,
      mealType: "breakfast",
      date: new Date(),
      food: {
        id: 1,
        name: "Greek Yogurt",
        calories: 230,
        protein: 22,
        carbs: 9,
        fat: 8,
        servingSize: 200,
        servingUnit: "g",
        addedByUserId: null
      }
    },
    {
      id: 2,
      userId: 1,
      foodId: 2,
      quantity: 2,
      mealType: "breakfast",
      date: new Date(),
      food: {
        id: 2,
        name: "Whole Grain Toast",
        calories: 90,
        protein: 3,
        carbs: 16,
        fat: 1,
        servingSize: 1,
        servingUnit: "slice",
        addedByUserId: null
      }
    },
    {
      id: 3,
      userId: 1,
      foodId: 3,
      quantity: 1,
      mealType: "breakfast",
      date: new Date(),
      food: {
        id: 3,
        name: "Banana",
        calories: 105,
        protein: 1,
        carbs: 27,
        fat: 0,
        servingSize: 1,
        servingUnit: "medium",
        addedByUserId: null
      }
    },
    {
      id: 4,
      userId: 1,
      foodId: 4,
      quantity: 1,
      mealType: "lunch",
      date: new Date(),
      food: {
        id: 4,
        name: "Grilled Chicken Breast",
        calories: 165,
        protein: 31,
        carbs: 0,
        fat: 3.6,
        servingSize: 100,
        servingUnit: "g",
        addedByUserId: null
      }
    },
    {
      id: 5,
      userId: 1,
      foodId: 5,
      quantity: 1,
      mealType: "lunch",
      date: new Date(),
      food: {
        id: 5,
        name: "Brown Rice",
        calories: 216,
        protein: 5,
        carbs: 45,
        fat: 1.8,
        servingSize: 200,
        servingUnit: "g",
        addedByUserId: null
      }
    },
    {
      id: 6,
      userId: 1,
      foodId: 6,
      quantity: 1,
      mealType: "lunch",
      date: new Date(),
      food: {
        id: 6,
        name: "Broccoli",
        calories: 55,
        protein: 3.7,
        carbs: 11.2,
        fat: 0.6,
        servingSize: 100,
        servingUnit: "g",
        addedByUserId: null
      }
    }
  ];

  const displayedFoodLogs = foodLogs || sampleFoodLogs;
  const filteredLogs = displayedFoodLogs.filter(log => log.mealType === mealType);

  // Calculate daily totals
  const dailyTotals = displayedFoodLogs.reduce((totals, log) => {
    if (log.food) {
      totals.calories += log.food.calories * log.quantity;
      totals.protein += log.food.protein * log.quantity;
      totals.carbs += log.food.carbs * log.quantity;
      totals.fat += log.food.fat * log.quantity;
    }
    return totals;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Calculate meal totals
  const mealTotals = filteredLogs.reduce((totals, log) => {
    if (log.food) {
      totals.calories += log.food.calories * log.quantity;
      totals.protein += log.food.protein * log.quantity;
      totals.carbs += log.food.carbs * log.quantity;
      totals.fat += log.food.fat * log.quantity;
    }
    return totals;
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Current nutritional progress
  const nutritionProgress = {
    calories: { 
      consumed: dailyTotals.calories, 
      goal: nutritionGoals.calories, 
      remaining: nutritionGoals.calories - dailyTotals.calories 
    },
    protein: { 
      consumed: dailyTotals.protein, 
      goal: nutritionGoals.protein, 
      remaining: nutritionGoals.protein - dailyTotals.protein 
    },
    carbs: { 
      consumed: dailyTotals.carbs, 
      goal: nutritionGoals.carbs, 
      remaining: nutritionGoals.carbs - dailyTotals.carbs 
    },
    fat: { 
      consumed: dailyTotals.fat, 
      goal: nutritionGoals.fat, 
      remaining: nutritionGoals.fat - dailyTotals.fat 
    }
  };

  const handleDeleteFoodLog = async (logId: number) => {
    try {
      await apiRequest("DELETE", `/api/food-logs/${logId}`, undefined);
      await queryClient.invalidateQueries({ queryKey: [`/api/food-logs/${userId}`] });
      toast({
        title: "Food removed",
        description: "The food item has been removed from your log",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove food item. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nutrition Tracker</h1>
          <p className="text-sm text-gray-500">Track and manage your daily food intake</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center">
          <Link href="/nutrition/calculator">
            <a className="mr-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Nutrition Calculator
            </a>
          </Link>
          <span className="text-sm font-medium text-gray-500">Today's Date:</span>
          <span className="ml-2 text-sm font-medium text-gray-900">{format(date, "MMMM d, yyyy")}</span>
        </div>
      </div>

      <DailyOverview nutritionProgress={nutritionProgress} />

      <section className="mb-8">
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Food Tracker</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-500 hover:bg-blue-600">
                    <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Food
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Food to Tracker</DialogTitle>
                  </DialogHeader>
                  <AddFoodForm mealType={mealType} onSuccess={() => setDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>

            <Tabs defaultValue="breakfast" value={mealType} onValueChange={setMealType}>
              <TabsList className="border-b border-gray-200 pb-2 mb-4 space-x-8">
                <TabsTrigger value="breakfast">Breakfast</TabsTrigger>
                <TabsTrigger value="lunch">Lunch</TabsTrigger>
                <TabsTrigger value="dinner">Dinner</TabsTrigger>
                <TabsTrigger value="snacks">Snacks</TabsTrigger>
              </TabsList>
              
              <TabsContent value={mealType}>
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    </div>
                  ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Food
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantity
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Calories
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Protein
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Carbs
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fat
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredLogs.map(log => (
                          <tr key={log.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {log.food?.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {log.quantity} {log.food?.servingUnit}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                              {log.food ? Math.round(log.food.calories * log.quantity) : 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                              {log.food ? (log.food.protein * log.quantity).toFixed(1) : 0}g
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                              {log.food ? (log.food.carbs * log.quantity).toFixed(1) : 0}g
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                              {log.food ? (log.food.fat * log.quantity).toFixed(1) : 0}g
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button className="text-gray-400 hover:text-gray-500">
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                              </button>
                              <button 
                                className="text-gray-400 hover:text-red-500 ml-3"
                                onClick={() => handleDeleteFoodLog(log.id)}
                              >
                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot className="bg-gray-50">
                        <tr>
                          <td className="px-6 py-3 text-right text-sm font-medium text-gray-500" colSpan={2}>
                            Meal Total:
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900 font-mono">
                            {Math.round(mealTotals.calories)}
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900 font-mono">
                            {mealTotals.protein.toFixed(1)}g
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900 font-mono">
                            {mealTotals.carbs.toFixed(1)}g
                          </td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900 font-mono">
                            {mealTotals.fat.toFixed(1)}g
                          </td>
                          <td></td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Nutrition Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                  <span>Calories</span>
                </div>
                <div className="text-sm font-medium">
                  {Math.round(dailyTotals.calories)} / {nutritionGoals.calories} kcal
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span>Protein</span>
                </div>
                <div className="text-sm font-medium">
                  {dailyTotals.protein.toFixed(1)} / {nutritionGoals.protein}g
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span>Carbs</span>
                </div>
                <div className="text-sm font-medium">
                  {dailyTotals.carbs.toFixed(1)} / {nutritionGoals.carbs}g
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-3 h-3 rounded-full bg-purple-500 mr-2"></div>
                  <span>Fat</span>
                </div>
                <div className="text-sm font-medium">
                  {dailyTotals.fat.toFixed(1)} / {nutritionGoals.fat}g
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Macronutrient Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center items-center h-48">
              <div className="grid grid-cols-3 gap-4 w-full">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(dailyTotals.protein / (dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat) * 100 || 0)}%
                  </div>
                  <div className="text-sm text-gray-500">Protein</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-500">
                    {Math.round(dailyTotals.carbs / (dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat) * 100 || 0)}%
                  </div>
                  <div className="text-sm text-gray-500">Carbs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-500">
                    {Math.round(dailyTotals.fat / (dailyTotals.protein + dailyTotals.carbs + dailyTotals.fat) * 100 || 0)}%
                  </div>
                  <div className="text-sm text-gray-500">Fat</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <ContributeSection />
    </div>
  );
}
