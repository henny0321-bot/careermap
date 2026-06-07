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

function formatDate(d: Date) {
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
}

function dateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function DailyView({ store, date, onDateChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);

  const items = store.getSchedulesForDate(date);
  const completed = items.filter(i => i.completed).length;

  function prevDay() { const d = new Date(date); d.setDate(d.getDate() - 1); onDateChange(d); }
  function nextDay() { const d = new Date(date); d.setDate(d.getDate() + 1); onDateChange(d); }
  function goToday() { onDateChange(new Date()); }

  function handleSave(s: Schedule) {
    if (editing) {
      store.updateSchedule(s);
    } else {
      store.addSchedule(s);
    }
    setShowForm(false);
    setEditing(null);
  }

  function handleEdit(s: Schedule) {
    if (s.routineId) {
      store.ensureRoutineSchedule(s.routineId, date);
    }
    setEditing(s);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (confirm('삭제하시겠습니까?')) store.deleteSchedule(id);
  }

  const isToday = dateStr(date) === dateStr(new Date());

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevDay} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">‹</button>
        <div className="text-center">
          <p className="font-semibold text-gray-800">{formatDate(date)}</p>
          {!isToday && (
            <button onClick={goToday} className="text-xs text-indigo-500 hover:underline mt-0.5">오늘로</button>
          )}
        </div>
        <button onClick={nextDay} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">›</button>
      </div>

      {items.length > 0 && (
        <div className="mb-4 flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all"
              style={{ width: `${(completed / items.length) * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{completed}/{items.length}</span>
        </div>
      )}

      <div className="space-y-2 mb-4">
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📅</p>
            <p className="text-sm">일정이 없습니다</p>
          </div>
        ) : (
          items.map(item => (
            <ScheduleItem
              key={item.id}
              schedule={item}
              onToggle={id => {
                if (item.routineId) store.ensureRoutineSchedule(item.routineId, date);
                store.toggleComplete(id);
              }}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      <button
        onClick={() => { setEditing(null); setShowForm(true); }}
        className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-400 hover:border-indigo-400 hover:text-indigo-400 transition-colors text-sm"
      >
        + 일정 추가
      </button>

      {showForm && (
        <Modal title={editing ? '일정 수정' : '일정 추가'} onClose={() => { setShowForm(false); setEditing(null); }}>
          <ScheduleForm
            date={dateStr(date)}
            initial={editing ?? undefined}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}
    </div>
  );
}
