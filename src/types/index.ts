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
  alarm?: string;
  scheduleType?: 'plan' | 'actual'; // default = 'plan'
  color: string;
  routineId?: string;
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
  '#a78bfa', // pastel violet
  '#f9a8d4', // pastel pink
  '#fdba74', // pastel orange
  '#fcd34d', // pastel yellow
  '#86efac', // pastel green
  '#67e8f9', // pastel cyan
  '#93c5fd', // pastel blue
  '#c4b5fd', // pastel lavender
  '#f0abfc', // pastel fuchsia
  '#6ee7b7', // pastel teal
  '#fca5a5', // pastel red
  '#d9f99d', // pastel lime
];
