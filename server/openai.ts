import OpenAI from "openai";
import { Recipe } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || "default_key" });

export interface RecipeGenerationParams {
  fitnessGoal: string;
  remainingNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

export async function generateRecipe(params: RecipeGenerationParams): Promise<Recipe> {
  const { fitnessGoal, remainingNutrition } = params;
  
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a professional nutritionist specializing in fitness nutrition. 
          Create a recipe that is suitable for someone with a ${fitnessGoal} goal and fits within these nutritional parameters:
          Calories: approximately ${remainingNutrition.calories} calories
          Protein: approximately ${remainingNutrition.protein}g
          Carbs: approximately ${remainingNutrition.carbs}g
          Fat: approximately ${remainingNutrition.fat}g
          
          Provide a response in JSON format with the following fields:
          - name: the name of the recipe
          - description: a brief description of the recipe
          - ingredients: an array of strings listing all ingredients with quantities
          - instructions: step-by-step instructions for preparing the recipe
          - calories: the approximate calories in the recipe
          - protein: the protein content in grams
          - carbs: the carbohydrate content in grams
          - fat: the fat content in grams`,
        },
        {
          role: "user",
          content: `Please generate a recipe for my ${fitnessGoal} goal that helps me meet my remaining nutritional needs: ${JSON.stringify(remainingNutrition)}`,
        },
      ],
      response_format: { type: "json_object" },
    });

    const recipeData = JSON.parse(response.choices[0].message.content) as Omit<Recipe, "id" | "fitnessGoal" | "imageUrl">;
    
    // Create a URL appropriate for the recipe type
    let imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c"; // Default image
    
    if (fitnessGoal === "musclegain") {
      imageUrl = "https://images.unsplash.com/photo-1482049016688-2d3e1b311543";
    } else if (fitnessGoal === "fatloss") {
      imageUrl = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c";
    }

    return {
      id: 0, // This will be set by the storage layer
      ...recipeData,
      fitnessGoal,
      imageUrl
    };
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe");
  }
}
