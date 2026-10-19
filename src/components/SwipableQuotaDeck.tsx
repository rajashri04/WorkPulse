import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface QuotaCardItem {
  id: string;
  title: string;
  subtitle?: string;
  badge?: string;
  mainValue: string | number;
  totalValue?: string | number;
  unit?: string;
  progressPercent?: number;
  caption: string;
  icon: React.ReactNode;
  theme: 'slate' | 'indigo' | 'amber' | 'rose' | 'teal' | 'emerald';
  actionLabel?: string;
  onAction?: () => void;
}

interface SwipableQuotaDeckProps {
  cards: QuotaCardItem[];
}

export const SwipableQuotaDeck: React.FC<SwipableQuotaDeckProps> = ({ cards }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const themeStyles = {
    slate: {
      bg: 'bg-gradient-to-br from-slate-900 to-slate-800 text-white',
      badge: 'bg-white/10 text-slate-200 border border-white/10',
      bar: 'bg-indigo-400',
      barTrack: 'bg-white/10',
      action: 'bg-white/15 hover:bg-white/25 text-white border border-white/20',
      iconBg: 'bg-white/10 text-indigo-300',
      subtext: 'text-slate-300',
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white',
      badge: 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/20',
      bar: 'bg-indigo-300',
      barTrack: 'bg-white/10',
      action: 'bg-indigo-500/30 hover:bg-indigo-500/40 text-white border border-indigo-400/30',
      iconBg: 'bg-indigo-500/20 text-indigo-200',
      subtext: 'text-indigo-200',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-950 via-amber-900 to-slate-900 text-white',
      badge: 'bg-amber-500/20 text-amber-200 border border-amber-400/20',
      bar: 'bg-amber-400',
      barTrack: 'bg-white/10',
      action: 'bg-amber-500/30 hover:bg-amber-500/40 text-white border border-amber-400/30',
      iconBg: 'bg-amber-500/20 text-amber-300',
      subtext: 'text-amber-200',
    },
    rose: {
      bg: 'bg-gradient-to-br from-rose-950 via-rose-900 to-slate-900 text-white',
      badge: 'bg-rose-500/20 text-rose-200 border border-rose-400/20',
      bar: 'bg-rose-400',
      barTrack: 'bg-white/10',
      action: 'bg-rose-500/30 hover:bg-rose-500/40 text-white border border-rose-400/30',
      iconBg: 'bg-rose-500/20 text-rose-300',
      subtext: 'text-rose-200',
    },
    teal: {
      bg: 'bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 text-white',
      badge: 'bg-teal-500/20 text-teal-200 border border-teal-400/20',
      bar: 'bg-teal-400',
      barTrack: 'bg-white/10',
      action: 'bg-teal-500/30 hover:bg-teal-500/40 text-white border border-teal-400/30',
      iconBg: 'bg-teal-500/20 text-teal-300',
      subtext: 'text-teal-200',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white',
      badge: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/20',
      bar: 'bg-emerald-400',
      barTrack: 'bg-white/10',
      action: 'bg-emerald-500/30 hover:bg-emerald-500/40 text-white border border-emerald-400/30',
      iconBg: 'bg-emerald-500/20 text-emerald-300',
      subtext: 'text-emerald-200',
    },
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : cards.length - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev < cards.length - 1 ? prev + 1 : 0));
  };

  // Touch Swipe Handlers
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40; // minimum 40px swipe
    if (diff > threshold) {
      // Swiped Left -> Next Card
      handleNext();
    } else if (diff < -threshold) {
      // Swiped Right -> Prev Card
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div className="w-full">
      {/* Top Indicators & Controls */}
      <div className="flex items-center justify-between mb-2 px-0.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <span className="text-[10px] uppercase tracking-wider text-slate-400">
            Swipe Card
          </span>
          <span>·</span>
          <span className="font-mono tabular-nums text-slate-700">
            {activeIndex + 1} of {cards.length}
          </span>
        </div>

        {/* Navigation Dots and Arrow Controls */}
        <div className="flex items-center gap-2">
          {/* Pagination Indicators */}
          <div className="flex items-center gap-1">
            {cards.map((card, idx) => (
              <button
                key={card.id}
                onClick={() => setActiveIndex(idx)}
                className={`transition-all rounded-full ${
                  activeIndex === idx
                    ? 'w-5 h-1.5 bg-slate-900'
                    : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                }`}
                aria-label={`Jump to ${card.title}`}
              />
            ))}
          </div>

          {/* Left/Right Buttons */}
          <div className="flex items-center gap-1 ml-1">
            <button
              onClick={handlePrev}
              className="p-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
              aria-label="Previous card"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-2xs"
              aria-label="Next card"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 100% Fully Visible Animated Slider Container */}
      <div
        className="w-full overflow-hidden rounded-2xl touch-pan-y select-none"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="flex transition-transform duration-300 ease-out w-full"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {cards.map((card) => {
            const t = themeStyles[card.theme];

            return (
              <div
                key={card.id}
                className="w-full shrink-0 basis-full box-border"
              >
                <div
                  className={`w-full rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[168px] ${t.bg}`}
                >
                  {/* Subtle Background Glow Accent */}
                  <div className="absolute -right-8 -bottom-8 w-32 h-32 rounded-full bg-white/5 blur-xl pointer-events-none" />

                  {/* Top Row: Title, Badge, Icon */}
                  <div className="flex items-start justify-between gap-2 relative z-10">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-sm tracking-tight text-white truncate">
                          {card.title}
                        </span>
                        {card.badge && (
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${t.badge}`}>
                            {card.badge}
                          </span>
                        )}
                      </div>
                      {card.subtitle && (
                        <p className={`text-[11px] truncate ${t.subtext}`}>
                          {card.subtitle}
                        </p>
                      )}
                    </div>

                    <div className={`p-2 rounded-xl shrink-0 ${t.iconBg}`}>
                      {card.icon}
                    </div>
                  </div>

                  {/* Center: Numbers & Progress */}
                  <div className="my-2.5 relative z-10">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl sm:text-3xl font-extrabold font-mono tabular-nums tracking-tight text-white">
                        {card.mainValue}
                      </span>
                      {card.totalValue !== undefined && (
                        <span className={`text-xs font-semibold font-mono tabular-nums ${t.subtext}`}>
                          / {card.totalValue} {card.unit || 'days'}
                        </span>
                      )}
                    </div>

                    {card.progressPercent !== undefined && (
                      <div className={`w-full h-1.5 rounded-full mt-2 overflow-hidden ${t.barTrack}`}>
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${t.bar}`}
                          style={{ width: `${Math.min(100, Math.max(0, card.progressPercent))}%` }}
                        />
                      </div>
                    )}

                    <p className={`text-[11px] mt-1.5 line-clamp-1 ${t.subtext}`}>
                      {card.caption}
                    </p>
                  </div>

                  {/* Bottom Action Button (if present) */}
                  {card.actionLabel && card.onAction && (
                    <div className="pt-1 relative z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          card.onAction?.();
                        }}
                        className={`w-full py-1.5 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs ${t.action}`}
                      >
                        <span>{card.actionLabel}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
