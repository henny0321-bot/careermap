import type { Schedule } from '../types';

interface Props {
  schedule: Schedule;
  onToggle: (id: string) => void;
  onEdit: (s: Schedule) => void;
  onDelete: (id: string) => void;
}

export default function ScheduleItem({ schedule, onToggle, onEdit, onDelete }: Props) {
  return (
    <div className={`flex items-start gap-3 p-3 rounded-xl border transition-opacity ${schedule.completed ? 'opacity-60' : ''}`}
      style={{ borderColor: schedule.color + '40', backgroundColor: schedule.color + '10' }}
    >
      <button
        onClick={() => onToggle(schedule.id)}
        className="mt-0.5 w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors"
        style={{
          borderColor: schedule.color,
          backgroundColor: schedule.completed ? schedule.color : 'transparent',
        }}
      />
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium text-gray-800 ${schedule.completed ? 'line-through text-gray-400' : ''}`}>
          {schedule.title}
        </p>
        {(schedule.startTime || schedule.description) && (
          <div className="mt-0.5 space-y-0.5">
            {schedule.startTime && (
              <p className="text-xs text-gray-500">
                {schedule.startTime}{schedule.endTime ? ` ~ ${schedule.endTime}` : ''}
                {schedule.alarm && <span className="ml-1.5">⏰ {schedule.alarm}</span>}
              </p>
            )}
            {schedule.description && <p className="text-xs text-gray-500 truncate">{schedule.description}</p>}
          </div>
        )}
      </div>
      <div className="flex gap-1 flex-shrink-0">
        <button onClick={() => onEdit(schedule)} className="p-1 text-gray-400 hover:text-gray-600 text-xs">✏️</button>
        <button onClick={() => onDelete(schedule.id)} className="p-1 text-gray-400 hover:text-red-500 text-xs">🗑️</button>
      </div>
    </div>
  );
}
