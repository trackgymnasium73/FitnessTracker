import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Recipe } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Recipes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGoal, setSelectedGoal] = useState("all");
  const [recipeGenerationOpen, setRecipeGenerationOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [recipeDetailsOpen, setRecipeDetailsOpen] = useState(false);
  const { toast } = useToast();

  // Fetch recipes based on goal
  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes", { goal: selectedGoal !== "all" ? selectedGoal : undefined }],
    enabled: false, // Disabled for demo, would be enabled in a real app
  });

  // User's fitness goal and remaining nutrients - would come from user profile in real app
  const userFitnessGoal = "musclegain";
  const remainingNutrition = {
    calories: 750,
    protein: 55,
    carbs: 100,
    fat: 25
  };

  // Generate recipe mutation
  const generateRecipeMutation = useMutation({
    mutationFn: (params: { fitnessGoal: string, remainingNutrition: typeof remainingNutrition }) => 
      apiRequest("POST", "/api/recipes/generate", params),
    onSuccess: async (data) => {
      const recipe = await data.json();
      setSelectedRecipe(recipe);
      setRecipeDetailsOpen(true);
      setRecipeGenerationOpen(false);
      toast({
        title: "Recipe generated",
        description: "A new recipe has been created based on your needs",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate recipe. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Sample data for demo
  const sampleRecipes: Recipe[] = [
    {
      id: 1,
      name: "High Protein Salad Bowl",
      description: "A nutrient-packed salad with grilled chicken, quinoa, and mixed vegetables.",
      ingredients: ["100g grilled chicken breast", "50g quinoa", "100g mixed vegetables", "1 tbsp olive oil", "Salt and pepper to taste"],
      instructions: "1. Cook quinoa as per instructions. 2. Grill chicken and slice. 3. Mix all ingredients in a bowl and drizzle with olive oil.",
      calories: 320,
      protein: 28,
      carbs: 32,
      fat: 12,
      fitnessGoal: "highprotein",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
    },
    {
      id: 2,
      name: "Berry Protein Smoothie",
      description: "Creamy protein smoothie with mixed berries, banana, Greek yogurt and whey protein.",
      ingredients: ["100g mixed berries", "1 banana", "100g Greek yogurt", "1 scoop whey protein", "200ml almond milk"],
      instructions: "Blend all ingredients until smooth.",
      calories: 280,
      protein: 25,
      carbs: 30,
      fat: 6,
      fitnessGoal: "musclegain",
      imageUrl: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543"
    },
    {
      id: 3,
      name: "Lean Turkey Wrap",
      description: "Low-calorie wrap with lean turkey breast, fresh vegetables, and light dressing.",
      ingredients: ["100g turkey breast", "1 whole wheat wrap", "Lettuce, tomato, cucumber", "1 tbsp light mayo", "Mustard to taste"],
      instructions: "1. Layer all ingredients on the wrap. 2. Roll tightly and cut in half.",
      calories: 240,
      protein: 30,
      carbs: 20,
      fat: 6,
      fitnessGoal: "fatloss",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
    },
    {
      id: 4,
      name: "Avocado Chicken Power Bowl",
      description: "Nutrient-dense bowl with grilled chicken, avocado, quinoa, and roasted vegetables.",
      ingredients: ["120g grilled chicken", "1/2 avocado", "50g quinoa", "100g roasted vegetables", "1 tbsp olive oil"],
      instructions: "1. Cook quinoa. 2. Grill chicken. 3. Roast vegetables. 4. Combine all ingredients in a bowl.",
      calories: 450,
      protein: 35,
      carbs: 25,
      fat: 22,
      fitnessGoal: "maintenance",
      imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"
    }
  ];

  const displayedRecipes = recipes || sampleRecipes;

  // Filter recipes based on search query and goal
  const filteredRecipes = displayedRecipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        recipe.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGoal = selectedGoal === "all" || recipe.fitnessGoal === selectedGoal;
    return matchesSearch && matchesGoal;
  });

  // Handle recipe generation
  const handleGenerateRecipe = () => {
    generateRecipeMutation.mutate({
      fitnessGoal: userFitnessGoal,
      remainingNutrition
    });
  };

  // View recipe details
  const handleViewRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setRecipeDetailsOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipe Suggestions</h1>
          <p className="text-sm text-gray-500">Find and generate recipes based on your fitness goals</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Dialog open={recipeGenerationOpen} onOpenChange={setRecipeGenerationOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Custom Recipe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Recipe Based on Your Needs</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="text-sm">
                  <p>Generate a personalized recipe based on your remaining nutritional needs:</p>
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="bg-blue-50 p-2 rounded-md">
                      <span className="text-blue-700 font-medium">Calories:</span>
                      <span className="text-blue-900 font-mono ml-2">{remainingNutrition.calories}</span>
                    </div>
                    <div className="bg-green-50 p-2 rounded-md">
                      <span className="text-green-700 font-medium">Protein:</span>
                      <span className="text-green-900 font-mono ml-2">{remainingNutrition.protein}g</span>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded-md">
                      <span className="text-yellow-700 font-medium">Carbs:</span>
                      <span className="text-yellow-900 font-mono ml-2">{remainingNutrition.carbs}g</span>
                    </div>
                    <div className="bg-purple-50 p-2 rounded-md">
                      <span className="text-purple-700 font-medium">Fat:</span>
                      <span className="text-purple-900 font-mono ml-2">{remainingNutrition.fat}g</span>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  This will use AI to generate a recipe that fits your remaining nutritional needs for the day.
                </p>
                <Button 
                  onClick={handleGenerateRecipe} 
                  className="w-full bg-blue-500 hover:bg-blue-600"
                  disabled={generateRecipeMutation.isPending}
                >
                  {generateRecipeMutation.isPending ? (
                    <div className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </div>
                  ) : "Generate Recipe Now"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between mb-6">
            <div className="md:w-1/2 mb-4 md:mb-0 md:mr-4">
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border-gray-300"
              />
            </div>
            <div className="md:w-1/3">
              <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by goal" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Goals</SelectItem>
                  <SelectItem value="fatloss">Fat Loss</SelectItem>
                  <SelectItem value="musclegain">Muscle Gain</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="highprotein">High Protein</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No recipes found. Try a different search or filter.</p>
              </div>
            ) : (
              filteredRecipes.map(recipe => (
                <div key={recipe.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col md:flex-row">
                  <div className="w-full md:w-1/3 h-48 md:h-auto">
                    <img src={recipe.imageUrl} alt={recipe.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="w-full md:w-2/3 p-4">
                    <div className="flex justify-between">
                      <h3 className="font-medium text-gray-900">{recipe.name}</h3>
                      <span className="text-xs bg-green-100 text-green-800 py-1 px-2 rounded-full">{
                        recipe.fitnessGoal === "fatloss" ? "Fat Loss" :
                        recipe.fitnessGoal === "musclegain" ? "Muscle Gain" :
                        recipe.fitnessGoal === "highprotein" ? "High Protein" : "Balanced"
                      }</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{recipe.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="text-xs bg-blue-50 text-blue-700 py-0.5 px-2 rounded-full">{recipe.calories} cal</span>
                      <span className="text-xs bg-green-50 text-green-700 py-0.5 px-2 rounded-full">{recipe.protein}g protein</span>
                      <span className="text-xs bg-yellow-50 text-yellow-700 py-0.5 px-2 rounded-full">{recipe.carbs}g carbs</span>
                      <span className="text-xs bg-purple-50 text-purple-700 py-0.5 px-2 rounded-full">{recipe.fat}g fat</span>
                    </div>
                    <button 
                      className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      onClick={() => handleViewRecipe(recipe)}
                    >
                      View Recipe
                      <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <Card className="shadow-md mb-8">
        <CardHeader>
          <CardTitle>Nutrition-Based Recipe Suggestions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Not finding what you're looking for? Let our AI generate custom recipes based on your remaining nutritional needs.
          </p>
          <Button 
            onClick={() => setRecipeGenerationOpen(true)} 
            className="w-full md:w-auto bg-blue-500 hover:bg-blue-600"
          >
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Get Custom Recipe Suggestions
          </Button>
        </CardContent>
      </Card>

      {/* Recipe Details Dialog */}
      <Dialog open={recipeDetailsOpen} onOpenChange={setRecipeDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedRecipe?.name}</DialogTitle>
          </DialogHeader>
          {selectedRecipe && (
            <div className="mt-2">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 mb-4 md:mb-0 md:mr-4">
                  <img 
                    src={selectedRecipe.imageUrl} 
                    alt={selectedRecipe.name} 
                    className="w-full h-48 object-cover rounded-md"
                  />
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="text-center">
                      <div className="text-sm font-bold text-blue-600">{selectedRecipe.calories}</div>
                      <div className="text-xs text-gray-500">calories</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-green-600">{selectedRecipe.protein}g</div>
                      <div className="text-xs text-gray-500">protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-yellow-600">{selectedRecipe.carbs}g</div>
                      <div className="text-xs text-gray-500">carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-bold text-purple-600">{selectedRecipe.fat}g</div>
                      <div className="text-xs text-gray-500">fat</div>
                    </div>
                  </div>
                </div>
                <div className="md:w-2/3">
                  <Tabs defaultValue="ingredients">
                    <TabsList>
                      <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                      <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ingredients" className="mt-4">
                      <ul className="list-disc pl-5 space-y-1">
                        {selectedRecipe.ingredients.map((ingredient, index) => (
                          <li key={index} className="text-sm text-gray-700">{ingredient}</li>
                        ))}
                      </ul>
                    </TabsContent>
                    <TabsContent value="instructions" className="mt-4">
                      <div className="text-sm text-gray-700 whitespace-pre-line">
                        {selectedRecipe.instructions}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
