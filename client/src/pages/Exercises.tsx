import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Exercise, ExerciseLog } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AddExerciseForm from "@/components/exercises/AddExerciseForm";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface ExerciseLogWithDetails extends ExerciseLog {
  exercise?: Exercise;
  caloriesBurned?: number;
}

export default function Exercises() {
  const [date, setDate] = useState(new Date());
  const [exerciseType, setExerciseType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // In a real app, this userId would come from auth context
  const userId = 1;

  // Fetch exercise logs for today
  const { data: exerciseLogs, isLoading } = useQuery<ExerciseLogWithDetails[]>({
    queryKey: [`/api/exercise-logs/${userId}`, { date: date.toISOString().split('T')[0] }],
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
    },
    {
      id: 3,
      userId: 1,
      exerciseId: 3,
      duration: 25,
      date: new Date(),
      exercise: {
        id: 3,
        name: "Cycling",
        caloriesBurnedPerMinute: 8.5,
        type: "cardio"
      },
      caloriesBurned: 213
    },
    {
      id: 4,
      userId: 1,
      exerciseId: 5,
      duration: 40,
      date: new Date(),
      exercise: {
        id: 5,
        name: "Yoga",
        caloriesBurnedPerMinute: 3.0,
        type: "flexibility"
      },
      caloriesBurned: 120
    }
  ];

  const displayedExerciseLogs = exerciseLogs || sampleExerciseLogs;

  // Filter logs based on type and search query
  const filteredLogs = displayedExerciseLogs.filter(log => {
    const matchesType = exerciseType === "all" || (log.exercise && log.exercise.type === exerciseType);
    const matchesSearch = !searchQuery || (log.exercise && log.exercise.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  // Calculate total calories burned
  const totalCaloriesBurned = filteredLogs.reduce((total, log) => total + (log.caloriesBurned || 0), 0);

  // Handle exercise log deletion
  const handleDeleteExerciseLog = async (logId: number) => {
    try {
      await apiRequest("DELETE", `/api/exercise-logs/${logId}`, undefined);
      await queryClient.invalidateQueries({ queryKey: [`/api/exercise-logs/${userId}`] });
      toast({
        title: "Exercise removed",
        description: "The exercise activity has been removed from your log",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove exercise activity. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Exercise Tracker</h1>
          <p className="text-sm text-gray-500">Track your workouts and calories burned</p>
        </div>
        <div className="mt-4 md:mt-0">
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
                <DialogTitle>Log Exercise Activity</DialogTitle>
              </DialogHeader>
              <AddExerciseForm onSuccess={() => setDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-blue-50 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium text-blue-700">Total Calories Burned</div>
                <div className="text-3xl font-bold text-blue-900">{totalCaloriesBurned}</div>
              </div>
              <div className="rounded-full bg-blue-100 p-3">
                <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-green-50 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium text-green-700">Activities Logged</div>
                <div className="text-3xl font-bold text-green-900">{filteredLogs.length}</div>
              </div>
              <div className="rounded-full bg-green-100 p-3">
                <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-purple-50 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-medium text-purple-700">Total Duration</div>
                <div className="text-3xl font-bold text-purple-900">
                  {filteredLogs.reduce((total, log) => total + log.duration, 0)} min
                </div>
              </div>
              <div className="rounded-full bg-purple-100 p-3">
                <svg className="h-6 w-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Exercise Activity</h2>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="md:w-1/2">
                <Input
                  placeholder="Search exercises..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-4">
                <Select value={exerciseType} onValueChange={setExerciseType}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Exercise Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="cardio">Cardio</SelectItem>
                    <SelectItem value="strength">Strength</SelectItem>
                    <SelectItem value="flexibility">Flexibility</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  className="w-40"
                  value={format(date, "yyyy-MM-dd")}
                  onChange={(e) => setDate(new Date(e.target.value))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No exercises found. Add some activities to your log.</p>
                <Button className="mt-4 bg-blue-500 hover:bg-blue-600" onClick={() => setDialogOpen(true)}>
                  Add Exercise
                </Button>
              </div>
            ) : (
              <>
                {filteredLogs.map(log => (
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
                                : log.exercise?.type === "strength"
                                ? "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                                : "M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                            }
                          />
                        </svg>
                        <h3 className="font-medium text-gray-900">{log.exercise?.name}</h3>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">{log.duration} minutes, {
                        log.exercise?.type === "cardio" ? "Cardio" :
                        log.exercise?.type === "strength" ? "Strength Training" :
                        log.exercise?.type === "flexibility" ? "Flexibility" : log.exercise?.type
                      }</div>
                    </div>
                    <div className="flex items-center">
                      <div className="text-right mr-4">
                        <div className="text-lg font-mono font-medium text-blue-600">{log.caloriesBurned}</div>
                        <div className="text-xs text-gray-500">calories burned</div>
                      </div>
                      <button 
                        className="text-gray-400 hover:text-red-500 ml-3"
                        onClick={() => handleDeleteExerciseLog(log.id)}
                      >
                        <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                <div className="rounded-lg bg-gray-50 p-4 border border-dashed border-gray-300 flex justify-between items-center">
                  <div>
                    <div className="font-medium text-gray-700">Total</div>
                    <div className="text-sm text-gray-500 mt-1">{filteredLogs.length} activities, {filteredLogs.reduce((total, log) => total + log.duration, 0)} minutes</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-mono font-medium text-blue-600">{totalCaloriesBurned}</div>
                    <div className="text-xs text-gray-500">calories burned</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-8">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Exercise Recommendations</h2>
          
          <Tabs defaultValue="cardio">
            <TabsList className="mb-4">
              <TabsTrigger value="cardio">Cardio</TabsTrigger>
              <TabsTrigger value="strength">Strength</TabsTrigger>
              <TabsTrigger value="flexibility">Flexibility</TabsTrigger>
            </TabsList>
            
            <TabsContent value="cardio" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Running</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Burns approximately 10.5 calories per minute. Great for cardiovascular health and endurance.</p>
                  <div className="mt-2 text-xs text-blue-600">Calories: ~315 for 30 minutes</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Cycling</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Burns approximately 8.5 calories per minute. Low impact and good for joint health.</p>
                  <div className="mt-2 text-xs text-blue-600">Calories: ~255 for 30 minutes</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Swimming</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Burns approximately 9.8 calories per minute. Full body workout with minimal impact.</p>
                  <div className="mt-2 text-xs text-blue-600">Calories: ~294 for 30 minutes</div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="strength" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Weight Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Burns approximately 5.5 calories per minute. Builds muscle and increases metabolism.</p>
                  <div className="mt-2 text-xs text-blue-600">Calories: ~165 for 30 minutes</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Bodyweight Exercises</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Burns approximately 6.0 calories per minute. No equipment needed, can be done anywhere.</p>
                  <div className="mt-2 text-xs text-blue-600">Calories: ~180 for 30 minutes</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Circuit Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Burns approximately 7.5 calories per minute. Combines strength and cardio for maximum effect.</p>
                  <div className="mt-2 text-xs text-blue-600">Calories: ~225 for 30 minutes</div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="flexibility" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Yoga</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Burns approximately 3.0 calories per minute. Improves flexibility, balance, and mental wellbeing.</p>
                  <div className="mt-2 text-xs text-blue-600">Calories: ~90 for 30 minutes</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Pilates</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Burns approximately 4.0 calories per minute. Focuses on core strength and flexibility.</p>
                  <div className="mt-2 text-xs text-blue-600">Calories: ~120 for 30 minutes</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Stretching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">Burns approximately 2.0 calories per minute. Essential for recovery and injury prevention.</p>
                  <div className="mt-2 text-xs text-blue-600">Calories: ~60 for 30 minutes</div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
