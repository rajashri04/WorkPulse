import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, LayoutGrid, Layers } from 'lucide-react';

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
  defaultViewMode?: 'deck' | 'grid';
}

export const SwipableQuotaDeck: React.FC<SwipableQuotaDeckProps> = ({ 
  cards,
  defaultViewMode = 'deck'
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'deck' | 'grid'>(defaultViewMode);
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
      chipActive: 'bg-slate-900 text-white border-slate-900',
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white',
      badge: 'bg-indigo-500/20 text-indigo-200 border border-indigo-400/20',
      bar: 'bg-indigo-300',
      barTrack: 'bg-white/10',
      action: 'bg-indigo-500/30 hover:bg-indigo-500/40 text-white border border-indigo-400/30',
      iconBg: 'bg-indigo-500/20 text-indigo-200',
      subtext: 'text-indigo-200',
      chipActive: 'bg-indigo-700 text-white border-indigo-700',
    },
    amber: {
      bg: 'bg-gradient-to-br from-amber-950 via-amber-900 to-slate-900 text-white',
      badge: 'bg-amber-500/20 text-amber-200 border border-amber-400/20',
      bar: 'bg-amber-400',
      barTrack: 'bg-white/10',
      action: 'bg-amber-500/30 hover:bg-amber-500/40 text-white border border-amber-400/30',
      iconBg: 'bg-amber-500/20 text-amber-300',
      subtext: 'text-amber-200',
      chipActive: 'bg-amber-600 text-white border-amber-600',
    },
    rose: {
      bg: 'bg-gradient-to-br from-rose-950 via-rose-900 to-slate-900 text-white',
      badge: 'bg-rose-500/20 text-rose-200 border border-rose-400/20',
      bar: 'bg-rose-400',
      barTrack: 'bg-white/10',
      action: 'bg-rose-500/30 hover:bg-rose-500/40 text-white border border-rose-400/30',
      iconBg: 'bg-rose-500/20 text-rose-300',
      subtext: 'text-rose-200',
      chipActive: 'bg-rose-600 text-white border-rose-600',
    },
    teal: {
      bg: 'bg-gradient-to-br from-teal-950 via-teal-900 to-slate-900 text-white',
      badge: 'bg-teal-500/20 text-teal-200 border border-teal-400/20',
      bar: 'bg-teal-400',
      barTrack: 'bg-white/10',
      action: 'bg-teal-500/30 hover:bg-teal-500/40 text-white border border-teal-400/30',
      iconBg: 'bg-teal-500/20 text-teal-300',
      subtext: 'text-teal-200',
      chipActive: 'bg-teal-700 text-white border-teal-700',
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 text-white',
      badge: 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/20',
      bar: 'bg-emerald-400',
      barTrack: 'bg-white/10',
      action: 'bg-emerald-500/30 hover:bg-emerald-500/40 text-white border border-emerald-400/30',
      iconBg: 'bg-emerald-500/20 text-emerald-300',
      subtext: 'text-emerald-200',
      chipActive: 'bg-emerald-700 text-white border-emerald-700',
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
    const threshold = 35; // minimum 35px swipe
    if (diff > threshold) {
      handleNext();
    } else if (diff < -threshold) {
      handlePrev();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Render Single Card Item
  const renderCardContent = (card: QuotaCardItem) => {
    const t = themeStyles[card.theme];

    return (
      <div
        className={`w-full rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden flex flex-col justify-between ${t.bg}`}
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
          <div className="flex items-baseline gap-1.5 flex-wrap">
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

          <p className={`text-[11px] mt-1.5 ${t.subtext}`}>
            {card.caption}
          </p>
        </div>

        {/* Bottom Action Button (if present) */}
        {card.actionLabel && card.onAction && (
          <div className="pt-2 relative z-10">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                card.onAction?.();
              }}
              className={`w-full py-2 px-3 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs ${t.action}`}
            >
              <span>{card.actionLabel}</span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full select-none">
      {/* 1. Quick Selector Chips (makes ALL cards immediately visible & selectable) */}
      <div className="flex items-center justify-between gap-2 mb-2.5 overflow-x-auto pb-1 no-scrollbar">
        <div className="flex items-center gap-1.5 shrink-0">
          {cards.map((card, idx) => {
            const isActive = activeIndex === idx && viewMode === 'deck';
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => {
                  setActiveIndex(idx);
                  setViewMode('deck');
                }}
                className={`px-2.5 py-1 text-xs rounded-xl border transition-all flex items-center gap-1.5 shrink-0 ${
                  isActive
                    ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                }`}
              >
                <span>{card.title}</span>
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {card.mainValue}
                </span>
              </button>
            );
          })}
        </div>

        {/* Layout Toggle: Swipe Deck vs View All Grid */}
        <div className="flex items-center gap-1 shrink-0 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setViewMode('deck')}
            title="Swipe Card View"
            className={`p-1 rounded-md transition-colors ${
              viewMode === 'deck' 
                ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            title="View All Cards Grid"
            className={`p-1 rounded-md transition-colors ${
              viewMode === 'grid' 
                ? 'bg-white text-slate-900 shadow-2xs font-bold' 
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2A. SWIPE DECK MODE */}
      {viewMode === 'deck' ? (
        <div className="w-full">
          {/* Deck Slider Container with Arrows */}
          <div className="relative group">
            {/* The Swipable Container */}
            <div
              className="w-full overflow-hidden rounded-2xl touch-pan-y"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <div
                className="flex transition-transform duration-300 ease-out w-full"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {cards.map((card) => (
                  <div
                    key={card.id}
                    className="w-full shrink-0 basis-full box-border"
                  >
                    {renderCardContent(card)}
                  </div>
                ))}
              </div>
            </div>

            {/* Left / Right Arrow Controls */}
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous card"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-opacity shadow-md z-20"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next card"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-xs transition-opacity shadow-md z-20"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

          {/* Bottom Dot Indicators & Swipe Hint */}
          <div className="flex items-center justify-between mt-2 px-1 text-xs text-slate-500">
            <span className="text-[11px] text-slate-400">
              Swipe left/right or tap chips above
            </span>

            <div className="flex items-center gap-1.5">
              {cards.map((card, idx) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActiveIndex(idx)}
                  className={`transition-all rounded-full ${
                    activeIndex === idx
                      ? 'w-6 h-1.5 bg-slate-900'
                      : 'w-1.5 h-1.5 bg-slate-300 hover:bg-slate-400'
                  }`}
                  aria-label={`Jump to ${card.title}`}
                />
              ))}
            </div>

            <span className="font-mono tabular-nums text-[11px] text-slate-500">
              {activeIndex + 1} / {cards.length}
            </span>
          </div>
        </div>
      ) : (
        /* 2B. ALL CARDS GRID MODE (100% visible simultaneously) */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {cards.map((card) => (
            <div key={card.id} className="w-full">
              {renderCardContent(card)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
