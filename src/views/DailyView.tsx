import { useState, useRef, useCallback, useEffect } from 'react';
import type { Activity, TimetableBlock } from '../types';
import type { Store } from '../store/useStore';
import Modal from '../components/Modal';

interface Props {
  store: Store;
  date: Date;
  onDateChange: (d: Date) => void;
}

const START_HOUR = 5;
const END_HOUR = 25; // 01:00 next day
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => (START_HOUR + i) % 24);
const TEN_MINS = [0, 1, 2, 3, 4, 5]; // ×10 min

function dateStr(d: Date) {
  return d.toISOString().slice(0, 10);
}

function formatDate(d: Date) {
  return d.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' });
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

type Mode = 'plan' | 'actual' | 'compare';
type Tool = 'paint' | 'erase';

function computeStats(blocks: TimetableBlock[], date: string) {
  const plan = blocks.filter(b => b.date === date && b.type === 'plan');
  const actual = blocks.filter(b => b.date === date && b.type === 'actual');
  const planMin = plan.length * 10;
  const actualMin = actual.length * 10;

  // per activity
  const byActivity: Record<string, { name: string; color: string; plan: number; actual: number }> = {};
  [...plan, ...actual].forEach(b => {
    const key = b.activityId ?? b.color;
    if (!byActivity[key]) byActivity[key] = { name: '', color: b.color, plan: 0, actual: 0 };
    byActivity[key][b.type] += 10;
  });

  return { planMin, actualMin, byActivity };
}

export default function DailyView({ store, date, onDateChange }: Props) {
  const [mode, setMode] = useState<Mode>('plan');
  const [tool, setTool] = useState<Tool>('paint');
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(store.activities[0] ?? null);
  const [painting, setPainting] = useState(false);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [newActName, setNewActName] = useState('');
  const [newActColor, setNewActColor] = useState('#6366f1');
  const [showStats, setShowStats] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const ds = dateStr(date);
  const blocks = store.getTimetableForDate(ds);
  const stats = computeStats(blocks, ds);

  // Keep selectedActivity in sync if activities change
  useEffect(() => {
    if (!selectedActivity && store.activities.length > 0) {
      setSelectedActivity(store.activities[0]);
    }
  }, [store.activities, selectedActivity]);

  function prevDay() { const d = new Date(date); d.setDate(d.getDate() - 1); onDateChange(d); }
  function nextDay() { const d = new Date(date); d.setDate(d.getDate() + 1); onDateChange(d); }
  function goToday() { onDateChange(new Date()); }

  const paintCell = useCallback((hour: number, tenMin: number) => {
    const type = mode === 'compare' ? 'plan' : mode;
    if (tool === 'erase') {
      store.clearTimetableBlock(ds, hour, tenMin, 'plan');
      store.clearTimetableBlock(ds, hour, tenMin, 'actual');
      return;
    }
    if (!selectedActivity) return;
    const block: TimetableBlock = {
      id: `${ds}-${hour}-${tenMin}-${type}`,
      date: ds,
      hour,
      tenMin,
      type,
      color: selectedActivity.color,
      activityId: selectedActivity.id,
    };
    store.setTimetableBlock(block);
  }, [ds, mode, tool, selectedActivity, store]);

  function handleCellMouseDown(hour: number, tenMin: number) {
    setPainting(true);
    paintCell(hour, tenMin);
  }

  function handleCellMouseEnter(hour: number, tenMin: number) {
    if (painting) paintCell(hour, tenMin);
  }

  useEffect(() => {
    const up = () => setPainting(false);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
    return () => { window.removeEventListener('mouseup', up); window.removeEventListener('touchend', up); };
  }, []);

  function getBlockAt(hour: number, tenMin: number, type: 'plan' | 'actual') {
    return blocks.find(b => b.hour === hour && b.tenMin === tenMin && b.type === type);
  }

  function fmtMin(min: number) {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return h > 0 ? `${h}시간${m > 0 ? ` ${m}분` : ''}` : `${m}분`;
  }

  function addActivity() {
    if (!newActName.trim()) return;
    const a: Activity = { id: `act-${Date.now()}`, name: newActName.trim(), color: newActColor };
    store.addActivity(a);
    setSelectedActivity(a);
    setNewActName('');
    setShowActivityModal(false);
  }

  const isToday = ds === dateStr(new Date());

  return (
    <div className="flex flex-col h-[calc(100vh-56px-56px)] bg-gray-50">
      {/* Header */}
      <div className="flex-shrink-0 bg-white border-b border-gray-200 px-3 py-2 space-y-2">
        {/* Date nav */}
        <div className="flex items-center justify-between">
          <button onClick={prevDay} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 text-xl leading-none">‹</button>
          <div className="text-center">
            <span className="font-semibold text-gray-800 text-sm">{formatDate(date)}</span>
            {!isToday && (
              <button onClick={goToday} className="ml-2 text-xs text-indigo-500 hover:underline">오늘</button>
            )}
          </div>
          <button onClick={nextDay} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 text-xl leading-none">›</button>
        </div>

        {/* Mode tabs */}
        <div className="flex rounded-lg bg-gray-100 p-0.5 gap-0.5">
          {(['plan', 'actual', 'compare'] as Mode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${mode === m ? 'bg-white shadow text-indigo-600' : 'text-gray-500'}`}
            >
              {m === 'plan' ? '계획' : m === 'actual' ? '실제' : '비교'}
            </button>
          ))}
        </div>

        {/* Activity palette + tools */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          {/* erase tool */}
          <button
            onClick={() => setTool(tool === 'erase' ? 'paint' : 'erase')}
            className={`flex-shrink-0 px-2 py-1 rounded-lg text-xs border transition-colors ${tool === 'erase' ? 'bg-red-100 border-red-400 text-red-600' : 'bg-white border-gray-300 text-gray-500'}`}
          >
            🧹
          </button>

          {store.activities.map(a => (
            <button
              key={a.id}
              onClick={() => { setSelectedActivity(a); setTool('paint'); }}
              className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs border transition-all ${selectedActivity?.id === a.id && tool === 'paint' ? 'border-gray-800 shadow-sm scale-105' : 'border-transparent'}`}
              style={{ backgroundColor: a.color + '22' }}
            >
              <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: a.color }} />
              <span className="text-gray-700">{a.name}</span>
            </button>
          ))}

          <button
            onClick={() => setShowActivityModal(true)}
            className="flex-shrink-0 px-2 py-1 rounded-lg text-xs border border-dashed border-gray-300 text-gray-400 hover:border-indigo-400 hover:text-indigo-400"
          >
            + 활동
          </button>

          <button
            onClick={() => setShowStats(!showStats)}
            className="flex-shrink-0 ml-auto px-2 py-1 rounded-lg text-xs border border-gray-200 text-gray-500 hover:border-indigo-300"
          >
            📊
          </button>
        </div>

        {/* Stats panel */}
        {showStats && (
          <div className="bg-gray-50 rounded-lg p-2 text-xs space-y-1">
            <div className="flex gap-4 text-gray-600">
              <span>📋 계획 <strong>{fmtMin(stats.planMin)}</strong></span>
              <span>✅ 실제 <strong>{fmtMin(stats.actualMin)}</strong></span>
              {stats.planMin > 0 && (
                <span>달성률 <strong className={stats.actualMin >= stats.planMin ? 'text-green-600' : 'text-orange-500'}>
                  {Math.round((stats.actualMin / stats.planMin) * 100)}%
                </strong></span>
              )}
            </div>
            {Object.entries(stats.byActivity).map(([key, v]) => (
              <div key={key} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: v.color }} />
                <span className="text-gray-600 w-12 truncate">{store.activities.find(a => a.id === key)?.name ?? '기타'}</span>
                <span className="text-gray-500">계획 {fmtMin(v.plan)}</span>
                <span className="text-gray-500">실제 {fmtMin(v.actual)}</span>
                {v.plan > 0 && (
                  <span className={v.actual >= v.plan ? 'text-green-500' : 'text-orange-400'}>
                    {v.actual >= v.plan ? '✓' : `−${fmtMin(v.plan - v.actual)}`}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Timetable grid */}
      <div className="flex-1 overflow-auto" ref={containerRef}>
        <div className="select-none" style={{ minWidth: 200 }}>
          {/* Column header */}
          <div className="flex sticky top-0 bg-white z-10 border-b border-gray-200">
            <div className="w-10 flex-shrink-0" />
            {TEN_MINS.map(m => (
              <div key={m} className="flex-1 text-center text-xs text-gray-400 py-1 border-l border-gray-100">
                {m === 0 ? '00' : m * 10}
              </div>
            ))}
          </div>

          {/* Hour rows */}
          {HOURS.map((hour, rowIdx) => {
            const displayHour = `${pad(hour)}`;
            return (
              <div key={rowIdx} className="flex border-b border-gray-100" style={{ height: 32 }}>
                {/* Hour label */}
                <div className="w-10 flex-shrink-0 flex items-center justify-end pr-1.5 text-xs text-gray-400 font-mono border-r border-gray-200 bg-white sticky left-0">
                  {displayHour}
                </div>

                {/* 10-min cells */}
                {TEN_MINS.map(tenMin => {
                  const planBlock = getBlockAt(hour, tenMin, 'plan');
                  const actualBlock = getBlockAt(hour, tenMin, 'actual');

                  return (
                    <div
                      key={tenMin}
                      className="flex-1 border-l border-gray-100 relative cursor-crosshair overflow-hidden"
                      onMouseDown={() => handleCellMouseDown(hour, tenMin)}
                      onMouseEnter={() => handleCellMouseEnter(hour, tenMin)}
                      onTouchStart={() => { setPainting(true); paintCell(hour, tenMin); }}
                      onTouchMove={e => {
                        const t = e.touches[0];
                        const el = document.elementFromPoint(t.clientX, t.clientY);
                        const cell = el?.closest('[data-cell]');
                        if (cell) {
                          const h = parseInt(cell.getAttribute('data-hour') ?? '0');
                          const m = parseInt(cell.getAttribute('data-min') ?? '0');
                          paintCell(h, m);
                        }
                      }}
                      data-cell
                      data-hour={hour}
                      data-min={tenMin}
                    >
                      {mode === 'compare' ? (
                        // Split cell: top = plan, bottom = actual
                        <>
                          <div
                            className="absolute inset-x-0 top-0 bottom-1/2"
                            style={{ backgroundColor: planBlock?.color ?? 'transparent' }}
                          />
                          <div
                            className="absolute inset-x-0 top-1/2 bottom-0"
                            style={{ backgroundColor: actualBlock ? actualBlock.color + 'cc' : 'transparent' }}
                          />
                          {/* divider line */}
                          <div className="absolute inset-x-0 top-1/2 h-px bg-white/50 z-10" />
                        </>
                      ) : mode === 'plan' ? (
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: planBlock?.color ?? 'transparent' }}
                        />
                      ) : (
                        <div
                          className="absolute inset-0"
                          style={{ backgroundColor: actualBlock?.color ?? 'transparent' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Activity add modal */}
      {showActivityModal && (
        <Modal title="활동 추가" onClose={() => setShowActivityModal(false)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">활동 이름</label>
              <input
                autoFocus
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={newActName}
                onChange={e => setNewActName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addActivity()}
                placeholder="예: 독서"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
              <div className="flex gap-2 flex-wrap">
                {['#6366f1','#8b5cf6','#ec4899','#f97316','#eab308','#22c55e','#06b6d4','#3b82f6','#ef4444','#14b8a6'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewActColor(c)}
                    className="w-7 h-7 rounded-full border-2 transition-transform hover:scale-110"
                    style={{ backgroundColor: c, borderColor: newActColor === c ? '#1f2937' : 'transparent' }}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={() => setShowActivityModal(false)} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600">취소</button>
              <button onClick={addActivity} className="flex-1 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600">추가</button>
            </div>
            {store.activities.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs text-gray-500 mb-2">등록된 활동</p>
                <div className="space-y-1">
                  {store.activities.map(a => (
                    <div key={a.id} className="flex items-center gap-2 text-sm">
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: a.color }} />
                      <span className="flex-1 text-gray-700">{a.name}</span>
                      <button
                        onClick={() => { store.deleteActivity(a.id); if (selectedActivity?.id === a.id) setSelectedActivity(store.activities.find(x => x.id !== a.id) ?? null); }}
                        className="text-gray-400 hover:text-red-500 text-xs"
                      >
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
