import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateRecipe } from "./openai";
import { insertFoodSchema, insertExerciseSchema, insertExerciseLogSchema, insertFoodLogSchema, insertRecipeSchema, insertCartSchema, insertWaterIntakeSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // User routes
  app.get("/api/user/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Don't send password in response
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });
  
  app.post("/api/user/login", async (req, res) => {
    const loginSchema = z.object({
      username: z.string().min(1),
      password: z.string().min(1)
    });
    
    try {
      const { username, password } = loginSchema.parse(req.body);
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/user/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByUsername(userData.username);
      
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/user/:id", async (req, res) => {
    const userId = parseInt(req.params.id);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      
      // Don't send password in response
      const { password, ...userWithoutPassword } = updatedUser!;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Food routes
  app.get("/api/foods", async (_req, res) => {
    const foods = await storage.getFoods();
    res.json(foods);
  });
  
  app.get("/api/foods/search", async (req, res) => {
    const query = req.query.q as string || "";
    const foods = await storage.searchFoods(query);
    res.json(foods);
  });
  
  app.post("/api/foods", async (req, res) => {
    try {
      const foodData = insertFoodSchema.parse(req.body);
      const food = await storage.createFood(foodData);
      
      // Add points to user if they contributed a new food
      if (foodData.addedByUserId) {
        await storage.addUserPoints(foodData.addedByUserId, 10);
      }
      
      res.status(201).json(food);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Food log routes
  app.post("/api/food-logs", async (req, res) => {
    try {
      const foodLogData = insertFoodLogSchema.parse(req.body);
      const foodLog = await storage.createFoodLog(foodLogData);
      res.status(201).json(foodLog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/food-logs/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    
    try {
      const foodLogs = await storage.getFoodLogsByUserAndDate(userId, date);
      
      // Fetch detailed food information for each log
      const foodLogsWithDetails = await Promise.all(
        foodLogs.map(async (log) => {
          const food = await storage.getFood(log.foodId);
          return {
            ...log,
            food
          };
        })
      );
      
      res.json(foodLogsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/food-logs/:id", async (req, res) => {
    const logId = parseInt(req.params.id);
    if (isNaN(logId)) {
      return res.status(400).json({ message: "Invalid log ID" });
    }
    
    try {
      const success = await storage.deleteFoodLog(logId);
      if (!success) {
        return res.status(404).json({ message: "Food log not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Exercise routes
  app.get("/api/exercises", async (_req, res) => {
    const exercises = await storage.getExercises();
    res.json(exercises);
  });
  
  app.get("/api/exercises/search", async (req, res) => {
    const query = req.query.q as string || "";
    const exercises = await storage.searchExercises(query);
    res.json(exercises);
  });
  
  app.post("/api/exercises", async (req, res) => {
    try {
      const exerciseData = insertExerciseSchema.parse(req.body);
      const exercise = await storage.createExercise(exerciseData);
      res.status(201).json(exercise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Exercise log routes
  app.post("/api/exercise-logs", async (req, res) => {
    try {
      const exerciseLogData = insertExerciseLogSchema.parse(req.body);
      const exerciseLog = await storage.createExerciseLog(exerciseLogData);
      res.status(201).json(exerciseLog);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/exercise-logs/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    
    try {
      const exerciseLogs = await storage.getExerciseLogsByUserAndDate(userId, date);
      
      // Fetch detailed exercise information for each log
      const exerciseLogsWithDetails = await Promise.all(
        exerciseLogs.map(async (log) => {
          const exercise = await storage.getExercise(log.exerciseId);
          return {
            ...log,
            exercise,
            caloriesBurned: exercise ? Math.round(exercise.caloriesBurnedPerMinute * log.duration) : 0
          };
        })
      );
      
      res.json(exerciseLogsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/exercise-logs/:id", async (req, res) => {
    const logId = parseInt(req.params.id);
    if (isNaN(logId)) {
      return res.status(400).json({ message: "Invalid log ID" });
    }
    
    try {
      const success = await storage.deleteExerciseLog(logId);
      if (!success) {
        return res.status(404).json({ message: "Exercise log not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Recipe routes
  app.get("/api/recipes", async (req, res) => {
    try {
      const goal = req.query.goal as string;
      let recipes;
      
      if (goal) {
        recipes = await storage.getRecipesByGoal(goal);
      } else {
        recipes = await storage.getRecipes();
      }
      
      res.json(recipes);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/recipes/:id", async (req, res) => {
    const recipeId = parseInt(req.params.id);
    if (isNaN(recipeId)) {
      return res.status(400).json({ message: "Invalid recipe ID" });
    }
    
    try {
      const recipe = await storage.getRecipe(recipeId);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      
      res.json(recipe);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/recipes", async (req, res) => {
    try {
      const recipeData = insertRecipeSchema.parse(req.body);
      const recipe = await storage.createRecipe(recipeData);
      res.status(201).json(recipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/recipes/generate", async (req, res) => {
    const schema = z.object({
      fitnessGoal: z.string(),
      remainingNutrition: z.object({
        calories: z.number(),
        protein: z.number(),
        carbs: z.number(),
        fat: z.number()
      })
    });
    
    try {
      const params = schema.parse(req.body);
      const recipe = await generateRecipe(params);
      
      // Store the generated recipe
      const savedRecipe = await storage.createRecipe(recipe);
      
      res.json(savedRecipe);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      console.error("Recipe generation error:", error);
      res.status(500).json({ message: "Failed to generate recipe" });
    }
  });
  
  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const category = req.query.category as string;
      let products;
      
      if (category) {
        products = await storage.getProductsByCategory(category);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.get("/api/products/:id", async (req, res) => {
    const productId = parseInt(req.params.id);
    if (isNaN(productId)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }
    
    try {
      const product = await storage.getProduct(productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  // Cart routes
  app.get("/api/cart/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const cartItems = await storage.getCartByUserId(userId);
      
      // Fetch product details for each cart item
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            ...item,
            product
          };
        })
      );
      
      res.json(cartWithProducts);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.post("/api/cart", async (req, res) => {
    try {
      const cartData = insertCartSchema.parse(req.body);
      const cart = await storage.addToCart(cartData);
      
      // Get product info
      const product = await storage.getProduct(cart.productId);
      
      res.status(201).json({
        ...cart,
        product
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.put("/api/cart/:id", async (req, res) => {
    const cartId = parseInt(req.params.id);
    if (isNaN(cartId)) {
      return res.status(400).json({ message: "Invalid cart ID" });
    }
    
    const schema = z.object({
      quantity: z.number().int().positive(),
      usePoints: z.boolean().optional()
    });
    
    try {
      const { quantity, usePoints = false } = schema.parse(req.body);
      const updatedCart = await storage.updateCartItem(cartId, quantity, usePoints);
      
      if (!updatedCart) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      const product = await storage.getProduct(updatedCart.productId);
      
      res.json({
        ...updatedCart,
        product
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/cart/:id", async (req, res) => {
    const cartId = parseInt(req.params.id);
    if (isNaN(cartId)) {
      return res.status(400).json({ message: "Invalid cart ID" });
    }
    
    try {
      const success = await storage.removeFromCart(cartId);
      if (!success) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });
  
  app.delete("/api/cart/user/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      await storage.clearCart(userId);
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  // Water Intake routes
  app.post("/api/water-intake", async (req, res) => {
    try {
      const waterIntakeData = insertWaterIntakeSchema.parse(req.body);
      const waterIntake = await storage.createWaterIntake(waterIntakeData);
      res.status(201).json(waterIntake);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).message });
      }
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/water-intake/:userId", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    
    try {
      const waterIntakeEntries = await storage.getWaterIntakeByUserAndDate(userId, date);
      res.json(waterIntakeEntries);
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.get("/api/water-intake/:userId/total", async (req, res) => {
    const userId = parseInt(req.params.userId);
    if (isNaN(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    
    try {
      const totalWaterIntake = await storage.getTotalWaterIntakeByUserAndDate(userId, date);
      res.json({ total: totalWaterIntake });
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  app.delete("/api/water-intake/:id", async (req, res) => {
    const waterIntakeId = parseInt(req.params.id);
    if (isNaN(waterIntakeId)) {
      return res.status(400).json({ message: "Invalid water intake ID" });
    }
    
    try {
      const success = await storage.deleteWaterIntake(waterIntakeId);
      if (!success) {
        return res.status(404).json({ message: "Water intake entry not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
