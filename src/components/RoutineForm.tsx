import { useState } from 'react';
import { COLORS } from '../types';
import type { Routine, RepeatType } from '../types';
import ColorPicker from './ColorPicker';

interface Props {
  initial?: Partial<Routine>;
  onSave: (r: Routine) => void;
  onCancel: () => void;
}

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function RoutineForm({ initial, onSave, onCancel }: Props) {
  const [title, setTitle] = useState(initial?.title ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [time, setTime] = useState(initial?.time ?? '');
  const [repeatType, setRepeatType] = useState<RepeatType>(initial?.repeatType ?? 'daily');
  const [repeatDays, setRepeatDays] = useState<number[]>(initial?.repeatDays ?? []);
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);

  function toggleDay(day: number) {
    setRepeatDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({
      id: initial?.id ?? `rtn-${Date.now()}`,
      title: title.trim(),
      description: description.trim() || undefined,
      time: time || undefined,
      repeatType,
      repeatDays: repeatType === 'weekly' ? repeatDays : undefined,
      color,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">루틴 이름 *</label>
        <input
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="예: 아침 운동"
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
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
        <input
          type="time"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          value={time}
          onChange={e => setTime(e.target.value)}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">반복</label>
        <div className="flex flex-wrap gap-2">
          {(['daily', 'weekday', 'weekend', 'weekly'] as RepeatType[]).map(rt => (
            <button
              key={rt}
              type="button"
              onClick={() => setRepeatType(rt)}
              className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                repeatType === rt
                  ? 'bg-indigo-500 text-white border-indigo-500'
                  : 'border-gray-300 text-gray-600 hover:border-indigo-300'
              }`}
            >
              {rt === 'daily' ? '매일' : rt === 'weekday' ? '평일' : rt === 'weekend' ? '주말' : '특정 요일'}
            </button>
          ))}
        </div>
        {repeatType === 'weekly' && (
          <div className="flex gap-1 mt-3">
            {DAY_LABELS.map((label, i) => (
              <button
                key={i}
                type="button"
                onClick={() => toggleDay(i)}
                className={`w-9 h-9 rounded-full text-sm font-medium transition-colors ${
                  repeatDays.includes(i)
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
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
