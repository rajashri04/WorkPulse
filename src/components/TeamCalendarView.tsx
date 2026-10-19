import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Department, AttendanceRequest } from '../types';
import { 
  generateMonthCalendar, 
  TODAY_DATE, 
  formatDisplayDate, 
  isDateInRange,
  CalendarDay 
} from '../utils/dateUtils';
import { Avatar } from './Avatar';
import { RequestDetailModal } from './RequestDetailModal';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  Filter, 
  Home, 
  Briefcase, 
  X, 
  UserCheck 
} from 'lucide-react';

export const TeamCalendarView: React.FC = () => {
  const { requests, employees, getDatePresence } = useAttendance();
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // 0-indexed: 9 = October
  const [selectedDepartment, setSelectedDepartment] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LEAVE' | 'WFH'>('ALL');
  
  // Day drilldown modal
  const [selectedDayModal, setSelectedDayModal] = useState<CalendarDay | null>(null);
  const [inspectedRequest, setInspectedRequest] = useState<AttendanceRequest | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIndex(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    setCurrentYear(2026);
    setCurrentMonthIndex(9); // October
  };

  const calendarDays = generateMonthCalendar(currentYear, currentMonthIndex);

  // Filter approved requests
  const approvedRequests = requests.filter(req => {
    if (req.status !== 'APPROVED') return false;
    if (selectedDepartment !== 'ALL' && req.department !== selectedDepartment) return false;
    if (typeFilter !== 'ALL' && req.type !== typeFilter) return false;
    return true;
  });

  const getEventsForDay = (dateStr: string) => {
    return approvedRequests.filter(req => 
      isDateInRange(dateStr, req.startDate, req.endDate)
    );
  };

  // Day drilldown presence records
  const dayRoster = selectedDayModal ? getDatePresence(selectedDayModal.dateString) : [];
  const filteredDayRoster = selectedDayModal ? dayRoster.filter(r => {
    if (selectedDepartment !== 'ALL' && r.employee.department !== selectedDepartment) return false;
    return true;
  }) : [];

  return (
    <div className="space-y-6">
      {/* Calendar Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Team Presence Calendar
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Month-level schedule tracking for leaves, holidays, and work from home rosters across all teams.
          </p>
        </div>

        {/* Month Navigation & Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleJumpToToday}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            Today
          </button>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-900 px-3 min-w-[140px] text-center">
              {monthNames[currentMonthIndex]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Legend Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-500 font-medium mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Department:
            </span>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-2.5 py-1 text-xs border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
            >
              <option value="ALL">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Design & UX">Design & UX</option>
              <option value="Product">Product</option>
              <option value="Marketing">Marketing</option>
              <option value="Human Resources">Human Resources</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          {/* Type Segmented Filter */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg text-xs ml-2">
            <button
              onClick={() => setTypeFilter('ALL')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                typeFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('WFH')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                typeFilter === 'WFH'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              WFH Only
            </button>
            <button
              onClick={() => setTypeFilter('LEAVE')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                typeFilter === 'LEAVE'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Leaves Only
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500"></span>
            <span>Work From Home</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
            <span>Vacation / Leave</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
            <span>Sick / Medical</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-slate-500 text-xs font-semibold text-center">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((dayName, idx) => (
            <div 
              key={dayName} 
              className={`py-2.5 border-r border-slate-200 last:border-r-0 ${
                idx === 0 || idx === 6 ? 'text-slate-400 bg-slate-100/50' : ''
              }`}
            >
              {dayName}
            </div>
          ))}
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-200">
          {calendarDays.map((calDay) => {
            const dayEvents = getEventsForDay(calDay.dateString);
            const isToday = calDay.isToday;

            return (
              <div
                key={calDay.dateString}
                onClick={() => setSelectedDayModal(calDay)}
                className={`min-h-[110px] p-1.5 flex flex-col justify-between cursor-pointer transition-colors ${
                  !calDay.isCurrentMonth
                    ? 'bg-slate-50/50 text-slate-300'
                    : calDay.isWeekend
                    ? 'bg-slate-50/30 text-slate-600'
                    : 'bg-white hover:bg-slate-50/80 text-slate-900'
                }`}
              >
                {/* Day Header */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center text-xs font-mono tabular-nums font-semibold rounded-full w-6 h-6 ${
                      isToday
                        ? 'bg-slate-900 text-white'
                        : calDay.isCurrentMonth
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {calDay.dayNumber}
                  </span>

                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-medium text-slate-500">
                      {dayEvents.length} scheduled
                    </span>
                  )}
                </div>

                {/* Event Tags inside the cell */}
                <div className="mt-1 space-y-1 overflow-y-auto max-h-[68px]">
                  {dayEvents.slice(0, 3).map((event) => {
                    const isWfh = event.type === 'WFH';
                    const isSick = event.leaveCategory === 'SICK';

                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedRequest(event);
                        }}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 transition-opacity hover:opacity-85 ${
                          isWfh
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : isSick
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                        title={`${event.employeeName}: ${event.type === 'WFH' ? 'WFH' : event.leaveCategory || 'Leave'}`}
                      >
                        {isWfh ? (
                          <Home className="w-2.5 h-2.5 shrink-0" />
                        ) : (
                          <Briefcase className="w-2.5 h-2.5 shrink-0" />
                        )}
                        <span className="truncate">
                          {event.employeeName.split(' ')[0]} ({isWfh ? 'WFH' : isSick ? 'Sick' : 'Leave'})
                        </span>
                      </div>
                    );
                  })}

                  {dayEvents.length > 3 && (
                    <div className="text-[9px] text-slate-500 font-medium text-center py-0.5">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Day Inspection Modal (Drill-down on any date) */}
      {selectedDayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div 
            className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]"
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {formatDisplayDate(selectedDayModal.dateString)}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Daily Presence Roster Breakdown
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDayModal(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List of employees on this day */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1 text-xs">
              <div className="grid grid-cols-3 gap-2 pb-2 text-center">
                <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="font-semibold text-emerald-800 text-sm font-mono tabular-nums">
                    {filteredDayRoster.filter(r => r.status === 'IN_OFFICE').length}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-medium">In Office</div>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                  <div className="font-semibold text-indigo-800 text-sm font-mono tabular-nums">
                    {filteredDayRoster.filter(r => r.status === 'WFH').length}
                  </div>
                  <div className="text-[10px] text-indigo-600 font-medium">Remote (WFH)</div>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="font-semibold text-amber-800 text-sm font-mono tabular-nums">
                    {filteredDayRoster.filter(r => r.status === 'ON_LEAVE').length}
                  </div>
                  <div className="text-[10px] text-amber-600 font-medium">On Leave</div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {filteredDayRoster.map(item => (
                  <div 
                    key={item.employee.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Avatar src={item.employee.avatar} name={item.employee.name} size="sm" />
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate">
                          {item.employee.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {item.employee.department} · {item.employee.role}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 ml-3">
                      {item.status === 'IN_OFFICE' && (
                        <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          In Office
                        </span>
                      )}
                      {item.status === 'WFH' && (
                        <span className="text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                          {item.categoryLabel || 'WFH'}
                        </span>
                      )}
                      {item.status === 'ON_LEAVE' && (
                        <span className="text-[11px] font-medium text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {item.categoryLabel || 'On Leave'}
                        </span>
                      )}

                      {item.request && (
                        <button
                          onClick={() => {
                            setInspectedRequest(item.request!);
                          }}
                          className="block text-[10px] text-slate-500 hover:text-indigo-600 hover:underline mt-0.5"
                        >
                          View Details
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setSelectedDayModal(null)}
                className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Request Detail Modal */}
      <RequestDetailModal
        request={inspectedRequest}
        isOpen={Boolean(inspectedRequest)}
        onClose={() => setInspectedRequest(null)}
      />
    </div>
  );
};
