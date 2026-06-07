import { useState } from 'react';
import type { WeightEntry, MealEntry } from '../types';
import type { Store } from '../store/useStore';

interface Props {
  store: Store;
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatDate(ds: string): string {
  const [y, m, day] = ds.split('-');
  return `${y}년 ${parseInt(m)}월 ${parseInt(day)}일`;
}

const MEAL_LABELS: Record<MealEntry['mealType'], string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식',
};

const MEAL_TYPES: MealEntry['mealType'][] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function DietView({ store }: Props) {
  const [date, setDate] = useState(new Date());
  const ds = dateStr(date);

  // Weight state
  const [weightInput, setWeightInput] = useState('');

  // Meal add form state per slot
  const [addingMeal, setAddingMeal] = useState<MealEntry['mealType'] | null>(null);
  const [mealFood, setMealFood] = useState('');
  const [mealCalories, setMealCalories] = useState('');

  function prevDay() {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    setDate(d);
  }
  function nextDay() {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    setDate(d);
  }

  function saveWeight() {
    const w = parseFloat(weightInput);
    if (isNaN(w) || w <= 0) return;
    // Check if entry already exists for this date
    const existing = store.weights.find(e => e.date === ds);
    if (existing) {
      store.updateWeight({ ...existing, weight: w });
    } else {
      const entry: WeightEntry = {
        id: `w-${Date.now()}`,
        date: ds,
        weight: w,
      };
      store.addWeight(entry);
    }
    setWeightInput('');
  }

  function saveMeal() {
    if (!addingMeal || !mealFood.trim()) return;
    const entry: MealEntry = {
      id: `m-${Date.now()}`,
      date: ds,
      mealType: addingMeal,
      food: mealFood.trim(),
      calories: mealCalories ? parseInt(mealCalories) : undefined,
    };
    store.addMeal(entry);
    setMealFood('');
    setMealCalories('');
    setAddingMeal(null);
  }

  const todayWeight = store.weights.find(e => e.date === ds);
  const last7Weights = [...store.weights]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 7);
  const avg7 = last7Weights.length > 0
    ? (last7Weights.reduce((s, e) => s + e.weight, 0) / last7Weights.length).toFixed(1)
    : null;

  const mealsForDate = store.meals.filter(m => m.date === ds);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* Date navigation */}
      <div className="flex items-center justify-between">
        <button onClick={prevDay} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 text-lg">‹</button>
        <p className="font-semibold text-gray-800">{formatDate(ds)}</p>
        <button onClick={nextDay} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 text-lg">›</button>
      </div>

      {/* Weight section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <span className="text-lg">⚖️</span>
          <h3 className="font-semibold text-gray-800">몸무게</h3>
        </div>
        <div className="p-4 space-y-4">
          {todayWeight && (
            <p className="text-sm text-indigo-600 font-medium">오늘 기록: {todayWeight.weight}kg</p>
          )}
          <div className="flex gap-2">
            <input
              type="number"
              step="0.1"
              min="0"
              value={weightInput}
              onChange={e => setWeightInput(e.target.value)}
              placeholder="몸무게 입력 (kg)"
              className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
              onKeyDown={e => e.key === 'Enter' && saveWeight()}
            />
            <button
              onClick={saveWeight}
              className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600"
            >
              저장
            </button>
          </div>

          {last7Weights.length > 0 && (
            <div>
              {avg7 && (
                <p className="text-xs text-gray-400 mb-2">지난 {last7Weights.length}일 평균: <span className="font-semibold text-gray-600">{avg7}kg</span></p>
              )}
              <div className="space-y-1">
                {last7Weights.map(e => (
                  <div key={e.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">{formatDate(e.date)}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-800">{e.weight}kg</span>
                      <button
                        onClick={() => store.deleteWeight(e.id)}
                        className="text-gray-300 hover:text-red-400 text-xs"
                      >✕</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Meal section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2">
          <span className="text-lg">🍽️</span>
          <h3 className="font-semibold text-gray-800">식단</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {MEAL_TYPES.map(mealType => {
            const entries = mealsForDate.filter(m => m.mealType === mealType);
            return (
              <div key={mealType} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">{MEAL_LABELS[mealType]}</h4>
                  <button
                    onClick={() => { setAddingMeal(mealType); setMealFood(''); setMealCalories(''); }}
                    className="text-xs text-indigo-500 hover:text-indigo-600 font-medium"
                  >
                    + 추가
                  </button>
                </div>

                {entries.length > 0 && (
                  <div className="space-y-1 mb-2">
                    {entries.map(e => (
                      <div key={e.id} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-1.5">
                        <span className="text-gray-700">{e.food}</span>
                        <div className="flex items-center gap-2">
                          {e.calories && <span className="text-gray-400 text-xs">{e.calories}kcal</span>}
                          <button
                            onClick={() => store.deleteMeal(e.id)}
                            className="text-gray-300 hover:text-red-400 text-xs"
                          >✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {addingMeal === mealType && (
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={mealFood}
                      onChange={e => setMealFood(e.target.value)}
                      placeholder="음식 이름"
                      className="flex-1 border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      autoFocus
                    />
                    <input
                      type="number"
                      value={mealCalories}
                      onChange={e => setMealCalories(e.target.value)}
                      placeholder="kcal"
                      className="w-16 border border-gray-200 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    />
                    <button
                      onClick={saveMeal}
                      className="px-3 py-1.5 bg-indigo-500 text-white rounded-lg text-sm font-medium hover:bg-indigo-600"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setAddingMeal(null)}
                      className="px-2 py-1.5 text-gray-400 hover:text-gray-600 text-sm"
                    >
                      취소
                    </button>
                  </div>
                )}

                {entries.length === 0 && addingMeal !== mealType && (
                  <p className="text-xs text-gray-300">기록 없음</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
