import { useState, useEffect, useCallback } from 'react';
import type { Routine, Schedule, WeightEntry, MealEntry, TimetableBlock, Activity } from '../types';

const ROUTINES_KEY = 'scheduleapp_routines';
const SCHEDULES_KEY = 'scheduleapp_schedules';
const WEIGHTS_KEY = 'scheduleapp_weights';
const MEALS_KEY = 'scheduleapp_meals';
const TIMETABLE_KEY = 'scheduleapp_timetable';
const ACTIVITIES_KEY = 'scheduleapp_activities';

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data));
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shouldRepeatOnDate(routine: Routine, date: Date): boolean {
  const day = date.getDay(); // 0=Sun
  switch (routine.repeatType) {
    case 'daily': return true;
    case 'weekday': return day >= 1 && day <= 5;
    case 'weekend': return day === 0 || day === 6;
    case 'weekly': return (routine.repeatDays ?? []).includes(day);
    default: return false;
  }
}

export function useStore() {
  const [routines, setRoutines] = useState<Routine[]>(() => load(ROUTINES_KEY, []));
  const [schedules, setSchedules] = useState<Schedule[]>(() => load(SCHEDULES_KEY, []));
  const [weights, setWeights] = useState<WeightEntry[]>(() => load(WEIGHTS_KEY, []));
  const [meals, setMeals] = useState<MealEntry[]>(() => load(MEALS_KEY, []));
  const [timetableBlocks, setTimetableBlocks] = useState<TimetableBlock[]>(() => load(TIMETABLE_KEY, []));
  const [activities, setActivities] = useState<Activity[]>(() => load(ACTIVITIES_KEY, [
    { id: 'act-1', name: '공부', color: '#6366f1' },
    { id: 'act-2', name: '운동', color: '#22c55e' },
    { id: 'act-3', name: '휴식', color: '#f97316' },
    { id: 'act-4', name: '식사', color: '#eab308' },
  ]));

  useEffect(() => { save(ROUTINES_KEY, routines); }, [routines]);
  useEffect(() => { save(SCHEDULES_KEY, schedules); }, [schedules]);
  useEffect(() => { save(WEIGHTS_KEY, weights); }, [weights]);
  useEffect(() => { save(MEALS_KEY, meals); }, [meals]);
  useEffect(() => { save(TIMETABLE_KEY, timetableBlocks); }, [timetableBlocks]);
  useEffect(() => { save(ACTIVITIES_KEY, activities); }, [activities]);

  const addRoutine = useCallback((routine: Routine) => {
    setRoutines(prev => [...prev, routine]);
  }, []);

  const updateRoutine = useCallback((updated: Routine) => {
    setRoutines(prev => prev.map(r => r.id === updated.id ? updated : r));
  }, []);

  const deleteRoutine = useCallback((id: string) => {
    setRoutines(prev => prev.filter(r => r.id !== id));
    setSchedules(prev => prev.filter(s => s.routineId !== id));
  }, []);

  const addSchedule = useCallback((schedule: Schedule) => {
    setSchedules(prev => [...prev, schedule]);
  }, []);

  const updateSchedule = useCallback((updated: Schedule) => {
    setSchedules(prev => prev.map(s => s.id === updated.id ? updated : s));
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
  }, []);

  const toggleComplete = useCallback((id: string) => {
    setSchedules(prev => prev.map(s => s.id === id ? { ...s, completed: !s.completed } : s));
  }, []);

  const getSchedulesForDate = useCallback((date: Date): Schedule[] => {
    const ds = dateStr(date);
    const manual = schedules.filter(s => s.date === ds && !s.routineId);

    const routineItems: Schedule[] = routines
      .filter(r => shouldRepeatOnDate(r, date))
      .map(r => {
        const existing = schedules.find(s => s.routineId === r.id && s.date === ds);
        if (existing) return existing;
        return {
          id: `${r.id}-${ds}`,
          title: r.title,
          description: r.description,
          date: ds,
          startTime: r.time,
          color: r.color,
          routineId: r.id,
          completed: false,
          createdAt: new Date().toISOString(),
        };
      });

    return [...routineItems, ...manual].sort((a, b) => {
      if (!a.startTime) return 1;
      if (!b.startTime) return -1;
      return a.startTime.localeCompare(b.startTime);
    });
  }, [schedules, routines]);

  const ensureRoutineSchedule = useCallback((routineId: string, date: Date) => {
    const ds = dateStr(date);
    const exists = schedules.find(s => s.routineId === routineId && s.date === ds);
    if (!exists) {
      const routine = routines.find(r => r.id === routineId);
      if (!routine) return;
      const newSchedule: Schedule = {
        id: `${routineId}-${ds}`,
        title: routine.title,
        description: routine.description,
        date: ds,
        startTime: routine.time,
        color: routine.color,
        routineId,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      setSchedules(prev => [...prev, newSchedule]);
    }
  }, [schedules, routines]);

  const setTimetableBlock = useCallback((block: TimetableBlock) => {
    setTimetableBlocks(prev => {
      const filtered = prev.filter(b => !(b.date === block.date && b.hour === block.hour && b.tenMin === block.tenMin && b.type === block.type));
      return [...filtered, block];
    });
  }, []);

  const clearTimetableBlock = useCallback((date: string, hour: number, tenMin: number, type: 'plan' | 'actual') => {
    setTimetableBlocks(prev => prev.filter(b => !(b.date === date && b.hour === hour && b.tenMin === tenMin && b.type === type)));
  }, []);

  const getTimetableForDate = useCallback((date: string) => {
    return timetableBlocks.filter(b => b.date === date);
  }, [timetableBlocks]);

  const addActivity = useCallback((a: Activity) => {
    setActivities(prev => [...prev, a]);
  }, []);

  const updateActivity = useCallback((updated: Activity) => {
    setActivities(prev => prev.map(a => a.id === updated.id ? updated : a));
  }, []);

  const deleteActivity = useCallback((id: string) => {
    setActivities(prev => prev.filter(a => a.id !== id));
  }, []);

  const addWeight = useCallback((entry: WeightEntry) => {
    setWeights(prev => [...prev, entry]);
  }, []);

  const updateWeight = useCallback((updated: WeightEntry) => {
    setWeights(prev => prev.map(w => w.id === updated.id ? updated : w));
  }, []);

  const deleteWeight = useCallback((id: string) => {
    setWeights(prev => prev.filter(w => w.id !== id));
  }, []);

  const addMeal = useCallback((entry: MealEntry) => {
    setMeals(prev => [...prev, entry]);
  }, []);

  const updateMeal = useCallback((updated: MealEntry) => {
    setMeals(prev => prev.map(m => m.id === updated.id ? updated : m));
  }, []);

  const deleteMeal = useCallback((id: string) => {
    setMeals(prev => prev.filter(m => m.id !== id));
  }, []);

  return {
    routines,
    schedules,
    weights,
    meals,
    timetableBlocks,
    activities,
    setTimetableBlock,
    clearTimetableBlock,
    getTimetableForDate,
    addActivity,
    updateActivity,
    deleteActivity,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleComplete,
    getSchedulesForDate,
    ensureRoutineSchedule,
    addWeight,
    updateWeight,
    deleteWeight,
    addMeal,
    updateMeal,
    deleteMeal,
  };
}

export type Store = ReturnType<typeof useStore>;
