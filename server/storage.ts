import {
  User, InsertUser, users,
  Food, InsertFood, foods,
  FoodLog, InsertFoodLog, foodLogs,
  Exercise, InsertExercise, exercises,
  ExerciseLog, InsertExerciseLog, exerciseLogs,
  Recipe, InsertRecipe, recipes,
  Product, InsertProduct, products,
  Cart, InsertCart, carts,
  WaterIntake, InsertWaterIntake, waterIntake
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  addUserPoints(id: number, points: number): Promise<User | undefined>;

  // Food methods
  getFood(id: number): Promise<Food | undefined>;
  getFoods(): Promise<Food[]>;
  createFood(food: InsertFood): Promise<Food>;
  searchFoods(query: string): Promise<Food[]>;

  // Food log methods
  createFoodLog(foodLog: InsertFoodLog): Promise<FoodLog>;
  getFoodLogsByUserAndDate(userId: number, date: Date): Promise<FoodLog[]>;
  deleteFoodLog(id: number): Promise<boolean>;

  // Exercise methods
  getExercise(id: number): Promise<Exercise | undefined>;
  getExercises(): Promise<Exercise[]>;
  createExercise(exercise: InsertExercise): Promise<Exercise>;
  searchExercises(query: string): Promise<Exercise[]>;

  // Exercise log methods
  createExerciseLog(exerciseLog: InsertExerciseLog): Promise<ExerciseLog>;
  getExerciseLogsByUserAndDate(userId: number, date: Date): Promise<ExerciseLog[]>;
  deleteExerciseLog(id: number): Promise<boolean>;

  // Recipe methods
  getRecipe(id: number): Promise<Recipe | undefined>;
  getRecipes(): Promise<Recipe[]>;
  getRecipesByGoal(goal: string): Promise<Recipe[]>;
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;

  // Product methods
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Cart methods
  getCartByUserId(userId: number): Promise<Cart[]>;
  addToCart(cart: InsertCart): Promise<Cart>;
  updateCartItem(id: number, quantity: number, usePoints: boolean): Promise<Cart | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Water intake methods
  createWaterIntake(waterIntake: InsertWaterIntake): Promise<WaterIntake>;
  getWaterIntakeByUserAndDate(userId: number, date: Date): Promise<WaterIntake[]>;
  getTotalWaterIntakeByUserAndDate(userId: number, date: Date): Promise<number>;
  deleteWaterIntake(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private foods: Map<number, Food>;
  private foodLogs: Map<number, FoodLog>;
  private exercises: Map<number, Exercise>;
  private exerciseLogs: Map<number, ExerciseLog>;
  private recipes: Map<number, Recipe>;
  private products: Map<number, Product>;
  private carts: Map<number, Cart>;
  private waterIntakes: Map<number, WaterIntake>;
  
  private userIdCounter: number;
  private foodIdCounter: number;
  private foodLogIdCounter: number;
  private exerciseIdCounter: number;
  private exerciseLogIdCounter: number;
  private recipeIdCounter: number;
  private productIdCounter: number;
  private cartIdCounter: number;
  private waterIntakeIdCounter: number;

  constructor() {
    this.users = new Map();
    this.foods = new Map();
    this.foodLogs = new Map();
    this.exercises = new Map();
    this.exerciseLogs = new Map();
    this.recipes = new Map();
    this.products = new Map();
    this.carts = new Map();
    this.waterIntakes = new Map();
    
    this.userIdCounter = 1;
    this.foodIdCounter = 1;
    this.foodLogIdCounter = 1;
    this.exerciseIdCounter = 1;
    this.exerciseLogIdCounter = 1;
    this.recipeIdCounter = 1;
    this.productIdCounter = 1;
    this.cartIdCounter = 1;
    this.waterIntakeIdCounter = 1;
    
    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Sample foods
    const sampleFoods: InsertFood[] = [
      { name: "Greek Yogurt", calories: 230, protein: 22, carbs: 9, fat: 8, servingSize: 200, servingUnit: "g", addedByUserId: null },
      { name: "Whole Grain Toast", calories: 90, protein: 3, carbs: 16, fat: 1, servingSize: 1, servingUnit: "slice", addedByUserId: null },
      { name: "Banana", calories: 105, protein: 1, carbs: 27, fat: 0, servingSize: 1, servingUnit: "medium", addedByUserId: null },
      { name: "Grilled Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, servingSize: 100, servingUnit: "g", addedByUserId: null },
      { name: "Brown Rice", calories: 216, protein: 5, carbs: 45, fat: 1.8, servingSize: 200, servingUnit: "g", addedByUserId: null },
      { name: "Broccoli", calories: 55, protein: 3.7, carbs: 11.2, fat: 0.6, servingSize: 100, servingUnit: "g", addedByUserId: null }
    ];
    
    sampleFoods.forEach(food => this.createFood(food));
    
    // Sample exercises
    const sampleExercises: InsertExercise[] = [
      { name: "Running", caloriesBurnedPerMinute: 10.5, type: "cardio" },
      { name: "Weight Training", caloriesBurnedPerMinute: 5.5, type: "strength" },
      { name: "Cycling", caloriesBurnedPerMinute: 8.5, type: "cardio" },
      { name: "Swimming", caloriesBurnedPerMinute: 9.8, type: "cardio" },
      { name: "Yoga", caloriesBurnedPerMinute: 3.0, type: "flexibility" }
    ];
    
    sampleExercises.forEach(exercise => this.createExercise(exercise));
    
    // Sample recipes
    const sampleRecipes: InsertRecipe[] = [
      {
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
    
    sampleRecipes.forEach(recipe => this.createRecipe(recipe));
    
    // Sample products
    const sampleProducts: InsertProduct[] = [
      {
        name: "Premium Whey Protein",
        description: "High-quality protein powder, 25g protein per serving",
        price: 39.99,
        discountPercentage: 10,
        pointsToRedeem: 100,
        pointsRedemptionDiscount: 5,
        imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
        category: "protein",
        isBestseller: false
      },
      {
        name: "BCAA Supplement",
        description: "Branched-chain amino acids for muscle recovery",
        price: 24.99,
        discountPercentage: 0,
        pointsToRedeem: 50,
        pointsRedemptionDiscount: 5,
        imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b",
        category: "supplements",
        isBestseller: false
      },
      {
        name: "Premium Shaker Bottle",
        description: "BPA-free shaker bottle with mixing ball",
        price: 14.99,
        discountPercentage: 0,
        pointsToRedeem: 30,
        pointsRedemptionDiscount: 5,
        imageUrl: "https://images.unsplash.com/photo-1579758629938-03607ccdbaba",
        category: "equipment",
        isBestseller: true
      },
      {
        name: "Resistance Bands Set",
        description: "Set of 5 resistance bands for home workouts",
        price: 19.99,
        discountPercentage: 0,
        pointsToRedeem: 40,
        pointsRedemptionDiscount: 5,
        imageUrl: "https://images.unsplash.com/photo-1516567727245-ad8c68f3ec93",
        category: "equipment",
        isBestseller: false
      }
    ];
    
    sampleProducts.forEach(product => this.createProduct(product));
  }

  // User Methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { ...user, id, points: 0 };
    this.users.set(id, newUser);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async addUserPoints(id: number, points: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, points: user.points + points };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Food Methods
  async getFood(id: number): Promise<Food | undefined> {
    return this.foods.get(id);
  }

  async getFoods(): Promise<Food[]> {
    return Array.from(this.foods.values());
  }

  async createFood(food: InsertFood): Promise<Food> {
    const id = this.foodIdCounter++;
    const newFood: Food = { ...food, id };
    this.foods.set(id, newFood);
    return newFood;
  }

  async searchFoods(query: string): Promise<Food[]> {
    query = query.toLowerCase();
    return Array.from(this.foods.values()).filter(
      (food) => food.name.toLowerCase().includes(query)
    );
  }

  // Food Log Methods
  async createFoodLog(foodLog: InsertFoodLog): Promise<FoodLog> {
    const id = this.foodLogIdCounter++;
    const newFoodLog: FoodLog = { ...foodLog, id, date: new Date() };
    this.foodLogs.set(id, newFoodLog);
    return newFoodLog;
  }

  async getFoodLogsByUserAndDate(userId: number, date: Date): Promise<FoodLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.foodLogs.values()).filter(
      (log) => log.userId === userId && log.date >= startOfDay && log.date <= endOfDay
    );
  }

  async deleteFoodLog(id: number): Promise<boolean> {
    return this.foodLogs.delete(id);
  }

  // Exercise Methods
  async getExercise(id: number): Promise<Exercise | undefined> {
    return this.exercises.get(id);
  }

  async getExercises(): Promise<Exercise[]> {
    return Array.from(this.exercises.values());
  }

  async createExercise(exercise: InsertExercise): Promise<Exercise> {
    const id = this.exerciseIdCounter++;
    const newExercise: Exercise = { ...exercise, id };
    this.exercises.set(id, newExercise);
    return newExercise;
  }

  async searchExercises(query: string): Promise<Exercise[]> {
    query = query.toLowerCase();
    return Array.from(this.exercises.values()).filter(
      (exercise) => exercise.name.toLowerCase().includes(query)
    );
  }

  // Exercise Log Methods
  async createExerciseLog(exerciseLog: InsertExerciseLog): Promise<ExerciseLog> {
    const id = this.exerciseLogIdCounter++;
    const newExerciseLog: ExerciseLog = { ...exerciseLog, id, date: new Date() };
    this.exerciseLogs.set(id, newExerciseLog);
    return newExerciseLog;
  }

  async getExerciseLogsByUserAndDate(userId: number, date: Date): Promise<ExerciseLog[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    return Array.from(this.exerciseLogs.values()).filter(
      (log) => log.userId === userId && log.date >= startOfDay && log.date <= endOfDay
    );
  }

  async deleteExerciseLog(id: number): Promise<boolean> {
    return this.exerciseLogs.delete(id);
  }

  // Recipe Methods
  async getRecipe(id: number): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getRecipes(): Promise<Recipe[]> {
    return Array.from(this.recipes.values());
  }

  async getRecipesByGoal(goal: string): Promise<Recipe[]> {
    return Array.from(this.recipes.values()).filter(
      (recipe) => recipe.fitnessGoal === goal
    );
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const id = this.recipeIdCounter++;
    const newRecipe: Recipe = { ...recipe, id };
    this.recipes.set(id, newRecipe);
    return newRecipe;
  }

  // Product Methods
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.category === category
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productIdCounter++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }

  // Cart Methods
  async getCartByUserId(userId: number): Promise<Cart[]> {
    return Array.from(this.carts.values()).filter(
      (cart) => cart.userId === userId
    );
  }

  async addToCart(cart: InsertCart): Promise<Cart> {
    // Check if the product is already in the cart
    const existingCart = Array.from(this.carts.values()).find(
      (c) => c.userId === cart.userId && c.productId === cart.productId
    );
    
    if (existingCart) {
      // Update quantity
      const updatedCart = { 
        ...existingCart, 
        quantity: existingCart.quantity + cart.quantity,
        usePoints: cart.usePoints 
      };
      this.carts.set(existingCart.id, updatedCart);
      return updatedCart;
    } else {
      // Add new item to cart
      const id = this.cartIdCounter++;
      const newCart: Cart = { ...cart, id };
      this.carts.set(id, newCart);
      return newCart;
    }
  }

  async updateCartItem(id: number, quantity: number, usePoints: boolean): Promise<Cart | undefined> {
    const cart = this.carts.get(id);
    if (!cart) return undefined;
    
    const updatedCart = { ...cart, quantity, usePoints };
    this.carts.set(id, updatedCart);
    return updatedCart;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.carts.delete(id);
  }

  async clearCart(userId: number): Promise<boolean> {
    const cartIds = Array.from(this.carts.values())
      .filter(cart => cart.userId === userId)
      .map(cart => cart.id);
    
    cartIds.forEach(id => this.carts.delete(id));
    return true;
  }

  // Water Intake Methods
  async createWaterIntake(waterIntakeData: InsertWaterIntake): Promise<WaterIntake> {
    const id = this.waterIntakeIdCounter++;
    const newWaterIntake: WaterIntake = { 
      ...waterIntakeData, 
      id, 
      time: new Date() 
    };
    this.waterIntakes.set(id, newWaterIntake);
    return newWaterIntake;
  }

  async getWaterIntakeByUserAndDate(userId: number, date: Date): Promise<WaterIntake[]> {
    const targetDate = new Date(date);
    const formattedDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());
    
    return Array.from(this.waterIntakes.values())
      .filter(intake => {
        const intakeDate = new Date(intake.date); 
        return intake.userId === userId && 
          intakeDate.getFullYear() === formattedDate.getFullYear() && 
          intakeDate.getMonth() === formattedDate.getMonth() && 
          intakeDate.getDate() === formattedDate.getDate();
      });
  }

  async getTotalWaterIntakeByUserAndDate(userId: number, date: Date): Promise<number> {
    const intakes = await this.getWaterIntakeByUserAndDate(userId, date);
    return intakes.reduce((total, intake) => total + intake.amount, 0);
  }

  async deleteWaterIntake(id: number): Promise<boolean> {
    return this.waterIntakes.delete(id);
  }
}

export const storage = new MemStorage();
