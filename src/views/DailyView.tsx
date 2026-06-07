import { useState, useRef } from 'react';
import type { Schedule } from '../types';
import type { Store } from '../store/useStore';
import Modal from '../components/Modal';
import ScheduleForm from '../components/ScheduleForm';

interface Props {
  store: Store;
  date: Date;
  onDateChange: (d: Date) => void;
}

const HOUR_HEIGHT = 60; // px per hour
const START_HOUR = 0;
const END_HOUR = 24;
const TOTAL_HOURS = END_HOUR - START_HOUR;

function dateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatDate(d: Date) {
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function minutesToPx(minutes: number): number {
  return (minutes / 60) * HOUR_HEIGHT;
}

function pxToMinutes(px: number): number {
  return Math.round((px / HOUR_HEIGHT) * 60);
}

interface PositionedSchedule {
  schedule: Schedule;
  top: number;
  height: number;
  column: number;
  totalColumns: number;
}

function layoutSchedules(items: Schedule[]): PositionedSchedule[] {
  const timed = items
    .filter(s => s.startTime)
    .map(s => ({
      schedule: s,
      start: timeToMinutes(s.startTime!),
      end: s.endTime ? timeToMinutes(s.endTime) : timeToMinutes(s.startTime!) + 60,
    }))
    .sort((a, b) => a.start - b.start);

  const columns: { end: number }[][] = [];

  const positioned: PositionedSchedule[] = timed.map(item => {
    let col = columns.findIndex(c => c[c.length - 1]?.end <= item.start);
    if (col === -1) { col = columns.length; columns.push([]); }
    columns[col].push({ end: item.end });
    return {
      schedule: item.schedule,
      top: minutesToPx(item.start - START_HOUR * 60),
      height: Math.max(minutesToPx(item.end - item.start), 20),
      column: col,
      totalColumns: 1,
    };
  });

  // Set totalColumns for overlapping groups
  positioned.forEach((p, i) => {
    const start = timeToMinutes(p.schedule.startTime!);
    const end = p.schedule.endTime ? timeToMinutes(p.schedule.endTime) : start + 60;
    let maxCol = p.column;
    positioned.forEach((q, j) => {
      if (i === j) return;
      const qs = timeToMinutes(q.schedule.startTime!);
      const qe = q.schedule.endTime ? timeToMinutes(q.schedule.endTime) : qs + 60;
      if (qs < end && qe > start) maxCol = Math.max(maxCol, q.column);
    });
    p.totalColumns = maxCol + 1;
  });

  return positioned;
}

export default function DailyView({ store, date, onDateChange }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [defaultTime, setDefaultTime] = useState<string>('');
  const timelineRef = useRef<HTMLDivElement>(null);

  const ds = dateStr(date);
  const items = store.getSchedulesForDate(date);
  const allDayItems = items.filter(s => !s.startTime);
  const completed = items.filter(i => i.completed).length;
  const positioned = layoutSchedules(items);
  const isToday = ds === dateStr(new Date());

  function prevDay() { const d = new Date(date); d.setDate(d.getDate() - 1); onDateChange(d); }
  function nextDay() { const d = new Date(date); d.setDate(d.getDate() + 1); onDateChange(d); }
  function goToday() { onDateChange(new Date()); }

  function handleTimelineClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('.schedule-block')) return;
    const rect = timelineRef.current!.getBoundingClientRect();
    const y = e.clientY - rect.top + timelineRef.current!.scrollTop;
    const totalMinutes = START_HOUR * 60 + pxToMinutes(y);
    const snapped = Math.round(totalMinutes / 5) * 5; // snap to 5min
    setDefaultTime(minutesToTime(Math.min(snapped, 23 * 60 + 55)));
    setEditing(null);
    setShowForm(true);
  }

  function handleSave(s: Schedule) {
    if (editing) store.updateSchedule(s);
    else store.addSchedule(s);
    setShowForm(false);
    setEditing(null);
  }

  function handleEdit(s: Schedule) {
    if (s.routineId) store.ensureRoutineSchedule(s.routineId, date);
    setEditing(s);
    setShowForm(true);
  }

  function handleDelete(id: string) {
    if (confirm('삭제하시겠습니까?')) store.deleteSchedule(id);
  }

  const nowMinutes = (() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  })();
  const nowTop = minutesToPx(nowMinutes - START_HOUR * 60);

  return (
    <div className="flex flex-col h-[calc(100vh-56px-56px)]">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            <button onClick={prevDay} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-lg">‹</button>
            <div className="text-center">
              <p className="font-semibold text-gray-800 text-sm">{formatDate(date)}</p>
              {!isToday && (
                <button onClick={goToday} className="text-xs text-indigo-500 hover:underline">오늘로</button>
              )}
            </div>
            <button onClick={nextDay} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 text-lg">›</button>
          </div>

          {items.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all"
                  style={{ width: `${(completed / items.length) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-400">{completed}/{items.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* All-day items */}
      {allDayItems.length > 0 && (
        <div className="flex-shrink-0 bg-gray-50 border-b border-gray-200 px-4 py-2">
          <div className="max-w-2xl mx-auto flex flex-wrap gap-1.5">
            {allDayItems.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-white text-xs cursor-pointer"
                style={{ backgroundColor: item.color }}
                onClick={() => handleEdit(item)}
              >
                <button
                  onClick={e => { e.stopPropagation(); store.toggleComplete(item.id); }}
                  className={`w-3.5 h-3.5 rounded-full border border-white/70 flex-shrink-0 ${item.completed ? 'bg-white/40' : ''}`}
                />
                <span className={item.completed ? 'line-through opacity-70' : ''}>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timetable */}
      <div className="flex-1 overflow-y-auto" ref={timelineRef}>
        <div className="max-w-2xl mx-auto relative flex">
          {/* Hour labels */}
          <div className="flex-shrink-0 w-12 select-none">
            {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => i + START_HOUR).map(h => (
              <div
                key={h}
                className="relative text-right pr-2"
                style={{ height: h === END_HOUR ? 0 : HOUR_HEIGHT }}
              >
                <span className="absolute -top-2 right-2 text-xs text-gray-400 leading-none">
                  {h < 24 ? `${String(h).padStart(2, '0')}:00` : ''}
                </span>
              </div>
            ))}
          </div>

          {/* Grid + events */}
          <div
            className="flex-1 relative cursor-pointer select-none border-l border-gray-200"
            style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
            onClick={handleTimelineClick}
          >
            {/* Hour lines */}
            {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
              <div
                key={i}
                className="absolute left-0 right-0 border-t border-gray-100"
                style={{ top: i * HOUR_HEIGHT }}
              />
            ))}
            {/* 30-min lines */}
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
              <div
                key={`half-${i}`}
                className="absolute left-0 right-0 border-t border-gray-50"
                style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }}
              />
            ))}

            {/* Now indicator */}
            {isToday && nowMinutes >= START_HOUR * 60 && nowMinutes < END_HOUR * 60 && (
              <div
                className="absolute left-0 right-0 z-10 pointer-events-none"
                style={{ top: nowTop }}
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0" />
                  <div className="flex-1 h-px bg-red-400" />
                </div>
              </div>
            )}

            {/* Schedule blocks */}
            {positioned.map(({ schedule: s, top, height, column, totalColumns }) => {
              const colWidth = `${100 / totalColumns}%`;
              const colLeft = `${(column / totalColumns) * 100}%`;
              return (
                <div
                  key={s.id}
                  className="schedule-block absolute rounded-lg px-2 py-1 overflow-hidden cursor-pointer border border-white/30 hover:brightness-95 transition-all"
                  style={{
                    top: top + 1,
                    height: height - 2,
                    left: `calc(${colLeft} + 4px)`,
                    width: `calc(${colWidth} - 8px)`,
                    backgroundColor: s.color,
                    opacity: s.completed ? 0.5 : 1,
                  }}
                  onClick={e => { e.stopPropagation(); handleEdit(s); }}
                >
                  <div className="flex items-start gap-1 h-full">
                    <button
                      className="mt-0.5 w-3.5 h-3.5 rounded-full border border-white/70 flex-shrink-0 hover:bg-white/30"
                      style={{ backgroundColor: s.completed ? 'rgba(255,255,255,0.4)' : 'transparent' }}
                      onClick={e => {
                        e.stopPropagation();
                        if (s.routineId) store.ensureRoutineSchedule(s.routineId, date);
                        store.toggleComplete(s.id);
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-white font-medium leading-tight truncate ${height < 30 ? 'text-xs' : 'text-xs'}`}>
                        {s.title}
                      </p>
                      {height >= 36 && (
                        <p className="text-white/80 text-xs leading-tight">
                          {s.startTime}{s.endTime ? `–${s.endTime}` : ''}
                        </p>
                      )}
                    </div>
                    {height >= 36 && (
                      <button
                        className="text-white/60 hover:text-white text-xs leading-none flex-shrink-0"
                        onClick={e => { e.stopPropagation(); handleDelete(s.id); }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditing(null); setDefaultTime(''); setShowForm(true); }}
        className="fixed bottom-20 right-4 w-12 h-12 bg-indigo-500 text-white rounded-full shadow-lg text-2xl flex items-center justify-center hover:bg-indigo-600 z-30"
      >
        +
      </button>

      {showForm && (
        <Modal
          title={editing ? '일정 수정' : '일정 추가'}
          onClose={() => { setShowForm(false); setEditing(null); }}
        >
          <ScheduleForm
            date={ds}
            initial={editing ?? (defaultTime ? { startTime: defaultTime } : undefined)}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </Modal>
      )}
    </div>
  );
}
