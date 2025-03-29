import { pgTable, text, serial, integer, boolean, timestamp, real, json, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name"),
  email: text("email").notNull().unique(),
  points: integer("points").default(0).notNull(),
  fitnessGoal: text("fitness_goal").default("maintenance"), // "fatloss", "musclegain", "maintenance"
  dailyCalorieGoal: integer("daily_calorie_goal").default(2000),
  dailyProteinGoal: integer("daily_protein_goal").default(140),
  dailyCarbsGoal: integer("daily_carbs_goal").default(220),
  dailyFatGoal: integer("daily_fat_goal").default(70),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  points: true,
});

// Food schema
export const foods = pgTable("foods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  servingSize: real("serving_size").notNull(),
  servingUnit: text("serving_unit").notNull(),
  addedByUserId: integer("added_by_user_id").references(() => users.id),
});

export const insertFoodSchema = createInsertSchema(foods).omit({
  id: true,
});

// Food log schema
export const foodLogs = pgTable("food_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  foodId: integer("food_id").notNull().references(() => foods.id),
  quantity: real("quantity").notNull(),
  mealType: text("meal_type").notNull(), // "breakfast", "lunch", "dinner", "snack"
  date: timestamp("date").notNull().defaultNow(),
});

export const insertFoodLogSchema = createInsertSchema(foodLogs).omit({
  id: true,
  date: true,
});

// Exercise schema
export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  caloriesBurnedPerMinute: real("calories_burned_per_minute").notNull(),
  type: text("type").notNull(), // "cardio", "strength", "flexibility", etc.
});

export const insertExerciseSchema = createInsertSchema(exercises).omit({
  id: true,
});

// Exercise log schema
export const exerciseLogs = pgTable("exercise_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
  duration: integer("duration").notNull(), // in minutes
  date: timestamp("date").notNull().defaultNow(),
});

export const insertExerciseLogSchema = createInsertSchema(exerciseLogs).omit({
  id: true,
  date: true,
});

// Recipe schema
export const recipes = pgTable("recipes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  ingredients: text("ingredients").array().notNull(),
  instructions: text("instructions").notNull(),
  calories: integer("calories").notNull(),
  protein: real("protein").notNull(),
  carbs: real("carbs").notNull(),
  fat: real("fat").notNull(),
  fitnessGoal: text("fitness_goal").notNull(), // "fatloss", "musclegain", "maintenance", "highprotein"
  imageUrl: text("image_url"),
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
});

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: real("price").notNull(),
  discountPercentage: integer("discount_percentage").default(0),
  pointsToRedeem: integer("points_to_redeem").default(0),
  pointsRedemptionDiscount: integer("points_redemption_discount").default(0),
  imageUrl: text("image_url"),
  category: text("category").notNull(), // "protein", "supplements", "equipment", "clothing"
  isBestseller: boolean("is_bestseller").default(false),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

// Cart schema
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  usePoints: boolean("use_points").default(false),
});

export const insertCartSchema = createInsertSchema(carts).omit({
  id: true,
});

// Water intake schema
export const waterIntake = pgTable("water_intake", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(), // in milliliters
  date: date("date").notNull(),
  time: timestamp("time").notNull().defaultNow(),
});

export const insertWaterIntakeSchema = createInsertSchema(waterIntake).omit({
  id: true,
  time: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Food = typeof foods.$inferSelect;
export type InsertFood = z.infer<typeof insertFoodSchema>;

export type FoodLog = typeof foodLogs.$inferSelect;
export type InsertFoodLog = z.infer<typeof insertFoodLogSchema>;

export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = z.infer<typeof insertExerciseSchema>;

export type ExerciseLog = typeof exerciseLogs.$inferSelect;
export type InsertExerciseLog = z.infer<typeof insertExerciseLogSchema>;

export type Recipe = typeof recipes.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Cart = typeof carts.$inferSelect;
export type InsertCart = z.infer<typeof insertCartSchema>;

export type WaterIntake = typeof waterIntake.$inferSelect;
export type InsertWaterIntake = z.infer<typeof insertWaterIntakeSchema>;
