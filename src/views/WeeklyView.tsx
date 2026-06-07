import { useState } from 'react';
import type { Schedule } from '../types';
import type { Store } from '../store/useStore';
import Modal from '../components/Modal';
import ScheduleForm from '../components/ScheduleForm';
import ScheduleItem from '../components/ScheduleItem';

interface Props {
  store: Store;
  date: Date;
  onDateChange: (d: Date) => void;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  copy.setDate(copy.getDate() - day);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function dateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function WeeklyView({ store, date, onDateChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [expandedDay, setExpandedDay] = useState<string | null>(dateStr(date));

  const weekStart = startOfWeek(date);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const todayStr = dateStr(new Date());

  function prevWeek() {
    const d = new Date(date);
    d.setDate(d.getDate() - 7);
    onDateChange(d);
  }
  function nextWeek() {
    const d = new Date(date);
    d.setDate(d.getDate() + 7);
    onDateChange(d);
  }

  function weekLabel() {
    const end = days[6];
    return `${weekStart.getMonth() + 1}월 ${weekStart.getDate()}일 ~ ${end.getMonth() + 1}월 ${end.getDate()}일`;
  }

  function handleSave(s: Schedule) {
    if (editing) store.updateSchedule(s);
    else store.addSchedule(s);
    setShowForm(false);
    setEditing(null);
  }

  function handleEdit(s: Schedule, d: Date) {
    if (s.routineId) store.ensureRoutineSchedule(s.routineId, d);
    setEditing(s);
    setSelectedDate(d);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (confirm('삭제하시겠습니까?')) store.deleteSchedule(id);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevWeek} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">‹</button>
        <p className="font-semibold text-gray-800">{weekLabel()}</p>
        <button onClick={nextWeek} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">›</button>
      </div>

      <div className="space-y-2">
        {days.map((d) => {
          const ds = dateStr(d);
          const items = store.getSchedulesForDate(d);
          const isToday = ds === todayStr;
          const isExpanded = expandedDay === ds;
          const completed = items.filter(i => i.completed).length;

          return (
            <div key={ds} className={`rounded-xl border overflow-hidden ${isToday ? 'border-indigo-300' : 'border-gray-200'}`}>
              <button
                className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${isToday ? 'bg-indigo-50' : 'bg-white'}`}
                onClick={() => {
                  setExpandedDay(isExpanded ? null : ds);
                  onDateChange(d);
                }}
              >
                <div className={`w-9 h-9 rounded-full flex flex-col items-center justify-center text-xs font-bold flex-shrink-0 ${isToday ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  <span>{DAY_LABELS[d.getDay()]}</span>
                  <span>{d.getDate()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  {items.length === 0 ? (
                    <p className="text-xs text-gray-400">일정 없음</p>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {items.slice(0, 3).map(it => (
                          <span key={it.id} className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: it.color }} />
                        ))}
                        {items.length > 3 && <span className="text-xs text-gray-400">+{items.length - 3}</span>}
                      </div>
                      <span className="text-xs text-gray-500">{completed}/{items.length} 완료</span>
                    </div>
                  )}
                </div>
                <span className="text-gray-400 text-xs">{isExpanded ? '▲' : '▼'}</span>
              </button>

              {isExpanded && (
                <div className="px-4 pb-3 space-y-2 border-t border-gray-100">
                  <div className="pt-2 space-y-2">
                    {items.map(item => (
                      <ScheduleItem
                        key={item.id}
                        schedule={item}
                        onToggle={id => {
                          if (item.routineId) store.ensureRoutineSchedule(item.routineId, d);
                          store.toggleComplete(id);
                        }}
                        onEdit={s => handleEdit(s, d)}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => { setSelectedDate(d); setEditing(null); setShowForm(true); }}
                    className="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-indigo-400 hover:text-indigo-400 transition-colors text-xs"
                  >
                    + 추가
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <Modal title={editing ? '일정 수정' : '일정 추가'} onClose={() => { setShowForm(false); setEditing(null); }}>
          <ScheduleForm
            date={dateStr(selectedDate)}
            initial={editing ?? undefined}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}
    </div>
  );
}
