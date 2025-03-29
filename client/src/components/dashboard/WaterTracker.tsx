import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Droplet, Plus, Minus, Trash2 } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { useQuery, useMutation } from "@tanstack/react-query";

interface WaterIntake {
  id: number;
  userId: number;
  amount: number;
  date: string;
  time: string;
}

interface WaterTrackerProps {
  userId: number;
  date?: Date;
  targetIntake?: number; // Target daily water intake in ml
}

export default function WaterTracker({ userId, date = new Date(), targetIntake = 2000 }: WaterTrackerProps) {
  const { toast } = useToast();
  const [waterAmount, setWaterAmount] = useState(250); // Default amount in ml
  const formattedDate = format(date, "yyyy-MM-dd");

  // Query to get water intake entries for the user on the specified date
  const { data: waterIntakeEntries = [], refetch } = useQuery({
    queryKey: ["/api/water-intake", userId, formattedDate],
    queryFn: async () => {
      const response = await fetch(`/api/water-intake/${userId}?date=${formattedDate}`);
      if (!response.ok) {
        throw new Error("Failed to fetch water intake entries");
      }
      return await response.json() as WaterIntake[];
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false
  });
  
  // Query to get total water intake for the user on the specified date
  const { data: totalWaterData } = useQuery({
    queryKey: ["/api/water-intake/total", userId, formattedDate],
    queryFn: async () => {
      const response = await fetch(`/api/water-intake/${userId}/total?date=${formattedDate}`);
      if (!response.ok) {
        throw new Error("Failed to fetch total water intake");
      }
      return await response.json() as { total: number };
    },
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false
  });
  
  const totalWaterIntake = totalWaterData?.total || 0;
  const progress = Math.min(Math.round((totalWaterIntake / targetIntake) * 100), 100);
  const remaining = Math.max(targetIntake - totalWaterIntake, 0);
  
  // Add water intake mutation
  const addWaterMutation = useMutation({
    mutationFn: async (amount: number) => {
      const response = await fetch("/api/water-intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          amount,
          date: formattedDate,
          time: new Date().toISOString()
        })
      });
      
      if (!response.ok) {
        throw new Error("Failed to add water intake");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-intake", userId, formattedDate] });
      queryClient.invalidateQueries({ queryKey: ["/api/water-intake/total", userId, formattedDate] });
      toast({
        title: "Water intake added",
        description: `Added ${waterAmount}ml of water to your daily intake.`,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add water intake. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Delete water intake mutation
  const deleteWaterMutation = useMutation({
    mutationFn: async (intakeId: number) => {
      const response = await fetch(`/api/water-intake/${intakeId}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete water intake");
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/water-intake", userId, formattedDate] });
      queryClient.invalidateQueries({ queryKey: ["/api/water-intake/total", userId, formattedDate] });
      toast({
        title: "Water intake deleted",
        description: "Water intake entry has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete water intake. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const handleAddWater = () => {
    addWaterMutation.mutate(waterAmount);
  };
  
  const handleDeleteEntry = (intakeId: number) => {
    deleteWaterMutation.mutate(intakeId);
  };
  
  const increaseAmount = () => {
    setWaterAmount(prev => prev + 50);
  };
  
  const decreaseAmount = () => {
    setWaterAmount(prev => Math.max(prev - 50, 50));
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Droplet className="h-5 w-5 text-blue-500" />
          Water Intake
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Daily Progress</span>
            <span>{totalWaterIntake}ml / {targetIntake}ml</span>
          </div>
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {remaining > 0 
              ? `${remaining}ml remaining to reach your daily goal` 
              : "You've reached your daily water intake goal!"}
          </p>
        </div>
        
        <div className="flex items-center justify-between space-x-2">
          <Button variant="outline" size="icon" onClick={decreaseAmount}>
            <Minus className="h-4 w-4" />
          </Button>
          <div className="flex-1 text-center">
            <span className="text-xl font-semibold">{waterAmount}ml</span>
          </div>
          <Button variant="outline" size="icon" onClick={increaseAmount}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleAddWater} 
          disabled={addWaterMutation.isPending}
        >
          Add Water
        </Button>
        
        {waterIntakeEntries.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">Today's Entries</h4>
            <div className="max-h-40 overflow-auto space-y-2">
              {waterIntakeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between bg-muted p-2 rounded-md">
                  <div>
                    <span className="text-sm font-medium">{entry.amount}ml</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {new Date(entry.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteEntry(entry.id)}
                    disabled={deleteWaterMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center text-xs text-muted-foreground">
        Recommended daily intake: 2000-3000ml
      </CardFooter>
    </Card>
  );
}