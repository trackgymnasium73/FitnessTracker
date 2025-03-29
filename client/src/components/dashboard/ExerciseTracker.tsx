import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Exercise, ExerciseLog } from "@shared/schema";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AddExerciseForm from "@/components/exercises/AddExerciseForm";

interface ExerciseLogWithDetails extends ExerciseLog {
  exercise?: Exercise;
  caloriesBurned?: number;
}

export default function ExerciseTracker() {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // In a real app, this userId would come from auth context
  const userId = 1;
  
  // Fetch exercise logs for today
  const { data: exerciseLogs, isLoading } = useQuery<ExerciseLogWithDetails[]>({
    queryKey: [`/api/exercise-logs/${userId}`, { date: new Date().toISOString().split('T')[0] }],
    enabled: false, // Disabled for demo, would be enabled in a real app
  });
  
  // Sample data for demo
  const sampleExerciseLogs: ExerciseLogWithDetails[] = [
    {
      id: 1,
      userId: 1,
      exerciseId: 1,
      duration: 30,
      date: new Date(),
      exercise: {
        id: 1,
        name: "Running",
        caloriesBurnedPerMinute: 10.5,
        type: "cardio"
      },
      caloriesBurned: 320
    },
    {
      id: 2,
      userId: 1,
      exerciseId: 2,
      duration: 45,
      date: new Date(),
      exercise: {
        id: 2,
        name: "Weight Training",
        caloriesBurnedPerMinute: 5.5,
        type: "strength"
      },
      caloriesBurned: 250
    }
  ];
  
  const displayedExerciseLogs = exerciseLogs || sampleExerciseLogs;
  
  // Calculate total calories burned
  const totalCaloriesBurned = displayedExerciseLogs.reduce((total, log) => total + (log.caloriesBurned || 0), 0);
  
  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Exercise Tracker</h2>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-500 hover:bg-blue-600">
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Exercise</DialogTitle>
                </DialogHeader>
                <AddExerciseForm onSuccess={() => setDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <>
                {displayedExerciseLogs.map(log => (
                  <div key={log.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="flex items-center">
                        <svg className="h-6 w-6 text-blue-500 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d={
                              log.exercise?.type === "cardio" 
                                ? "M13 10V3L4 14h7v7l9-11h-7z" 
                                : "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            }
                          />
                        </svg>
                        <h3 className="font-medium text-gray-900">{log.exercise?.name}</h3>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{log.duration} minutes, {
                        log.exercise?.type === "cardio" ? "cardio" :
                        log.exercise?.type === "strength" ? "strength training" :
                        log.exercise?.type
                      }</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-mono font-medium text-blue-600">{log.caloriesBurned}</div>
                      <div className="text-xs text-gray-500">calories burned</div>
                    </div>
                  </div>
                ))}

                <div className="rounded-lg bg-gray-50 p-4 border border-dashed border-gray-300 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-700">Today's Total</div>
                    <div className="text-sm text-gray-500 mt-1">{displayedExerciseLogs.length} activities completed</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-mono font-medium text-blue-600">{totalCaloriesBurned}</div>
                    <div className="text-xs text-gray-500">calories burned</div>
                  </div>
                </div>

                <div className="text-center pt-2">
                  <a href="/exercises" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    View exercise history
                  </a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
