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

// Layout constants — compact enough to see ~16h on a phone
const HOUR_HEIGHT = 44; // px per hour
const START_HOUR = 5;
const END_HOUR = 25; // renders up to 01:00 next day
const TOTAL_HOURS = END_HOUR - START_HOUR;
const LABEL_W = 44; // px for hour label column

function dateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatDate(d: Date) {
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function minutesToPx(min: number) {
  return ((min - START_HOUR * 60) / 60) * HOUR_HEIGHT;
}

function pxToTime(px: number): string {
  const totalMin = Math.round(((px / HOUR_HEIGHT) * 60 + START_HOUR * 60) / 10) * 10;
  const h = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

type Mode = 'plan' | 'actual' | 'compare';

interface Block {
  schedule: Schedule;
  top: number;
  height: number;
  col: number;
  cols: number;
}

function layout(items: Schedule[], type: 'plan' | 'actual'): Block[] {
  const filtered = items
    .filter(s => (s.scheduleType ?? 'plan') === type && s.startTime)
    .map(s => ({
      schedule: s,
      start: timeToMinutes(s.startTime!),
      end: s.endTime ? timeToMinutes(s.endTime) : timeToMinutes(s.startTime!) + 60,
    }))
    .sort((a, b) => a.start - b.start);

  const cols: number[] = [];
  return filtered.map(item => {
    let col = cols.findIndex(end => end <= item.start);
    if (col === -1) { col = cols.length; cols.push(item.end); }
    else cols[col] = item.end;
    return {
      schedule: item.schedule,
      top: minutesToPx(item.start),
      height: Math.max(minutesToPx(item.end) - minutesToPx(item.start), 22),
      col,
      cols: 0,
    };
  }).map((b, _, arr) => {
    // count overlapping columns
    const s = timeToMinutes(b.schedule.startTime!);
    const e = b.schedule.endTime ? timeToMinutes(b.schedule.endTime) : s + 60;
    const maxCol = arr.reduce((m, x) => {
      const xs = timeToMinutes(x.schedule.startTime!);
      const xe = x.schedule.endTime ? timeToMinutes(x.schedule.endTime) : xs + 60;
      return (xs < e && xe > s) ? Math.max(m, x.col) : m;
    }, b.col);
    return { ...b, cols: maxCol + 1 };
  });
}

export default function DailyView({ store, date, onDateChange }: Props) {
  const [mode, setMode] = useState<Mode>('plan');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);
  const [defaultTime, setDefaultTime] = useState('');
  const [defaultType, setDefaultType] = useState<'plan' | 'actual'>('plan');
  const gridRef = useRef<HTMLDivElement>(null);

  const ds = dateStr(date);
  const all = store.getSchedulesForDate(date);
  const routineItems = all.filter(s => s.routineId);
  const planBlocks = layout(all.filter(s => !s.routineId), 'plan');
  const actualBlocks = layout(all.filter(s => !s.routineId), 'actual');

  const isToday = ds === dateStr(new Date());
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();
  const nowTop = minutesToPx(nowMin);
  const showNow = isToday && nowMin >= START_HOUR * 60 && nowMin < END_HOUR * 60;

  function prevDay() { const d = new Date(date); d.setDate(d.getDate() - 1); onDateChange(d); }
  function nextDay() { const d = new Date(date); d.setDate(d.getDate() + 1); onDateChange(d); }

  function handleGridClick(e: React.MouseEvent<HTMLDivElement>) {
    if ((e.target as HTMLElement).closest('.schedule-block')) return;
    const rect = gridRef.current!.getBoundingClientRect();
    const scrollTop = gridRef.current!.closest('.overflow-y-auto')?.scrollTop ?? 0;
    const y = e.clientY - rect.top + scrollTop;
    setDefaultTime(pxToTime(y));
    setDefaultType(mode === 'actual' ? 'actual' : 'plan');
    setEditing(null);
    setShowForm(true);
  }

  function handleEdit(s: Schedule) {
    if (s.routineId) store.ensureRoutineSchedule(s.routineId, date);
    setEditing(s);
    setShowForm(true);
  }

  function handleSave(s: Schedule) {
    if (editing) store.updateSchedule(s);
    else store.addSchedule(s);
    setShowForm(false);
    setEditing(null);
  }

  function handleDelete(id: string) {
    if (confirm('삭제하시겠습니까?')) { store.deleteSchedule(id); setShowForm(false); }
  }

  function renderBlock(b: Block, side?: 'left' | 'right') {
    const s = b.schedule;
    const W = side ? '50%' : `${100 / b.cols}%`;
    const L = side === 'right' ? '50%' : side === 'left' ? '0' : `${(b.col / b.cols) * 100}%`;
    return (
      <div
        key={s.id + (side ?? '')}
        className="schedule-block absolute rounded overflow-hidden cursor-pointer border border-white/40 hover:brightness-95 transition-all"
        style={{
          top: b.top + 1,
          height: b.height - 2,
          left: `calc(${L} + 2px)`,
          width: `calc(${W} - 4px)`,
          backgroundColor: side === 'right' ? s.color + 'bb' : s.color,
          opacity: s.completed ? 0.5 : 1,
        }}
        onClick={e => { e.stopPropagation(); handleEdit(s); }}
      >
        <div className="px-1 py-0.5 flex items-start gap-1 h-full">
          <button
            className="mt-0.5 w-3 h-3 rounded-full border border-white/70 flex-shrink-0"
            style={{ backgroundColor: s.completed ? 'rgba(255,255,255,0.5)' : 'transparent' }}
            onClick={e => {
              e.stopPropagation();
              if (s.routineId) store.ensureRoutineSchedule(s.routineId, date);
              store.toggleComplete(s.id);
            }}
          />
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-medium leading-tight truncate">{s.title}</p>
            {b.height >= 32 && s.startTime && (
              <p className="text-white/75 text-xs leading-tight">{s.startTime}{s.endTime ? `–${s.endTime}` : ''}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const planMin = planBlocks.reduce((sum, b) => {
    const s = timeToMinutes(b.schedule.startTime!);
    const e = b.schedule.endTime ? timeToMinutes(b.schedule.endTime) : s + 60;
    return sum + (e - s);
  }, 0);
  const actualMin = actualBlocks.reduce((sum, b) => {
    const s = timeToMinutes(b.schedule.startTime!);
    const e = b.schedule.endTime ? timeToMinutes(b.schedule.endTime) : s + 60;
    return sum + (e - s);
  }, 0);

  return (
    <div className="flex flex-col h-[calc(100vh-56px-56px)]">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2 space-y-2">
        <div className="flex items-center justify-between">
          <button onClick={prevDay} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 text-xl">‹</button>
          <div className="text-center">
            <span className="font-semibold text-gray-800 text-sm">{formatDate(date)}</span>
            {!isToday && (
              <button onClick={() => onDateChange(new Date())} className="ml-2 text-xs text-indigo-500">오늘</button>
            )}
          </div>
          <button onClick={nextDay} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 text-xl">›</button>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-lg bg-gray-100 p-0.5 gap-0.5">
          {(['plan', 'actual', 'compare'] as Mode[]).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${mode === m ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}>
              {m === 'plan' ? '계획' : m === 'actual' ? '실제' : '비교'}
            </button>
          ))}
        </div>

        {/* Summary */}
        {(planMin > 0 || actualMin > 0) && (
          <div className="flex gap-4 text-xs text-gray-500 px-1">
            {planMin > 0 && <span>📋 계획 <strong className="text-gray-700">{Math.floor(planMin/60) > 0 ? `${Math.floor(planMin/60)}h ` : ''}{planMin%60 > 0 ? `${planMin%60}m` : ''}</strong></span>}
            {actualMin > 0 && <span>✅ 실제 <strong className="text-gray-700">{Math.floor(actualMin/60) > 0 ? `${Math.floor(actualMin/60)}h ` : ''}{actualMin%60 > 0 ? `${actualMin%60}m` : ''}</strong></span>}
            {planMin > 0 && actualMin > 0 && (
              <span className={actualMin >= planMin ? 'text-green-600 font-medium' : 'text-orange-500 font-medium'}>
                {Math.round(actualMin / planMin * 100)}%
              </span>
            )}
          </div>
        )}

        {/* Routine chips (종일) */}
        {routineItems.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {routineItems.map(r => (
              <button key={r.id}
                onClick={() => handleEdit(r)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-white text-xs"
                style={{ backgroundColor: r.color, opacity: r.completed ? 0.5 : 1 }}
              >
                <span
                  onClick={e => { e.stopPropagation(); if (r.routineId) store.ensureRoutineSchedule(r.routineId, date); store.toggleComplete(r.id); }}
                  className={`w-2.5 h-2.5 rounded-full border border-white/60 inline-block ${r.completed ? 'bg-white/50' : ''}`}
                />
                <span className={r.completed ? 'line-through' : ''}>{r.title}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Timetable */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex">
          {/* Hour labels */}
          <div className="flex-shrink-0 bg-white sticky left-0 z-10" style={{ width: LABEL_W }}>
            {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => i).map(i => (
              <div key={i} className="relative" style={{ height: i === TOTAL_HOURS ? 0 : HOUR_HEIGHT }}>
                <span className="absolute -top-2 right-2 text-xs text-gray-400 leading-none font-mono select-none">
                  {i < TOTAL_HOURS ? String((START_HOUR + i) % 24).padStart(2, '0') : ''}
                </span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div
            ref={gridRef}
            className="flex-1 relative cursor-pointer border-l border-gray-200"
            style={{ height: TOTAL_HOURS * HOUR_HEIGHT }}
            onClick={handleGridClick}
          >
            {/* Hour lines */}
            {Array.from({ length: TOTAL_HOURS + 1 }, (_, i) => (
              <div key={i} className="absolute left-0 right-0 border-t border-gray-200" style={{ top: i * HOUR_HEIGHT }} />
            ))}
            {/* 30-min lines */}
            {Array.from({ length: TOTAL_HOURS }, (_, i) => (
              <div key={`h${i}`} className="absolute left-0 right-0 border-t border-gray-100 border-dashed" style={{ top: i * HOUR_HEIGHT + HOUR_HEIGHT / 2 }} />
            ))}

            {/* Now line */}
            {showNow && (
              <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: nowTop }}>
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-red-500 -ml-1 flex-shrink-0" />
                  <div className="flex-1 h-px bg-red-400" />
                </div>
              </div>
            )}

            {/* Blocks */}
            {mode === 'plan' && planBlocks.map(b => renderBlock(b))}
            {mode === 'actual' && actualBlocks.map(b => renderBlock(b))}
            {mode === 'compare' && (
              <>
                {planBlocks.map(b => renderBlock(b, 'left'))}
                {actualBlocks.map(b => renderBlock(b, 'right'))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => {
          setDefaultTime('');
          setDefaultType(mode === 'actual' ? 'actual' : 'plan');
          setEditing(null);
          setShowForm(true);
        }}
        className="fixed bottom-20 right-4 w-12 h-12 bg-indigo-500 text-white rounded-full shadow-lg text-2xl flex items-center justify-center hover:bg-indigo-600 z-30"
      >
        +
      </button>

      {showForm && (
        <Modal
          title={editing ? '일정 수정' : (defaultType === 'actual' ? '실제 기록 추가' : '계획 추가')}
          onClose={() => { setShowForm(false); setEditing(null); }}
        >
          <ScheduleForm
            date={ds}
            initial={editing ?? (defaultTime ? { startTime: defaultTime, scheduleType: defaultType } : { scheduleType: defaultType })}
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditing(null); }}
            onDelete={editing ? () => handleDelete(editing.id) : undefined}
          />
        </Modal>
      )}
    </div>
  );
}
