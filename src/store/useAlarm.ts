import { useEffect, useRef } from 'react';
import type { Store } from '../store/useStore';

const FIRED_KEY = 'scheduleapp_fired_alarms';

function loadFired(): Set<string> {
  try {
    const raw = localStorage.getItem(FIRED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveFired(fired: Set<string>) {
  // Keep only today's entries to avoid unbounded growth
  const today = new Date().toISOString().slice(0, 10);
  const filtered = [...fired].filter(k => k.startsWith(today));
  localStorage.setItem(FIRED_KEY, JSON.stringify(filtered));
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.0);
    osc.onended = () => ctx.close();
  } catch {
    // AudioContext not available
  }
}

function notify(title: string, body?: string) {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.svg',
      tag: title,
    });
  }
  playBeep();
}

export function useAlarm(store: Store) {
  const firedRef = useRef<Set<string>>(loadFired());

  // Request permission once on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    function check() {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      // Check schedule alarms
      store.schedules.forEach(s => {
        if (s.date !== today) return;
        if (!s.alarm) return;
        if (s.completed) return;
        if (s.alarm !== nowTime) return;
        const key = `${today}-${s.id}-${s.alarm}`;
        if (firedRef.current.has(key)) return;
        firedRef.current.add(key);
        saveFired(firedRef.current);
        notify(`⏰ ${s.title}`, s.startTime ? `시작 시간: ${s.startTime}` : undefined);
      });

      // Check routine alarms (via routines with time set)
      store.routines.forEach(r => {
        if (!r.time) return;
        if (r.time !== nowTime) return;
        const key = `${today}-routine-${r.id}-${r.time}`;
        if (firedRef.current.has(key)) return;
        // Check if this routine applies today
        const day = now.getDay();
        const applies =
          r.repeatType === 'daily' ||
          (r.repeatType === 'weekday' && day >= 1 && day <= 5) ||
          (r.repeatType === 'weekend' && (day === 0 || day === 6)) ||
          (r.repeatType === 'weekly' && (r.repeatDays ?? []).includes(day));
        if (!applies) return;
        // Check not already completed today
        const ds = today;
        const existing = store.schedules.find(s => s.routineId === r.id && s.date === ds);
        if (existing?.completed) return;
        firedRef.current.add(key);
        saveFired(firedRef.current);
        notify(`🔄 ${r.title}`, '루틴 시간입니다');
      });
    }

    check(); // run immediately
    const interval = setInterval(check, 30_000); // every 30s
    return () => clearInterval(interval);
  }, [store.schedules, store.routines]);
}
