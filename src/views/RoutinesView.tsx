import { useState } from 'react';
import type { Routine } from '../types';
import type { Store } from '../store/useStore';
import Modal from '../components/Modal';
import RoutineForm from '../components/RoutineForm';

interface Props {
  store: Store;
}

function dateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shouldRepeatOnDate(routine: Routine, date: Date): boolean {
  const day = date.getDay();
  switch (routine.repeatType) {
    case 'daily': return true;
    case 'weekday': return day >= 1 && day <= 5;
    case 'weekend': return day === 0 || day === 6;
    case 'weekly': return (routine.repeatDays ?? []).includes(day);
    default: return false;
  }
}

const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export default function RoutinesView({ store }: Props) {
  const today = new Date();
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Routine | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = dateStr(today);

  function prevMonth() {
    setViewDate(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setViewDate(new Date(year, month + 1, 1));
  }

  function handleSave(r: Routine) {
    if (editing) store.updateRoutine(r);
    else store.addRoutine(r);
    setShowForm(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (confirm('루틴을 삭제하면 관련된 모든 완료 기록도 삭제됩니다. 계속하시겠습니까?')) {
      store.deleteRoutine(id);
    }
  }

  function isCompletedOnDay(routine: Routine, day: number): boolean {
    const d = new Date(year, month, day);
    if (!shouldRepeatOnDate(routine, d)) return false;
    const ds = dateStr(d);
    const s = store.schedules.find(s => s.routineId === routine.id && s.date === ds);
    return s?.completed ?? false;
  }

  function isScheduledOnDay(routine: Routine, day: number): boolean {
    const d = new Date(year, month, day);
    return shouldRepeatOnDate(routine, d);
  }

  function toggleDay(routine: Routine, day: number) {
    const d = new Date(year, month, day);
    const ds = dateStr(d);
    store.ensureRoutineSchedule(routine.id, d);
    const s = store.schedules.find(sc => sc.routineId === routine.id && sc.date === ds);
    if (s) {
      store.toggleComplete(s.id);
    } else {
      // after ensureRoutineSchedule, it will be created; toggle on next render cycle
      // Use a synthetic id
      store.toggleComplete(`${routine.id}-${ds}`);
    }
  }

  function getMonthCompletionCount(routine: Routine): { done: number; total: number } {
    let done = 0;
    let total = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      if (shouldRepeatOnDate(routine, date)) {
        total++;
        const ds = dateStr(date);
        const s = store.schedules.find(sc => sc.routineId === routine.id && sc.date === ds);
        if (s?.completed) done++;
      }
    }
    return { done, total };
  }

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="max-w-full px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 max-w-2xl mx-auto">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 text-lg">‹</button>
        <h2 className="font-bold text-gray-800 text-lg">{year}년 {MONTH_NAMES[month]} 습관 트래커</h2>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 text-lg">›</button>
      </div>

      {store.routines.length === 0 ? (
        <div className="text-center py-16 text-gray-400 max-w-2xl mx-auto">
          <p className="text-5xl mb-3">✅</p>
          <p className="text-sm font-medium">루틴이 없습니다</p>
          <p className="text-xs mt-1">아래 버튼을 눌러 루틴을 추가해보세요</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="border-collapse min-w-max mx-auto">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 pr-3 pl-1 pb-2 min-w-[120px] sticky left-0 bg-gray-50 z-10">습관</th>
                {days.map(d => {
                  const ds = dateStr(new Date(year, month, d));
                  const isToday = ds === todayStr;
                  const dow = new Date(year, month, d).getDay();
                  return (
                    <th key={d} className={`text-center pb-2 w-7 ${isToday ? 'text-indigo-600 font-bold' : dow === 0 ? 'text-red-400' : dow === 6 ? 'text-blue-400' : 'text-gray-400'} text-xs font-medium`}>
                      {d}
                    </th>
                  );
                })}
                <th className="text-center text-xs font-semibold text-gray-500 pl-3 pb-2 min-w-[50px]">달성</th>
              </tr>
            </thead>
            <tbody>
              {store.routines.map(routine => {
                const { done, total } = getMonthCompletionCount(routine);
                return (
                  <tr key={routine.id} className="border-t border-gray-100">
                    <td className="py-1.5 pr-3 pl-1 sticky left-0 bg-white z-10">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: routine.color }} />
                        <div className="flex items-center gap-1">
                          <span className="text-xs font-medium text-gray-700 truncate max-w-[80px]">{routine.title}</span>
                          <button
                            onClick={() => { setEditing(routine); setShowForm(true); }}
                            className="text-gray-300 hover:text-gray-500 text-xs leading-none"
                            title="수정"
                          >✏</button>
                          <button
                            onClick={() => handleDelete(routine.id)}
                            className="text-gray-300 hover:text-red-400 text-xs leading-none"
                            title="삭제"
                          >✕</button>
                        </div>
                      </div>
                    </td>
                    {days.map(d => {
                      const scheduled = isScheduledOnDay(routine, d);
                      const completed = isCompletedOnDay(routine, d);
                      const ds = dateStr(new Date(year, month, d));
                      const isToday = ds === todayStr;
                      const isPast = ds <= todayStr;

                      if (!scheduled) {
                        return <td key={d} className="w-7 h-7 text-center py-1" />;
                      }

                      return (
                        <td key={d} className="w-7 text-center py-1">
                          <button
                            onClick={() => isPast ? toggleDay(routine, d) : undefined}
                            disabled={!isPast}
                            className={`w-6 h-6 rounded-full mx-auto flex items-center justify-center transition-all ${
                              completed
                                ? 'opacity-100'
                                : isToday
                                ? 'border-2 border-dashed opacity-60'
                                : isPast
                                ? 'border border-gray-200 opacity-40'
                                : 'border border-gray-100 opacity-20'
                            } ${isPast ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
                            style={completed ? { backgroundColor: routine.color } : { borderColor: routine.color }}
                            title={completed ? '완료' : '미완료'}
                          />
                        </td>
                      );
                    })}
                    <td className="pl-3 text-center">
                      <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                        {done}<span className="text-gray-300">/{total}</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex justify-center">
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-5 py-2.5 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600 shadow-sm"
        >
          + 루틴 추가
        </button>
      </div>

      {showForm && (
        <Modal title={editing ? '루틴 수정' : '루틴 추가'} onClose={() => { setShowForm(false); setEditing(null); }}>
          <RoutineForm
            initial={editing ?? undefined}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}
    </div>
  );
}
