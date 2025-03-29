import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Define the schema for form validation
const calculatorSchema = z.object({
  weight: z.string().min(1, "Weight is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Weight must be a positive number",
  }),
  weightUnit: z.enum(["kg", "lbs"]),
  height: z.string().min(1, "Height is required").refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Height must be a positive number",
  }),
  heightUnit: z.enum(["cm", "in"]),
  age: z.string().min(1, "Age is required").refine(val => !isNaN(parseInt(val)) && parseInt(val) > 0, {
    message: "Age must be a positive number",
  }),
  gender: z.enum(["male", "female"]),
  activityLevel: z.enum(["sedentary", "light", "moderate", "active", "veryActive"]),
  goal: z.enum(["weightLoss", "maintenance", "muscleGain"]),
});

type CalculatorFormValues = z.infer<typeof calculatorSchema>;

interface NutritionRequirements {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export default function NutritionCalculator() {
  const [calculatedNeeds, setCalculatedNeeds] = useState<NutritionRequirements | null>(null);
  const [calculatorTab, setCalculatorTab] = useState<"tdee" | "macros">("tdee");

  // Initialize form
  const form = useForm<CalculatorFormValues>({
    resolver: zodResolver(calculatorSchema),
    defaultValues: {
      weight: "",
      weightUnit: "kg",
      height: "",
      heightUnit: "cm",
      age: "",
      gender: "male",
      activityLevel: "moderate",
      goal: "maintenance",
    },
  });

  // Activity level multipliers
  const activityMultipliers = {
    sedentary: 1.2, // Little or no exercise
    light: 1.375, // Light exercise 1-3 days/week
    moderate: 1.55, // Moderate exercise 3-5 days/week
    active: 1.725, // Hard exercise 6-7 days/week
    veryActive: 1.9, // Very hard exercise & physical job or 2x training
  };

  // Goal adjustments
  const goalAdjustments = {
    weightLoss: 0.8, // 20% caloric deficit
    maintenance: 1.0, // No adjustment
    muscleGain: 1.1, // 10% caloric surplus
  };

  // Macro ratios for different goals (protein/carbs/fat)
  const macroRatios = {
    weightLoss: { protein: 0.4, carbs: 0.3, fat: 0.3 }, // Higher protein for weight loss
    maintenance: { protein: 0.3, carbs: 0.45, fat: 0.25 },
    muscleGain: { protein: 0.3, carbs: 0.5, fat: 0.2 }, // Higher carbs for muscle gain
  };

  // Calculate TDEE (Total Daily Energy Expenditure)
  const calculateTDEE = (data: CalculatorFormValues): number => {
    // Convert weight to kg if needed
    const weightInKg = data.weightUnit === "kg"
      ? parseFloat(data.weight)
      : parseFloat(data.weight) * 0.453592;
    
    // Convert height to cm if needed
    const heightInCm = data.heightUnit === "cm"
      ? parseFloat(data.height)
      : parseFloat(data.height) * 2.54;
    
    const age = parseInt(data.age);
    
    // Calculate BMR using Mifflin-St Jeor Equation
    let bmr = 0;
    if (data.gender === "male") {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age + 5;
    } else {
      bmr = 10 * weightInKg + 6.25 * heightInCm - 5 * age - 161;
    }
    
    // Apply activity multiplier
    const tdee = bmr * activityMultipliers[data.activityLevel];
    
    // Apply goal adjustment
    return tdee * goalAdjustments[data.goal];
  };

  // Calculate macros based on TDEE
  const calculateMacros = (tdee: number, goal: CalculatorFormValues["goal"]): NutritionRequirements => {
    const ratios = macroRatios[goal];
    
    // Calorie distribution
    const proteinCalories = tdee * ratios.protein;
    const carbCalories = tdee * ratios.carbs;
    const fatCalories = tdee * ratios.fat;
    
    // Convert to grams (protein: 4 cal/g, carbs: 4 cal/g, fat: 9 cal/g)
    const protein = Math.round(proteinCalories / 4);
    const carbs = Math.round(carbCalories / 4);
    const fat = Math.round(fatCalories / 9);
    
    return {
      calories: Math.round(tdee),
      protein,
      carbs,
      fat,
    };
  };

  // Form submission handler
  const onSubmit = (data: CalculatorFormValues) => {
    const tdee = calculateTDEE(data);
    const macros = calculateMacros(tdee, data.goal);
    setCalculatedNeeds(macros);
    setCalculatorTab("macros");
  };

  // Helper function for activity level label
  const getActivityLevelLabel = (level: string): string => {
    switch (level) {
      case "sedentary": return "Sedentary (little or no exercise)";
      case "light": return "Light (1-3 days/week)";
      case "moderate": return "Moderate (3-5 days/week)";
      case "active": return "Active (6-7 days/week)";
      case "veryActive": return "Very Active (hard exercise & physical job)";
      default: return level;
    }
  };

  // Helper function for goal label
  const getGoalLabel = (goal: string): string => {
    switch (goal) {
      case "weightLoss": return "Weight Loss";
      case "maintenance": return "Maintenance";
      case "muscleGain": return "Muscle Gain";
      default: return goal;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Nutrition Calculator</h2>
        
        <Tabs value={calculatorTab} onValueChange={(value) => setCalculatorTab(value as "tdee" | "macros")}>
          <TabsList className="mb-4">
            <TabsTrigger value="tdee">Calculate Your Needs</TabsTrigger>
            <TabsTrigger value="macros">Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="tdee">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Weight Input */}
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="weight"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Weight</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter weight" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="weightUnit"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="lbs">lbs</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Height Input */}
                  <div className="grid grid-cols-3 gap-2 items-end">
                    <div className="col-span-2">
                      <FormField
                        control={form.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Height</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter height" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="heightUnit"
                      render={({ field }) => (
                        <FormItem>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="cm">cm</SelectItem>
                              <SelectItem value="in">in</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Age and Gender */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter age" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Activity Level */}
                <FormField
                  control={form.control}
                  name="activityLevel"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Level</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sedentary">{getActivityLevelLabel("sedentary")}</SelectItem>
                          <SelectItem value="light">{getActivityLevelLabel("light")}</SelectItem>
                          <SelectItem value="moderate">{getActivityLevelLabel("moderate")}</SelectItem>
                          <SelectItem value="active">{getActivityLevelLabel("active")}</SelectItem>
                          <SelectItem value="veryActive">{getActivityLevelLabel("veryActive")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select based on your typical weekly exercise level
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Goal */}
                <FormField
                  control={form.control}
                  name="goal"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="weightLoss">{getGoalLabel("weightLoss")}</SelectItem>
                          <SelectItem value="maintenance">{getGoalLabel("maintenance")}</SelectItem>
                          <SelectItem value="muscleGain">{getGoalLabel("muscleGain")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        This will adjust your calorie and macro targets
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Calculate Nutrition Needs
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="macros">
            {calculatedNeeds ? (
              <div className="space-y-6">
                <p className="text-sm text-gray-600">
                  Based on your personal information and goals, here are your recommended daily nutritional needs:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Calories Card */}
                  <Card className="bg-blue-50 border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-blue-700">Daily Calories</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-blue-900">{calculatedNeeds.calories}</div>
                      <CardDescription className="text-blue-700">calories per day</CardDescription>
                    </CardContent>
                  </Card>
                  
                  {/* Protein Card */}
                  <Card className="bg-green-50 border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-green-700">Protein</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-900">{calculatedNeeds.protein}g</div>
                      <CardDescription className="text-green-700">{Math.round(calculatedNeeds.protein * 4)} calories</CardDescription>
                    </CardContent>
                  </Card>
                  
                  {/* Carbs Card */}
                  <Card className="bg-yellow-50 border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-yellow-700">Carbs</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-900">{calculatedNeeds.carbs}g</div>
                      <CardDescription className="text-yellow-700">{Math.round(calculatedNeeds.carbs * 4)} calories</CardDescription>
                    </CardContent>
                  </Card>
                  
                  {/* Fat Card */}
                  <Card className="bg-purple-50 border-0">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base text-purple-700">Fat</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-purple-900">{calculatedNeeds.fat}g</div>
                      <CardDescription className="text-purple-700">{Math.round(calculatedNeeds.fat * 9)} calories</CardDescription>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-medium text-gray-900 mb-2">Understanding Your Results</h3>
                  <p className="text-sm text-gray-600 mb-2">
                    These calculations are based on the Mifflin-St Jeor equation for BMR (Basal Metabolic Rate) 
                    and adjusted for your activity level and goals.
                  </p>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    <li>Protein: Important for muscle recovery and growth (4 calories per gram)</li>
                    <li>Carbs: Primary energy source for your body (4 calories per gram)</li>
                    <li>Fat: Essential for hormone regulation and nutrient absorption (9 calories per gram)</li>
                  </ul>
                </div>
                
                <Button
                  onClick={() => setCalculatorTab("tdee")}
                  variant="outline"
                  className="w-full"
                >
                  Recalculate
                </Button>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 mb-4">Please complete the calculator to see your nutrition needs.</p>
                <Button onClick={() => setCalculatorTab("tdee")}>Go to Calculator</Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}