'use client';

// ─── DuelStatusBadge — status pill for any duel state ───────────

interface DuelStatusBadgeProps {
  label: string;
  color: 'purple' | 'gold' | 'green' | 'red' | 'grey';
  size?: 'sm' | 'md';
  pulse?: boolean;
}

export default function DuelStatusBadge({
  label,
  color,
  size = 'sm',
  pulse = false,
}: DuelStatusBadgeProps) {
  const colorMap = {
    purple: 'bg-[#eddcff] text-[#4a148c] border-[#4a148c]/10',
    gold:   'bg-[#ffe088]/40 text-[#735c00] border-[#cba72f]/20',
    green:  'bg-emerald-50 text-emerald-700 border-emerald-200',
    red:    'bg-red-50 text-red-600 border-red-200',
    grey:   'bg-[#f5f3f7] text-[#7c7483] border-[#1b1b1e]/5',
  };

  const sizeMap = {
    sm: 'text-[9px] px-2.5 py-1',
    md: 'text-[11px] px-3 py-1.5',
  };

  const dotColorMap = {
    purple: 'bg-[#4a148c]',
    gold:   'bg-[#cba72f]',
    green:  'bg-emerald-500',
    red:    'bg-red-500',
    grey:   'bg-[#cdc3d4]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-black uppercase tracking-widest ${colorMap[color]} ${sizeMap[size]}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColorMap[color]} ${
          pulse ? 'animate-pulse' : ''
        }`}
      />
      {label}
    </span>
  );
}
