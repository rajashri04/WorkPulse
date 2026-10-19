import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceRequest, RequestType, LeaveCategory, WfhCategory } from '../types';
import { formatDateRange, formatDisplayDate, calculateBusinessDays, TODAY_DATE } from '../utils/dateUtils';
import { RequestDetailModal } from './RequestDetailModal';
import { SwipableQuotaDeck, QuotaCardItem } from './SwipableQuotaDeck';
import { 
  Briefcase, 
  Home, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Zap, 
  Thermometer, 
  Palmtree, 
  AlertTriangle,
  UserCheck,
  Send,
  FileText,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Check
} from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { 
    currentUser, 
    requests, 
    employees, 
    applyRequest, 
    cancelRequest, 
    getDepartmentConflicts,
    employeeActiveTab: activeTab,
    setEmployeeActiveTab: setActiveTab
  } = useAttendance();

  const [selectedRequest, setSelectedRequest] = useState<AttendanceRequest | null>(null);

  // Filter states for requests below
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form states for inline application
  const [requestType, setRequestType] = useState<RequestType>('LEAVE');
  const [leaveCategory, setLeaveCategory] = useState<LeaveCategory>('ANNUAL');
  const [wfhCategory, setWfhCategory] = useState<WfhCategory>('FULL_DAY');
  const [startDate, setStartDate] = useState(TODAY_DATE);
  const [endDate, setEndDate] = useState(TODAY_DATE);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<'AM' | 'PM'>('AM');
  const [reason, setReason] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [handoverPersonId, setHandoverPersonId] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser?.phone || '');
  const [submissionFeedback, setSubmissionFeedback] = useState<{ success: boolean; message: string } | null>(null);

  if (!currentUser) return null;

  // Filter requests strictly for this employee
  const myRequests = requests.filter(r => r.employeeId === currentUser.id);
  const pendingCount = myRequests.filter(r => r.status === 'PENDING').length;
  const approvedCount = myRequests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = myRequests.filter(r => r.status === 'REJECTED').length;

  const filteredRequests = myRequests.filter(req => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchReason = req.reason.toLowerCase().includes(q);
      const matchType = req.type.toLowerCase().includes(q);
      const matchDates = `${req.startDate} ${req.endDate}`.includes(q);
      if (!matchReason && !matchType && !matchDates) return false;
    }
    return true;
  });

  const balances = currentUser.leaveBalances;
  const paidRemaining = balances.paidLeaveTotal - balances.paidLeaveUsed;
  const sickRemaining = balances.sickLeaveTotal - balances.sickLeaveUsed;
  const casualRemaining = balances.casualLeaveTotal - balances.casualLeaveUsed;
  const wfhRemaining = balances.wfhMonthlyAllowance - balances.wfhUsedThisMonth;

  const prefillApply = (type: RequestType, cat?: LeaveCategory) => {
    setRequestType(type);
    if (cat) setLeaveCategory(cat);
    setStartDate(TODAY_DATE);
    setEndDate(TODAY_DATE);
    setIsHalfDay(false);
    setActiveTab('APPLY');
  };

  // Swipable Quota Deck Data
  const quotaCards: QuotaCardItem[] = [
    {
      id: 'paid-vacation',
      title: 'Annual Vacation',
      subtitle: 'Paid Time Off',
      badge: 'Active Balance',
      mainValue: paidRemaining,
      totalValue: balances.paidLeaveTotal,
      unit: 'days left',
      progressPercent: (paidRemaining / balances.paidLeaveTotal) * 100,
      caption: `${balances.paidLeaveUsed} days utilized · Resets on Dec 31, 2026`,
      icon: <Palmtree className="w-5 h-5" />,
      theme: 'amber',
      actionLabel: '+ Apply Vacation Leave',
      onAction: () => prefillApply('LEAVE', 'ANNUAL'),
    },
    {
      id: 'wfh-allowance',
      title: 'Monthly WFH Quota',
      subtitle: 'Remote Work Schedule',
      badge: 'October 2026',
      mainValue: wfhRemaining,
      totalValue: balances.wfhMonthlyAllowance,
      unit: 'days left',
      progressPercent: (wfhRemaining / balances.wfhMonthlyAllowance) * 100,
      caption: `${balances.wfhUsedThisMonth} days utilized this month · Refreshes Nov 1`,
      icon: <Home className="w-5 h-5" />,
      theme: 'indigo',
      actionLabel: '+ Apply Work From Home',
      onAction: () => prefillApply('WFH'),
    },
    {
      id: 'sick-leave',
      title: 'Sick & Medical',
      subtitle: 'Health & Wellness',
      badge: 'Fully Covered',
      mainValue: sickRemaining,
      totalValue: balances.sickLeaveTotal,
      unit: 'days left',
      progressPercent: (sickRemaining / balances.sickLeaveTotal) * 100,
      caption: `${balances.sickLeaveUsed} days utilized · Doctor certificate required for > 2 days`,
      icon: <Thermometer className="w-5 h-5" />,
      theme: 'rose',
      actionLabel: '+ File Emergency Sick Leave',
      onAction: () => prefillApply('LEAVE', 'SICK'),
    },
    {
      id: 'casual-leave',
      title: 'Casual & Personal',
      subtitle: 'Short Notice Time Off',
      badge: 'Available',
      mainValue: casualRemaining,
      totalValue: balances.casualLeaveTotal,
      unit: 'days left',
      progressPercent: (casualRemaining / balances.casualLeaveTotal) * 100,
      caption: `${balances.casualLeaveUsed} days utilized this year`,
      icon: <Briefcase className="w-5 h-5" />,
      theme: 'teal',
      actionLabel: '+ Apply Casual Leave',
      onAction: () => prefillApply('LEAVE', 'CASUAL'),
    },
  ];

  const calculatedDays = calculateBusinessDays(startDate, isHalfDay ? startDate : endDate, isHalfDay);
  const conflicts = getDepartmentConflicts(startDate, isHalfDay ? startDate : endDate, currentUser.department);
  const otherConflicts = conflicts.filter(c => c.employeeId !== currentUser.id);
  const departmentColleagues = employees.filter(
    e => e.id !== currentUser.id && e.department === currentUser.department
  );

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setSubmissionFeedback({ success: false, message: 'Please provide a reason for your submission.' });
      return;
    }

    const res = applyRequest({
      type: requestType,
      leaveCategory: requestType === 'LEAVE' ? leaveCategory : undefined,
      wfhCategory: requestType === 'WFH' ? (isHalfDay ? (halfDayPeriod === 'AM' ? 'HALF_DAY_AM' : 'HALF_DAY_PM') : 'FULL_DAY') : undefined,
      startDate,
      endDate: isHalfDay ? startDate : endDate,
      isHalfDay,
      halfDayPeriod: isHalfDay ? halfDayPeriod : undefined,
      reason,
      deliverablesSummary: deliverables,
      handoverPersonId: handoverPersonId || undefined,
      emergencyPhone: emergencyPhone || undefined,
    });

    if (res.success) {
      setSubmissionFeedback({ success: true, message: 'Request submitted successfully! Awaiting manager approval.' });
      setReason('');
      setDeliverables('');
      setTimeout(() => {
        setSubmissionFeedback(null);
        setActiveTab('MY_REQUESTS');
      }, 1400);
    } else {
      setSubmissionFeedback({ success: false, message: res.message || 'Submission failed.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. UPPER SECTION: SWIPEABLE CARDS */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3 sm:p-5 shadow-2xs w-full overflow-hidden">
        {/* User Identity Kicker */}
        <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-slate-100">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{currentUser.name}</span>
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                Employee Portal
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {currentUser.role} · {currentUser.department}
            </p>
          </div>

          <button
            onClick={() => setActiveTab(activeTab === 'APPLY' ? 'MY_REQUESTS' : 'APPLY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 ${
              activeTab === 'APPLY'
                ? 'bg-slate-100 text-slate-800 hover:bg-slate-200'
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {activeTab === 'APPLY' ? (
              <>
                <FileText className="w-3.5 h-3.5" />
                <span>View My Requests</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>+ Apply Leave / WFH</span>
              </>
            )}
          </button>
        </div>

        {/* Swipeable Quota Deck Carousel */}
        <SwipableQuotaDeck cards={quotaCards} />
      </div>

      {/* 2. BELOW SECTION: HIGH-UX APPLICATION FORM OR REDESIGNED REQUESTS FEED */}
      {activeTab === 'APPLY' ? (
        /* Enhanced Application Form Card */
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Submit Attendance Application
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Apply for planned leaves or work from home for manager review.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => prefillApply('WFH')}
                className="px-2.5 py-1 text-[11px] font-bold text-indigo-700 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                ⚡ Today's WFH
              </button>
              <button
                type="button"
                onClick={() => prefillApply('LEAVE', 'SICK')}
                className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 transition-colors"
              >
                ⚡ Sick Today
              </button>
            </div>
          </div>

          {/* Type Switcher Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setRequestType('LEAVE')}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                requestType === 'LEAVE'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>Apply for Leave</span>
            </button>
            <button
              type="button"
              onClick={() => setRequestType('WFH')}
              className={`py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition-all ${
                requestType === 'WFH'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4 text-indigo-600" />
              <span>Work From Home (WFH)</span>
            </button>
          </div>

          <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
            {submissionFeedback && (
              <div className={`p-3.5 rounded-2xl flex items-center gap-2.5 font-bold ${
                submissionFeedback.success 
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}>
                {submissionFeedback.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{submissionFeedback.message}</span>
              </div>
            )}

            {/* Category selection */}
            {requestType === 'LEAVE' ? (
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Leave Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'ANNUAL', label: 'Annual Vacation', left: paidRemaining },
                    { id: 'SICK', label: 'Sick Leave', left: sickRemaining },
                    { id: 'CASUAL', label: 'Casual Leave', left: casualRemaining },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setLeaveCategory(cat.id as LeaveCategory)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        leaveCategory === cat.id
                          ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-bold ring-1 ring-indigo-500'
                          : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="font-bold">{cat.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                        {cat.left} days left
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-slate-700 font-bold mb-1.5">
                  Remote Duration Format
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsHalfDay(false);
                      setWfhCategory('FULL_DAY');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      !isHalfDay
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-bold ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold">Full Day Remote</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Full regular shift from home</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsHalfDay(true);
                      setWfhCategory('HALF_DAY_AM');
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      isHalfDay
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-950 font-bold ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-bold">Half Day Remote</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Morning or afternoon remote</div>
                  </button>
                </div>
              </div>
            )}

            {/* Dates Picker */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (e.target.value > endDate || isHalfDay) {
                      setEndDate(e.target.value);
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  End Date {!isHalfDay && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  disabled={isHalfDay}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium ${
                    isHalfDay ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
                  }`}
                  required={!isHalfDay}
                />
              </div>
            </div>

            {/* Half Day slot selection */}
            {(isHalfDay || requestType === 'LEAVE') && (
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHalfDay}
                    onChange={(e) => setIsHalfDay(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="font-bold text-slate-700">Half-day slot</span>
                </label>

                {isHalfDay && (
                  <div className="flex items-center gap-2 ml-3">
                    <button
                      type="button"
                      onClick={() => setHalfDayPeriod('AM')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                        halfDayPeriod === 'AM'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Morning (AM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHalfDayPeriod('PM')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                        halfDayPeriod === 'PM'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Afternoon (PM)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Department collision advisory */}
            {otherConflicts.length > 0 && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-950 text-xs">
                    Coverage Advisory ({otherConflicts.length} {currentUser.department} colleague{otherConflicts.length > 1 ? 's' : ''} scheduled out)
                  </div>
                  <div className="text-[11px] text-amber-800 mt-0.5 space-y-0.5">
                    {otherConflicts.map(c => (
                      <div key={c.id}>
                        · <strong>{c.employeeName}</strong> ({c.type}) on {formatDisplayDate(c.startDate)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Reason */}
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Reason / Justification <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Brief reason for your request..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                required
              />
            </div>

            {/* Deliverables for WFH */}
            {requestType === 'WFH' && (
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Remote Deliverables / Focus Tasks
                </label>
                <textarea
                  rows={2}
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  placeholder="Key items you plan to deliver during this remote period..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                />
              </div>
            )}

            {/* Stand-in & Contact for Leave */}
            {requestType === 'LEAVE' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Coverage Handover Person
                  </label>
                  <select
                    value={handoverPersonId}
                    onChange={(e) => setHandoverPersonId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                  >
                    <option value="">Select team member...</option>
                    {departmentColleagues.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Emergency Contact Phone
                  </label>
                  <input
                    type="text"
                    value={emergencyPhone}
                    onChange={(e) => setEmergencyPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setActiveTab('MY_REQUESTS')}
                className="px-4 py-2 font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Manager</span>
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Enhanced Native Card Feed for My Requests */
        <div className="space-y-4">
          {/* Filter Bar & Search */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Status Segmented Buttons */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold overflow-x-auto">
                <button
                  onClick={() => setStatusFilter('ALL')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All ({myRequests.length})
                </button>
                <button
                  onClick={() => setStatusFilter('PENDING')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === 'PENDING' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3 h-3 text-amber-500" />
                  <span>Pending ({pendingCount})</span>
                </button>
                <button
                  onClick={() => setStatusFilter('APPROVED')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === 'APPROVED' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>Approved ({approvedCount})</span>
                </button>
                <button
                  onClick={() => setStatusFilter('REJECTED')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
                    statusFilter === 'REJECTED' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <XCircle className="w-3 h-3 text-rose-500" />
                  <span>Declined ({rejectedCount})</span>
                </button>
              </div>

              {/* Search Box */}
              <div className="relative flex-1 max-w-xs">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by reason or date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Cards Feed */}
          {filteredRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 shadow-2xs">
              <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No requests found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {statusFilter === 'PENDING'
                  ? 'You have no submissions currently waiting for manager review.'
                  : 'No attendance records match your current filter.'}
              </p>
              <button
                onClick={() => setActiveTab('APPLY')}
                className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Submit New Request</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRequests.map(req => {
                const isLeave = req.type === 'LEAVE';
                const isApproved = req.status === 'APPROVED';
                const isRejected = req.status === 'REJECTED';
                const isPending = req.status === 'PENDING';

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all space-y-3"
                  >
                    {/* Card Top Row: Type Pill, Status Badge & Days Count */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-xl ${
                          isLeave 
                            ? 'bg-amber-50 text-amber-900 border border-amber-200/80' 
                            : 'bg-indigo-50 text-indigo-900 border border-indigo-200/80'
                        }`}>
                          {isLeave ? <Briefcase className="w-3.5 h-3.5 text-amber-600 shrink-0" /> : <Home className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                          <span>
                            {isLeave 
                              ? `${req.leaveCategory || 'Leave'} Leave` 
                              : req.isHalfDay 
                              ? `WFH (${req.halfDayPeriod || 'Half'} Day)` 
                              : 'Work From Home (Full)'}
                          </span>
                        </span>

                        <span className="text-xs font-bold font-mono tabular-nums text-slate-700 bg-slate-100 px-2 py-0.5 rounded-lg">
                          {req.daysCount} business day{req.daysCount === 1 ? '' : 's'}
                        </span>
                      </div>

                      {/* Status badge */}
                      <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-xl border self-start sm:self-auto ${
                        isApproved
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isRejected
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : isPending
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}>
                        {isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        {isRejected && <XCircle className="w-3.5 h-3.5 text-rose-600" />}
                        {isPending && <Clock className="w-3.5 h-3.5 text-amber-600" />}
                        <span>{req.status}</span>
                      </span>
                    </div>

                    {/* Schedule Dates Bar */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{formatDateRange(req.startDate, req.endDate, req.isHalfDay, req.halfDayPeriod)}</span>
                    </div>

                    {/* Reason Text */}
                    <div className="text-xs text-slate-700 leading-relaxed bg-slate-50/40 p-2.5 rounded-xl border border-slate-100">
                      <strong className="text-slate-900 block font-semibold mb-0.5">Reason:</strong>
                      <p>{req.reason}</p>
                    </div>

                    {/* Deliverables if WFH */}
                    {req.deliverablesSummary && (
                      <div className="text-xs text-slate-700 leading-relaxed bg-indigo-50/30 p-2.5 rounded-xl border border-indigo-100/60">
                        <strong className="text-indigo-950 block font-semibold mb-0.5">Planned Deliverables:</strong>
                        <p>{req.deliverablesSummary}</p>
                      </div>
                    )}

                    {/* Handover pill */}
                    {req.handoverPersonName && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        <span>Handover Coverage: <strong className="text-slate-900 font-semibold">{req.handoverPersonName}</strong></span>
                      </div>
                    )}

                    {/* Manager Review Remarks if already decided */}
                    {!isPending && req.reviewedBy && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-0.5">
                        <div className="flex items-center justify-between text-slate-500 font-semibold text-[11px]">
                          <span>Decision by {req.reviewedBy}</span>
                          {req.reviewedAt && (
                            <span className="font-mono tabular-nums">{formatDisplayDate(req.reviewedAt.split('T')[0])}</span>
                          )}
                        </div>
                        <p className="text-slate-800 italic">
                          "{req.managerComment || 'No comment recorded'}"
                        </p>
                      </div>
                    )}

                    {/* Card Actions Bottom Row */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[11px] text-slate-400">
                        Applied {formatDisplayDate(req.appliedAt.split('T')[0])}
                      </div>

                      <div className="flex items-center gap-2">
                        {isPending && (
                          <button
                            onClick={() => {
                              if (window.confirm('Withdraw this pending request?')) {
                                cancelRequest(req.id);
                              }
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Withdraw</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedRequest(req)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-2xs"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3 text-slate-400" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Inspect Request Detail Modal */}
      <RequestDetailModal
        request={selectedRequest}
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
};
