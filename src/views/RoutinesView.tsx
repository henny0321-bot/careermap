import { useState } from 'react';
import type { Routine } from '../types';
import type { Store } from '../store/useStore';
import Modal from '../components/Modal';
import RoutineForm from '../components/RoutineForm';

interface Props {
  store: Store;
}

const REPEAT_LABELS: Record<string, string> = {
  daily: '매일',
  weekday: '평일 (월~금)',
  weekend: '주말 (토~일)',
  weekly: '특정 요일',
};

const DAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export default function RoutinesView({ store }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Routine | null>(null);

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

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800">루틴 관리</h2>
          <p className="text-xs text-gray-400 mt-0.5">반복 루틴을 설정하면 자동으로 일정에 표시됩니다</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="px-4 py-2 bg-indigo-500 text-white rounded-xl text-sm font-medium hover:bg-indigo-600"
        >
          + 루틴 추가
        </button>
      </div>

      {store.routines.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-3">🔄</p>
          <p className="text-sm font-medium">루틴이 없습니다</p>
          <p className="text-xs mt-1">매일 반복되는 루틴을 등록해보세요</p>
        </div>
      ) : (
        <div className="space-y-3">
          {store.routines.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="w-3 h-3 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: r.color }} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800">{r.title}</p>
                  {r.description && <p className="text-xs text-gray-500 mt-0.5">{r.description}</p>}
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      🔄 {REPEAT_LABELS[r.repeatType]}
                      {r.repeatType === 'weekly' && r.repeatDays && r.repeatDays.length > 0 && (
                        <span>: {r.repeatDays.sort().map(d => DAY_LABELS[d]).join(', ')}</span>
                      )}
                    </span>
                    {r.time && (
                      <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                        ⏰ {r.time}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setEditing(r); setShowForm(true); }}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
