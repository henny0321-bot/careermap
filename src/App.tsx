import { useState, useEffect } from 'react';
import type { ViewType } from './types';
import { useStore } from './store/useStore';
import { useAlarm } from './store/useAlarm';
import DailyView from './views/DailyView';
import WeeklyView from './views/WeeklyView';
import MonthlyView from './views/MonthlyView';
import RoutinesView from './views/RoutinesView';
import DietView from './views/DietView';

const NAV_ITEMS: { view: ViewType; label: string; icon: string }[] = [
  { view: 'daily', label: '일간', icon: '📋' },
  { view: 'weekly', label: '주간', icon: '📅' },
  { view: 'monthly', label: '월간', icon: '🗓️' },
  { view: 'routines', label: '습관', icon: '✅' },
  { view: 'diet', label: '건강', icon: '💪' },
];

export default function App() {
  const [view, setView] = useState<ViewType>('daily');
  const [date, setDate] = useState(new Date());
  const [notifDenied, setNotifDenied] = useState(false);
  const store = useStore();
  useAlarm(store);

  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'denied') setNotifDenied(true);
      else if (Notification.permission === 'default') {
        Notification.requestPermission().then(p => {
          if (p === 'denied') setNotifDenied(true);
        });
      }
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-indigo-600">📆 내 스케줄</h1>
        </div>
        {notifDenied && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center justify-between max-w-2xl mx-auto">
            <p className="text-xs text-amber-700">🔕 알람을 받으려면 브라우저 알림 권한을 허용해 주세요</p>
            <button onClick={() => setNotifDenied(false)} className="text-amber-500 text-xs ml-2">✕</button>
          </div>
        )}
      </header>

      <main className="flex-1 pb-20">
        {view === 'daily' && <DailyView store={store} date={date} onDateChange={setDate} />}
        {view === 'weekly' && <WeeklyView store={store} date={date} onDateChange={setDate} />}
        {view === 'monthly' && <MonthlyView store={store} date={date} onDateChange={setDate} />}
        {view === 'routines' && <RoutinesView store={store} />}
        {view === 'diet' && <DietView store={store} />}
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
        <div className="max-w-2xl mx-auto grid grid-cols-5">
          {NAV_ITEMS.map(({ view: v, label, icon }) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
                view === v ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <span className="text-lg leading-none">{icon}</span>
              <span>{label}</span>
              {view === v && <span className="w-4 h-0.5 bg-indigo-500 rounded-full" />}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
