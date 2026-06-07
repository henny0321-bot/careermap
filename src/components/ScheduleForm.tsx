import { useState } from 'react';
import { COLORS } from '../types';
import type { Schedule } from '../types';
import ColorPicker from './ColorPicker';

interface Props {
  date: string;
  initial?: Partial<Schedule>;
  onSave: (s: Schedule) => void;
  onCancel: () => void;
}

export default function ScheduleForm({ date, initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [startTime, setStartTime] = useState(initial?.startTime ?? '');
  const [endTime, setEndTime] = useState(initial?.endTime ?? '');
  const [alarm, setAlarm] = useState(initial?.alarm ?? '');
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: initial?.id ?? `sch-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      date,
      startTime: startTime || undefined,
      endTime: endTime || undefined,
      alarm: alarm || undefined,
      color,
      completed: initial?.completed ?? false,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">제목 *</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="일정 제목"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
        <textarea
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          placeholder="선택 사항"
        />
      </div>
      <div className="flex gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">시작 시간</label>
          <input
            type="time"
            step="60"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">종료 시간</label>
          <input
            type="time"
            step="60"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          알람 <span className="text-gray-400 font-normal text-xs">(선택)</span>
        </label>
        <div className="flex items-center gap-2">
          <input
            type="time"
            step="60"
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            value={alarm}
            onChange={e => setAlarm(e.target.value)}
          />
          {alarm && (
            <button type="button" onClick={() => setAlarm('')} className="text-gray-400 hover:text-gray-600 text-sm px-2">✕</button>
          )}
        </div>
        {alarm && startTime && alarm > startTime && (
          <p className="text-xs text-orange-500 mt-1">알람이 시작 시간 이후로 설정되어 있습니다</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">색상</label>
        <ColorPicker value={color} onChange={setColor} />
      </div>
      <div className="flex gap-2 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 py-2 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-50">취소</button>
        <button type="submit" className="flex-1 py-2 rounded-lg bg-indigo-500 text-white text-sm font-medium hover:bg-indigo-600">저장</button>
      </div>
    </form>
  );
}
