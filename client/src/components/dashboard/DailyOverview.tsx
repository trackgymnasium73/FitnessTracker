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

interface DailyOverviewProps {
  nutritionProgress: NutritionProgress;
}

export default function DailyOverview({ nutritionProgress }: DailyOverviewProps) {
  const calculatePercentage = (consumed: number, goal: number) => {
    return Math.min(Math.round((consumed / goal) * 100), 100);
  };

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Today's Progress</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Calories Card */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-blue-700">Calories</span>
                <span className="text-sm font-mono text-blue-900">{nutritionProgress.calories.consumed}</span>
              </div>
              <div className="mt-2 text-xl font-bold flex items-baseline">
                <span className="text-blue-900 font-mono">{nutritionProgress.calories.consumed}</span>
                <span className="ml-1 text-sm text-blue-700 font-normal">/</span>
                <span className="text-sm text-blue-700 font-normal ml-1">{nutritionProgress.calories.goal}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${calculatePercentage(nutritionProgress.calories.consumed, nutritionProgress.calories.goal)}%` }}
                ></div>
              </div>
              <div className="text-xs text-blue-700 mt-1">
                <span>{nutritionProgress.calories.remaining} calories remaining</span>
              </div>
            </div>
            
            {/* Protein Card */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-green-700">Protein</span>
                <span className="text-sm font-mono text-green-900">{nutritionProgress.protein.consumed}g</span>
              </div>
              <div className="mt-2 text-xl font-bold flex items-baseline">
                <span className="text-green-900 font-mono">{nutritionProgress.protein.consumed}g</span>
                <span className="ml-1 text-sm text-green-700 font-normal">/</span>
                <span className="text-sm text-green-700 font-normal ml-1">{nutritionProgress.protein.goal}g</span>
              </div>
              <div className="w-full bg-green-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${calculatePercentage(nutritionProgress.protein.consumed, nutritionProgress.protein.goal)}%` }}
                ></div>
              </div>
              <div className="text-xs text-green-700 mt-1">
                <span>{nutritionProgress.protein.remaining}g remaining</span>
              </div>
            </div>

            {/* Carbs Card */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-yellow-700">Carbs</span>
                <span className="text-sm font-mono text-yellow-900">{nutritionProgress.carbs.consumed}g</span>
              </div>
              <div className="mt-2 text-xl font-bold flex items-baseline">
                <span className="text-yellow-900 font-mono">{nutritionProgress.carbs.consumed}g</span>
                <span className="ml-1 text-sm text-yellow-700 font-normal">/</span>
                <span className="text-sm text-yellow-700 font-normal ml-1">{nutritionProgress.carbs.goal}g</span>
              </div>
              <div className="w-full bg-yellow-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-yellow-500 h-2.5 rounded-full" 
                  style={{ width: `${calculatePercentage(nutritionProgress.carbs.consumed, nutritionProgress.carbs.goal)}%` }}
                ></div>
              </div>
              <div className="text-xs text-yellow-700 mt-1">
                <span>{nutritionProgress.carbs.remaining}g remaining</span>
              </div>
            </div>

            {/* Fat Card */}
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex justify-between">
                <span className="text-sm font-medium text-purple-700">Fat</span>
                <span className="text-sm font-mono text-purple-900">{nutritionProgress.fat.consumed}g</span>
              </div>
              <div className="mt-2 text-xl font-bold flex items-baseline">
                <span className="text-purple-900 font-mono">{nutritionProgress.fat.consumed}g</span>
                <span className="ml-1 text-sm text-purple-700 font-normal">/</span>
                <span className="text-sm text-purple-700 font-normal ml-1">{nutritionProgress.fat.goal}g</span>
              </div>
              <div className="w-full bg-purple-200 rounded-full h-2.5 mt-2">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full" 
                  style={{ width: `${calculatePercentage(nutritionProgress.fat.consumed, nutritionProgress.fat.goal)}%` }}
                ></div>
              </div>
              <div className="text-xs text-purple-700 mt-1">
                <span>{nutritionProgress.fat.remaining}g remaining</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
