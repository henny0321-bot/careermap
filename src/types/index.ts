export type RepeatType = 'daily' | 'weekday' | 'weekend' | 'weekly' | 'none';

export interface Routine {
  id: string;
  title: string;
  description?: string;
  time?: string;
  repeatType: RepeatType;
  repeatDays?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat (for weekly)
  color: string;
  createdAt: string;
}

export interface Schedule {
  id: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime?: string;
  endTime?: string;
  alarm?: string; // HH:MM — alarm time (same as or before startTime)
  color: string;
  routineId?: string; // if generated from a routine
  completed: boolean;
  createdAt: string;
}

export type ViewType = 'daily' | 'weekly' | 'monthly' | 'routines' | 'diet';

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weight: number; // kg
  note?: string;
}

export interface MealEntry {
  id: string;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food: string;
  calories?: number;
  note?: string;
}

export interface TimetableBlock {
  id: string;
  date: string;       // YYYY-MM-DD
  hour: number;       // 0-23
  tenMin: number;     // 0-5 (×10 = minutes: 0,10,20,30,40,50)
  type: 'plan' | 'actual';
  color: string;
  activityId?: string;
}

export interface Activity {
  id: string;
  name: string;
  color: string;
}

export const COLORS = [
  '#6366f1', // indigo
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
];
