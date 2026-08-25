import { useMemo, useState } from 'react';
import { useTips } from './hooks/useTips';
import type { Tip, TipInput } from './types';
import Modal from './components/Modal';
import TipCard from './components/TipCard';
import TipForm from './components/TipForm';
import Hero from './components/Hero';
import { getCategoryEmoji } from './data/categoryMeta';

const ALL = '전체';

export default function App() {
  const { tips, categories, addTip, updateTip, deleteTip, resetToDefaults } = useTips();
  const [activeCategory, setActiveCategory] = useState(ALL);
  const [query, setQuery] = useState('');
  const [editingTip, setEditingTip] = useState<Tip | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filteredTips = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tips.filter(tip => {
      const matchesCategory = activeCategory === ALL || tip.category === activeCategory;
      const matchesQuery =
        !q || tip.title.toLowerCase().includes(q) || tip.content.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [tips, activeCategory, query]);

  const handleSubmit = (input: TipInput) => {
    if (editingTip) {
      updateTip(editingTip.id, input);
    } else {
      addTip(input);
    }
    setShowForm(false);
    setEditingTip(null);
  };

  const handleDelete = (tip: Tip) => {
    if (window.confirm(`'${tip.title}' 팁을 삭제할까요?`)) {
      deleteTip(tip.id);
    }
  };

  const handleResetToDefaults = () => {
    if (window.confirm('내가 추가/수정한 내용을 모두 지우고 기본 내용으로 되돌릴까요?')) {
      resetToDefaults();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <Hero />
        <div className="max-w-2xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-blue-700">🎓 서울대 대학원 생활 가이드</h1>
          <p className="text-xs text-gray-500 mt-0.5">신입생을 위한 수강신청·연구·학교생활 팁 모음</p>
        </div>
        <div className="max-w-2xl mx-auto px-4 pb-3">
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="🔍 팁 검색 (예: 셔틀버스, 통계, 도서관)"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <nav className="max-w-2xl mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {[ALL, ...categories].map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === ALL ? '🗂️' : getCategoryEmoji(cat)} {cat}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-4">
        {filteredTips.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">해당하는 팁이 없어요.</p>
        ) : (
          <div className="space-y-3">
            {filteredTips.map(tip => (
              <TipCard
                key={tip.id}
                tip={tip}
                onEdit={() => {
                  setEditingTip(tip);
                  setShowForm(true);
                }}
                onDelete={() => handleDelete(tip)}
              />
            ))}
          </div>
        )}

        <div className="text-center mt-6">
          <button onClick={handleResetToDefaults} className="text-xs text-gray-400 hover:text-gray-600">
            기본 내용으로 초기화
          </button>
        </div>
      </main>

      <button
        onClick={() => {
          setEditingTip(null);
          setShowForm(true);
        }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-blue-600 text-white text-2xl shadow-lg hover:bg-blue-700 flex items-center justify-center z-40"
        aria-label="팁 추가"
      >
        +
      </button>

      {showForm && (
        <Modal
          title={editingTip ? '팁 수정' : '새 팁 추가'}
          onClose={() => {
            setShowForm(false);
            setEditingTip(null);
          }}
        >
          <TipForm
            categories={categories}
            initialTip={editingTip ?? undefined}
            onSubmit={handleSubmit}
            onClose={() => {
              setShowForm(false);
              setEditingTip(null);
            }}
          />
        </Modal>
      )}
    </div>
  );
}
