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

function dateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function MonthlyView({ store, date, onDateChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [detailDate, setDetailDate] = useState<Date | null>(null);

  const year = date.getFullYear();
  const month = date.getMonth();
  const todayStr = dateStr(new Date());

  const firstDay = new Date(year, month, 1);
  const startPad = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: (Date | null)[] = [
    ...Array(startPad).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  function prevMonth() {
    const d = new Date(year, month - 1, 1);
    onDateChange(d);
  }
  function nextMonth() {
    const d = new Date(year, month + 1, 1);
    onDateChange(d);
  }

  function handleSave(s: Schedule) {
    if (editing) store.updateSchedule(s);
    else store.addSchedule(s);
    setShowForm(false);
    setEditing(null);
  }

  function handleEdit(s: Schedule) {
    if (s.routineId && detailDate) store.ensureRoutineSchedule(s.routineId, detailDate);
    setEditing(s);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (confirm('삭제하시겠습니까?')) store.deleteSchedule(id);
  }

  const detailItems = detailDate ? store.getSchedulesForDate(detailDate) : [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">‹</button>
        <p className="font-semibold text-gray-800">{year}년 {month + 1}월</p>
        <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-gray-100 text-gray-600">›</button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {DAY_LABELS.map((l, i) => (
            <div key={l} className={`py-2 text-center text-xs font-semibold ${i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-500'}`}>
              {l}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((d, i) => {
            if (!d) return <div key={i} className="min-h-[70px] border-r border-b border-gray-100 last:border-r-0" />;
            const ds = dateStr(d);
            const items = store.getSchedulesForDate(d).filter(s => !s.routineId);
            const isToday = ds === todayStr;
            const isSelected = detailDate && dateStr(detailDate) === ds;
            const col = i % 7;

            return (
              <button
                key={ds}
                onClick={() => {
                  setDetailDate(d);
                  onDateChange(d);
                }}
                className={`min-h-[70px] p-1.5 border-r border-b border-gray-100 last:border-r-0 text-left hover:bg-gray-50 transition-colors ${isSelected ? 'bg-indigo-50' : ''}`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                  isToday ? 'bg-indigo-500 text-white' : col === 0 ? 'text-red-400' : col === 6 ? 'text-blue-400' : 'text-gray-700'
                }`}>
                  {d.getDate()}
                </div>
                <div className="space-y-0.5">
                  {items.slice(0, 2).map(it => (
                    <div key={it.id} className="flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: it.color }} />
                      <span className={`text-xs truncate ${it.completed ? 'line-through text-gray-300' : 'text-gray-600'}`}>{it.title}</span>
                    </div>
                  ))}
                  {items.length > 2 && <p className="text-xs text-gray-400">+{items.length - 2}</p>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {detailDate && (
        <div className="mt-4 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-gray-800 text-sm">
              {detailDate.getMonth() + 1}월 {detailDate.getDate()}일 ({DAY_LABELS[detailDate.getDay()]})
            </p>
            <button
              onClick={() => { setSelectedDate(detailDate); setEditing(null); setShowForm(true); }}
              className="text-xs text-indigo-500 hover:text-indigo-600"
            >
              + 추가
            </button>
          </div>
          <div className="p-3 space-y-2">
            {detailItems.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">일정이 없습니다</p>
            ) : (
              detailItems.map(item => (
                <ScheduleItem
                  key={item.id}
                  schedule={item}
                  onToggle={id => {
                    if (item.routineId) store.ensureRoutineSchedule(item.routineId, detailDate);
                    store.toggleComplete(id);
                  }}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        </div>
      )}

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
