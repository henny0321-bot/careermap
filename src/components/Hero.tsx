export default function Hero() {
  return (
    <svg
      viewBox="0 0 400 110"
      className="w-full h-24 sm:h-28"
      role="img"
      aria-label="관악산과 서울대학교 캠퍼스 일러스트"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#dbeafe" />
          <stop offset="100%" stopColor="#eff6ff" />
        </linearGradient>
      </defs>
      <rect width="400" height="110" fill="url(#sky)" />
      <circle cx="345" cy="28" r="16" fill="#fde68a" opacity="0.9" />
      {/* 관악산 능선 */}
      <path d="M0 78 L55 40 L95 62 L150 24 L210 66 L260 46 L320 70 L400 50 L400 110 L0 110 Z" fill="#93c5fd" opacity="0.55" />
      <path d="M0 92 L60 66 L120 84 L180 54 L240 86 L300 62 L400 88 L400 110 L0 110 Z" fill="#3b82f6" opacity="0.85" />
      {/* 캠퍼스 건물 실루엣 */}
      <g fill="#1d4ed8">
        <rect x="150" y="70" width="14" height="24" />
        <rect x="167" y="60" width="14" height="34" />
        <rect x="184" y="74" width="14" height="20" />
        <polygon points="174,52 190,60 158,60" />
      </g>
      {/* 학사모 */}
      <g transform="translate(230,18)">
        <polygon points="0,6 22,0 44,6 22,12" fill="#1e3a8a" />
        <rect x="10" y="6" width="24" height="7" rx="1" fill="#1e40af" />
        <line x1="34" y1="8" x2="40" y2="24" stroke="#1e3a8a" strokeWidth="1.5" />
        <circle cx="40" cy="26" r="2.5" fill="#f59e0b" />
      </g>
    </svg>
  );
}
