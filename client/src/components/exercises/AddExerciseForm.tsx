import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/queryClient";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertExerciseLogSchema } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AddExerciseFormProps {
  onSuccess?: () => void;
}

export default function AddExerciseForm({ onSuccess }: AddExerciseFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  
  // In a real app, this userId would come from auth context
  const userId = 1;
  
  // Form validation schema
  const formSchema = z.object({
    exerciseId: z.string().min(1, "Please select an exercise"),
    duration: z.string().transform(val => parseInt(val)),
  });
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      exerciseId: "",
      duration: "30",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      const exerciseLogData = {
        userId,
        exerciseId: parseInt(values.exerciseId),
        duration: values.duration,
      };
      
      await apiRequest("POST", "/api/exercise-logs", exerciseLogData);
      
      toast({
        title: "Exercise added",
        description: "Your exercise has been logged successfully",
        variant: "default",
      });
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: [`/api/exercise-logs/${userId}`] });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add exercise. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Sample exercises for the dropdown
  const sampleExercises = [
    { id: 1, name: "Running" },
    { id: 2, name: "Weight Training" },
    { id: 3, name: "Cycling" },
    { id: 4, name: "Swimming" },
    { id: 5, name: "Yoga" },
  ];
  
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="exerciseId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercise</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sampleExercises.map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id.toString()}>{exercise.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="duration"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duration (minutes)</FormLabel>
              <FormControl>
                <Input type="number" min="1" step="1" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600" disabled={isSubmitting}>
          {isSubmitting ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </div>
          ) : "Add Exercise"}
        </Button>
      </form>
    </Form>
  );
}
