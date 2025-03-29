import { useQuery } from "@tanstack/react-query";
import { Recipe } from "@shared/schema";
import { Link } from "wouter";

type NutrientProgress = {
  consumed: number;
  goal: number;
  remaining: number;
};

type NutritionProgress = {
  calories: NutrientProgress;
  protein: NutrientProgress;
  carbs: NutrientProgress;
  fat: NutrientProgress;
};

interface RecommendedRecipesProps {
  nutritionProgress: NutritionProgress;
  fitnessGoal: string;
}

export default function RecommendedRecipes({ nutritionProgress, fitnessGoal }: RecommendedRecipesProps) {
  // Fetch recipes based on fitness goal
  const { data: recipes, isLoading } = useQuery<Recipe[]>({
    queryKey: ["/api/recipes", { goal: fitnessGoal }],
    enabled: false, // Disabled for demo, would be enabled in real app
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
    }
  ];

  const displayedRecipes = recipes || sampleRecipes;

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recommended Recipes</h2>
            <span className="text-xs bg-amber-100 text-amber-800 py-1 px-2 rounded-full">
              Based on your remaining needs
            </span>
          </div>
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              displayedRecipes.map(recipe => (
                <div key={recipe.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col sm:flex-row">
                  <div className="w-full sm:w-1/3">
                    <img src={recipe.imageUrl} alt={recipe.name} className="h-48 sm:h-full w-full object-cover" />
                  </div>
                  <div className="w-full sm:w-2/3 p-4">
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
                    <Link href={`/recipes/${recipe.id}`}>
                      <a className="mt-3 text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                        View Recipe
                        <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    </Link>
                  </div>
                </div>
              ))
            )}

            <div className="text-center pt-2">
              <Link href="/recipes">
                <a className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View all recommendations
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
