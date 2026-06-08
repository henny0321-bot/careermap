import { COLORS } from '../types';

interface Props {
  value: string;
  onChange: (color: string) => void;
}

export default function ColorPicker({ value, onChange }: Props) {
  return (
    <div className="flex gap-2 flex-wrap">
      {COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="w-8 h-8 rounded-full transition-all hover:scale-110 shadow-sm"
          style={{
            backgroundColor: c,
            outline: value === c ? '2.5px solid #6b7280' : '2.5px solid transparent',
            outlineOffset: '2px',
          }}
        />
      ))}
    </div>
  );
}
