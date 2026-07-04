/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  X, 
  ArrowRight, 
  CalendarDays,
  Tag
} from 'lucide-react';
import { Event } from '../types';
import { BrutalistBadge, SharpButton } from './BrutalistUI';

interface EventCalendarProps {
  events: Event[];
  onSelectEvent: (event: Event) => void;
}

export default function EventCalendar({ events, onSelectEvent }: EventCalendarProps) {
  // Find initial month based on available events or fallback to current month
  const getInitialDate = () => {
    if (events && events.length > 0) {
      // Find the earliest active event
      const sorted = [...events]
        .filter(e => e.status === 'active')
        .sort((a, b) => a.date.localeCompare(b.date));
      if (sorted.length > 0) {
        const parts = sorted[0].date.split('-');
        if (parts.length === 3) {
          return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, 1);
        }
      }
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  };

  const [viewDate, setViewDate] = useState<Date>(new Date(2026, 6, 1)); // Default to July 2026
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(null);

  // Sync initial date when events are loaded
  useEffect(() => {
    if (events && events.length > 0) {
      setViewDate(getInitialDate());
    }
  }, [events]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth(); // 0-indexed

  // Month labels
  const MONTH_NAMES = [
    'JANUARY', 'FEBRUARY', 'MARCH', 'APRIL', 'MAY', 'JUNE',
    'JULY', 'AUGUST', 'SEPTEMBER', 'OCTOBER', 'NOVEMBER', 'DECEMBER'
  ];

  const DAYS_OF_WEEK = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  // Calculate grid metrics
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday, 1 = Monday...
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevTotalDays = new Date(year, month, 0).getDate();

  // Handle month navigation
  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  // Check how many events occur on a given formatted date (YYYY-MM-DD)
  const getEventsForDate = (dateStr: string) => {
    return events.filter(e => e.date === dateStr && e.status === 'active');
  };

  // Format a helper string like "2026-07-04"
  const formatDateString = (dayNum: number) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  // Helper to format nice readable date string for headings
  const getReadableDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    const y = parts[0];
    const mIdx = parseInt(parts[1]) - 1;
    const d = parseInt(parts[2]);
    return `${MONTH_NAMES[mIdx]} ${d}, ${y}`;
  };

  // Generate calendar cells (42 cells to fit a perfect 6-week layout)
  const cells: { dayNum: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Previous month padding days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const dayVal = prevTotalDays - i;
    const prevMonthIdx = month === 0 ? 11 : month - 1;
    const prevYearVal = month === 0 ? year - 1 : year;
    const mm = String(prevMonthIdx + 1).padStart(2, '0');
    const dd = String(dayVal).padStart(2, '0');
    cells.push({
      dayNum: dayVal,
      dateStr: `${prevYearVal}-${mm}-${dd}`,
      isCurrentMonth: false,
    });
  }

  // Current month days
  for (let i = 1; i <= totalDays; i++) {
    cells.push({
      dayNum: i,
      dateStr: formatDateString(i),
      isCurrentMonth: true,
    });
  }

  // Next month padding days
  const remainingCells = 42 - cells.length;
  for (let i = 1; i <= remainingCells; i++) {
    const nextMonthIdx = month === 11 ? 0 : month + 1;
    const nextYearVal = month === 11 ? year + 1 : year;
    const mm = String(nextMonthIdx + 1).padStart(2, '0');
    const dd = String(i).padStart(2, '0');
    cells.push({
      dayNum: i,
      dateStr: `${nextYearVal}-${mm}-${dd}`,
      isCurrentMonth: false,
    });
  }

  // Filter events of selectedDateStr or show all events in the selected month if no date selected
  const activeEventsInMonth = events.filter(e => {
    if (!e.date) return false;
    const parts = e.date.split('-');
    if (parts.length !== 3) return false;
    return parseInt(parts[0]) === year && parseInt(parts[1]) === (month + 1) && e.status === 'active';
  });

  const displayedEvents = selectedDateStr 
    ? getEventsForDate(selectedDateStr) 
    : activeEventsInMonth;

  // Format currency
  const formatPrice = (usdPrice: number) => {
    if (usdPrice === 0) return 'FREE';
    return `$${usdPrice.toFixed(2)}`;
  };

  return (
    <div id="event-calendar-container" className="bg-[#1A1A1A] border-4 border-black p-6 md:p-8 text-white shadow-[10px_10px_0px_rgba(240,75,35,0.2)]">
      {/* Calendar Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-white/10 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <BrutalistBadge variant="primary">INTERACTIVE ENGINE</BrutalistBadge>
            <span className="font-mono-custom text-[10px] text-[#F04B23] font-bold uppercase tracking-widest flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5" /> SCHEDULER MATRIX
            </span>
          </div>
          <h2 className="font-sans font-black text-4xl uppercase tracking-wider text-white">
            EVENT CALENDAR
          </h2>
          <p className="text-xs text-gray-400 font-medium italic mt-1">
            Browse upcoming university symposiums, code sprints, and gaming battles directly inside our live grid.
          </p>
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 bg-black border-2 border-white/15 p-2 w-full lg:w-auto justify-between lg:justify-start">
          <button 
            onClick={handlePrevMonth}
            className="w-10 h-10 bg-[#1A1A1A] border-2 border-black hover:bg-[#F04B23] hover:text-black flex items-center justify-center cursor-pointer transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="w-5 h-5 font-bold" />
          </button>
          
          <div className="font-mono-custom text-sm font-black tracking-widest uppercase px-4 text-center min-w-[150px]">
            {MONTH_NAMES[month]} {year}
          </div>

          <button 
            onClick={handleNextMonth}
            className="w-10 h-10 bg-[#1A1A1A] border-2 border-black hover:bg-[#F04B23] hover:text-black flex items-center justify-center cursor-pointer transition-colors"
            title="Next Month"
          >
            <ChevronRight className="w-5 h-5 font-bold" />
          </button>
        </div>
      </div>

      {/* Grid + Event Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Calendar Grid (7 Cols on large screen) */}
        <div className="lg:col-span-7 flex flex-col">
          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1.5 mb-1.5 text-center">
            {DAYS_OF_WEEK.map((day) => (
              <div 
                key={day} 
                className="bg-black text-gray-400 border border-white/10 py-2.5 font-mono-custom text-[10px] font-black tracking-wider uppercase"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Day Cells Grid */}
          <div className="grid grid-cols-7 gap-1.5">
            {cells.map((cell, idx) => {
              const dayEvents = getEventsForDate(cell.dateStr);
              const hasEvents = dayEvents.length > 0;
              const isSelected = selectedDateStr === cell.dateStr;

              // Grid cell custom color styles
              let cellBg = 'bg-black/40 hover:bg-black/60 border border-white/5';
              let textStyle = 'text-gray-500 font-bold';

              if (cell.isCurrentMonth) {
                textStyle = 'text-white font-black';
                if (hasEvents) {
                  cellBg = isSelected 
                    ? 'bg-[#F04B23] text-black border-2 border-white' 
                    : 'bg-[#F59E0B]/25 hover:bg-[#F59E0B]/40 border-2 border-[#F59E0B]';
                } else {
                  cellBg = isSelected 
                    ? 'bg-white text-black border-2 border-black' 
                    : 'bg-[#1E1E1F] hover:bg-black border border-white/10';
                }
              } else {
                // Out of month days
                if (isSelected) {
                  cellBg = 'bg-white/10 border-2 border-dashed border-white/30 text-white';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => {
                    // Toggle selected date
                    if (selectedDateStr === cell.dateStr) {
                      setSelectedDateStr(null);
                    } else {
                      setSelectedDateStr(cell.dateStr);
                    }
                  }}
                  className={`relative aspect-square p-2 flex flex-col justify-between items-start transition-all cursor-pointer rounded-none group ${cellBg}`}
                >
                  {/* Day Number */}
                  <span className={`text-xs font-mono-custom leading-none ${textStyle} ${isSelected && cell.isCurrentMonth ? 'text-black' : ''}`}>
                    {cell.dayNum}
                  </span>

                  {/* Indicators / Badge on Cell */}
                  {hasEvents && cell.isCurrentMonth && (
                    <div className="w-full flex justify-end items-end">
                      <span className={`text-[8px] font-mono-custom px-1 py-0.5 font-black border uppercase tracking-wider ${
                        isSelected 
                          ? 'bg-black text-white border-black' 
                          : 'bg-[#F04B23] text-black border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]'
                      }`}>
                        {dayEvents.length} {dayEvents.length === 1 ? 'MEET' : 'MEETS'}
                      </span>
                    </div>
                  )}

                  {/* Tiny background outline on hover */}
                  <div className="absolute inset-0 border-2 border-[#F04B23] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity" />
                </button>
              );
            })}
          </div>

          {/* Quick legend */}
          <div className="flex flex-wrap gap-4 items-center mt-4 text-[10px] font-mono-custom uppercase tracking-wider text-gray-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#F59E0B]/25 border-2 border-[#F59E0B] inline-block" />
              Scheduled Events
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#F04B23] inline-block" />
              Active Target Match
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3.5 h-3.5 bg-[#1E1E1F] border border-white/10 inline-block" />
              Empty Slots
            </span>
          </div>
        </div>

        {/* Right Side: Day Details/Upcoming Sessions Feed (5 Cols) */}
        <div className="lg:col-span-5 bg-black/60 border-2 border-white/10 p-5 flex flex-col justify-between text-white relative">
          <div>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono-custom font-black uppercase text-[#F04B23] tracking-widest block mb-1">
                  [SESSIONS SCHEDULE]
                </span>
                <h3 className="text-lg font-sans font-black uppercase tracking-wide">
                  {selectedDateStr ? getReadableDate(selectedDateStr) : 'ALL SESSIONS THIS MONTH'}
                </h3>
              </div>

              {selectedDateStr && (
                <button
                  onClick={() => setSelectedDateStr(null)}
                  className="flex items-center gap-1 bg-[#1A1A1A] hover:bg-[#F04B23] hover:text-black border border-white/20 p-1 px-2 font-mono-custom text-[9px] font-black uppercase tracking-wider transition-colors cursor-pointer"
                  title="Show all this month"
                >
                  <X className="w-3 h-3" /> CLEAR
                </button>
              )}
            </div>

            {/* List of active events */}
            {displayedEvents.length > 0 ? (
              <div className="flex flex-col gap-4 max-h-[360px] overflow-y-auto pr-1">
                {displayedEvents.map((evt) => (
                  <div 
                    key={evt.id}
                    className="bg-[#1A1A1A] hover:bg-[#222223] border-2 border-white/10 p-4 transition-all flex flex-col justify-between hover:border-white/30"
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-2">
                        <span className="bg-[#F04B23]/10 text-[#F04B23] border border-[#F04B23]/25 px-2 py-0.5 text-[9px] font-mono-custom font-black uppercase tracking-widest">
                          {evt.category}
                        </span>
                        <span className="text-[10px] font-mono-custom text-gray-400 font-bold">
                          🕒 {evt.time}
                        </span>
                      </div>

                      <h4 className="font-sans uppercase font-black text-sm text-white hover:text-[#F04B23] transition-colors leading-tight mb-2">
                        {evt.title}
                      </h4>
                      
                      <p className="text-[11px] text-gray-400 italic line-clamp-2 leading-relaxed mb-3">
                        {evt.description}
                      </p>
                    </div>

                    <div className="border-t border-white/5 pt-3 mt-1 flex justify-between items-center">
                      <span className="font-mono-custom font-black text-[#F04B23] text-xs">
                        {formatPrice(evt.price)}
                      </span>
                      <button
                        onClick={() => onSelectEvent(evt)}
                        className="bg-black hover:bg-white hover:text-black text-white text-[9px] font-mono-custom font-black px-2.5 py-1.5 uppercase tracking-widest border border-white/10 hover:border-black flex items-center gap-1 transition-all"
                      >
                        ACQUIRE PASS <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 px-4 bg-[#1E1E1F] border border-dashed border-white/10 text-gray-500 font-mono-custom uppercase tracking-wider text-xs">
                <CalendarDays className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                {selectedDateStr 
                  ? 'No sprints or expos scheduled on this date.' 
                  : `No active meetups configured for ${MONTH_NAMES[month]} yet.`}
                <div className="mt-3 text-[10px] text-gray-400 font-bold italic leading-snug">
                  * Select another highlighted cell or clear filters to view remaining workshops!
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-white/10 pt-4 mt-6 text-[10px] font-mono-custom text-gray-500 font-bold flex justify-between uppercase">
            <span>🚀 TOTAL SESSIONS IN MONTH: {activeEventsInMonth.length}</span>
            <span>📍 VENUES: {Array.from(new Set(activeEventsInMonth.map(e => e.venue))).length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
