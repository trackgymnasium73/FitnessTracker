import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertFoodSchema } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddFoodFormProps {
  mealType?: string;
  isContribution?: boolean;
  onSuccess?: () => void;
}

export default function AddFoodForm({ mealType = "breakfast", isContribution = false, onSuccess }: AddFoodFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // In a real app, this userId would come from auth context
  const userId = 1;
  
  // Form validation schema
  const formSchema = isContribution
    ? insertFoodSchema.extend({
        servingUnit: z.string().min(1, "Serving unit is required"),
      })
    : z.object({
        foodId: z.string().min(1, "Please select a food"),
        quantity: z.string().transform(val => parseFloat(val)),
      });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isContribution
      ? {
          name: "",
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          servingSize: 1,
          servingUnit: "g",
          addedByUserId: userId,
        }
      : {
          foodId: "",
          quantity: "1",
        },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      if (isContribution) {
        // Add food to database and earn points
        await apiRequest("POST", "/api/foods", values);
        toast({
          title: "Food added to database",
          description: "You've earned 10 points!",
          variant: "default",
        });
      } else {
        // Add food to daily log
        const foodLogData = {
          userId,
          foodId: parseInt(values.foodId as string),
          quantity: parseFloat(values.quantity as string),
          mealType,
        };
        
        await apiRequest("POST", "/api/food-logs", foodLogData);
        toast({
          title: "Food added to log",
          description: "Your daily nutrition has been updated",
          variant: "default",
        });
      }
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: [`/api/food-logs/${userId}`] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add food. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Sample foods for the dropdown
  const sampleFoods = [
    { id: 1, name: "Greek Yogurt" },
    { id: 2, name: "Whole Grain Toast" },
    { id: 3, name: "Banana" },
    { id: 4, name: "Grilled Chicken Breast" },
    { id: 5, name: "Brown Rice" },
    { id: 6, name: "Broccoli" },
  ];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isContribution ? (
          // Food contribution form
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Quinoa Salad" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="calories"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calories</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="1" {...field} onChange={e => field.onChange(parseInt(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="protein"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Protein (g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="carbs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Carbs (g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fat"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fat (g)</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="servingSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serving Size</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" step="0.1" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="servingUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Serving Unit</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="g">grams (g)</SelectItem>
                        <SelectItem value="ml">milliliters (ml)</SelectItem>
                        <SelectItem value="oz">ounces (oz)</SelectItem>
                        <SelectItem value="cup">cup</SelectItem>
                        <SelectItem value="tbsp">tablespoon</SelectItem>
                        <SelectItem value="tsp">teaspoon</SelectItem>
                        <SelectItem value="slice">slice</SelectItem>
                        <SelectItem value="piece">piece</SelectItem>
                        <SelectItem value="medium">medium</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        ) : (
          // Food tracking form
          <>
            <FormField
              control={form.control}
              name="foodId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Food</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select food" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {sampleFoods.map(food => (
                        <SelectItem key={food.id} value={food.id.toString()}>{food.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" min="0.1" step="0.1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormItem>
              <FormLabel>Meal</FormLabel>
              <div className="text-sm text-gray-900">{
                mealType === "breakfast" ? "Breakfast" :
                mealType === "lunch" ? "Lunch" :
                mealType === "dinner" ? "Dinner" : "Snacks"
              }</div>
            </FormItem>
          </>
        )}
        
        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : (
            `${isContribution ? "Add Food to Database" : "Add Food to Log"}`
          )}
        </Button>
      </form>
    </Form>
  );
}
