import React, { useState, useEffect } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { RequestType, LeaveCategory, WfhCategory } from '../types';
import { TODAY_DATE, calculateBusinessDays, formatDisplayDate } from '../utils/dateUtils';
import { X, Calendar, AlertTriangle, CheckCircle2, Home, Briefcase } from 'lucide-react';

interface ApplyRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: RequestType;
  defaultStartDate?: string;
}

export const ApplyRequestModal: React.FC<ApplyRequestModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'LEAVE',
  defaultStartDate,
}) => {
  const { currentUser, employees, applyRequest, getDepartmentConflicts } = useAttendance();

  const [activeTab, setActiveTab] = useState<RequestType>(defaultType);
  const [leaveCategory, setLeaveCategory] = useState<LeaveCategory>('ANNUAL');
  const [wfhCategory, setWfhCategory] = useState<WfhCategory>('FULL_DAY');
  const [startDate, setStartDate] = useState(defaultStartDate || TODAY_DATE);
  const [endDate, setEndDate] = useState(defaultStartDate || TODAY_DATE);
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [halfDayPeriod, setHalfDayPeriod] = useState<'AM' | 'PM'>('AM');
  const [reason, setReason] = useState('');
  const [deliverables, setDeliverables] = useState('');
  const [handoverPersonId, setHandoverPersonId] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState(currentUser?.phone || '');
  const [submissionStatus, setSubmissionStatus] = useState<{ success?: boolean; message?: string } | null>(null);

  useEffect(() => {
    if (defaultType) setActiveTab(defaultType);
    if (defaultStartDate) {
      setStartDate(defaultStartDate);
      setEndDate(defaultStartDate);
    }
  }, [defaultType, defaultStartDate, isOpen]);

  // If half day is toggled, force end date = start date
  useEffect(() => {
    if (isHalfDay) {
      setEndDate(startDate);
    }
  }, [isHalfDay, startDate]);

  if (!isOpen || !currentUser) return null;

  const calculatedDays = calculateBusinessDays(startDate, endDate, isHalfDay);

  // Department conflict detection
  const conflicts = getDepartmentConflicts(startDate, endDate, currentUser.department);
  const otherConflicts = conflicts.filter(c => c.employeeId !== currentUser.id);

  // Remaining leave balance calculations for current user
  const balances = currentUser.leaveBalances;
  let quotaAvailable = 0;
  let quotaCategoryName = '';

  if (activeTab === 'LEAVE') {
    if (leaveCategory === 'ANNUAL') {
      quotaAvailable = balances.paidLeaveTotal - balances.paidLeaveUsed;
      quotaCategoryName = 'Annual Paid Leave';
    } else if (leaveCategory === 'SICK') {
      quotaAvailable = balances.sickLeaveTotal - balances.sickLeaveUsed;
      quotaCategoryName = 'Sick Leave';
    } else if (leaveCategory === 'CASUAL') {
      quotaAvailable = balances.casualLeaveTotal - balances.casualLeaveUsed;
      quotaCategoryName = 'Casual Leave';
    } else {
      quotaAvailable = 99; // Bereavement/Unpaid
      quotaCategoryName = 'Special / Unpaid';
    }
  } else {
    quotaAvailable = balances.wfhMonthlyAllowance - balances.wfhUsedThisMonth;
    quotaCategoryName = 'Monthly WFH Allowance';
  }

  const isQuotaExceeded = activeTab === 'LEAVE' && (leaveCategory === 'ANNUAL' || leaveCategory === 'CASUAL') && calculatedDays > quotaAvailable;

  const departmentColleagues = employees.filter(
    e => e.id !== currentUser.id && e.department === currentUser.department
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setSubmissionStatus({ success: false, message: 'Please provide a reason for your request.' });
      return;
    }

    const res = applyRequest({
      type: activeTab,
      leaveCategory: activeTab === 'LEAVE' ? leaveCategory : undefined,
      wfhCategory: activeTab === 'WFH' ? (isHalfDay ? (halfDayPeriod === 'AM' ? 'HALF_DAY_AM' : 'HALF_DAY_PM') : 'FULL_DAY') : undefined,
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
      setSubmissionStatus({ success: true, message: 'Your request has been submitted for manager approval.' });
      setTimeout(() => {
        onClose();
        setSubmissionStatus(null);
        setReason('');
        setDeliverables('');
      }, 1400);
    } else {
      setSubmissionStatus({ success: false, message: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
          <div>
            <h2 id="apply-modal-title" className="text-base font-semibold text-slate-900">
              Apply for Leave or Work From Home
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Applicant: <span className="font-medium text-slate-700">{currentUser.name}</span> ({currentUser.department})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs: Leave vs WFH */}
        <div className="px-6 pt-3 pb-1 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('LEAVE')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'LEAVE'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Briefcase className="w-4 h-4 text-amber-600" />
              <span>Apply for Leave</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('WFH')}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'WFH'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Home className="w-4 h-4 text-indigo-600" />
              <span>Work From Home (WFH)</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4 text-xs flex-1">
          {submissionStatus && (
            <div className={`p-3 rounded-lg flex items-start gap-2.5 ${
              submissionStatus.success ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}>
              {submissionStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              )}
              <span className="font-medium">{submissionStatus.message}</span>
            </div>
          )}

          {/* Balance Quota Summary Banner */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                {quotaCategoryName} Quota
              </span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                <span className="font-mono tabular-nums">{quotaAvailable}</span> days available
                <span className="text-slate-400 font-normal ml-1.5">
                  ({activeTab === 'LEAVE' ? `${balances.paidLeaveUsed} used this year` : `${balances.wfhUsedThisMonth} used this month`})
                </span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-500">Days Applying</span>
              <p className={`text-sm font-semibold font-mono tabular-nums ${isQuotaExceeded ? 'text-rose-600' : 'text-indigo-600'}`}>
                {calculatedDays} day{calculatedDays === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {/* Category Selection */}
          {activeTab === 'LEAVE' ? (
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">
                Leave Type <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'ANNUAL', label: 'Annual / Vacation', remaining: balances.paidLeaveTotal - balances.paidLeaveUsed },
                  { id: 'SICK', label: 'Sick / Medical', remaining: balances.sickLeaveTotal - balances.sickLeaveUsed },
                  { id: 'CASUAL', label: 'Casual Leave', remaining: balances.casualLeaveTotal - balances.casualLeaveUsed },
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setLeaveCategory(cat.id as LeaveCategory)}
                    className={`p-2.5 text-left rounded-lg border transition-all ${
                      leaveCategory === cat.id
                        ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 font-medium'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="font-semibold">{cat.label}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
                      {cat.remaining} days left
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-slate-700 font-medium mb-1.5">
                WFH Duration Mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsHalfDay(false);
                    setWfhCategory('FULL_DAY');
                  }}
                  className={`p-2.5 text-left rounded-lg border transition-all ${
                    !isHalfDay
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 font-medium'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-semibold">Full Day WFH</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Regular full business day</div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsHalfDay(true);
                    setWfhCategory('HALF_DAY_AM');
                  }}
                  className={`p-2.5 text-left rounded-lg border transition-all ${
                    isHalfDay
                      ? 'border-indigo-600 bg-indigo-50/40 text-indigo-950 font-medium'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="font-semibold">Half Day WFH</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Morning or Afternoon remote</div>
                </button>
              </div>
            </div>
          )}

          {/* Dates & Half Day Configuration */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      if (e.target.value > endDate || isHalfDay) {
                        setEndDate(e.target.value);
                      }
                    }}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  End Date {!isHalfDay && <span className="text-rose-500">*</span>}
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  disabled={isHalfDay}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isHalfDay ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : ''
                  }`}
                  required={!isHalfDay}
                />
              </div>
            </div>

            {/* Half day checkbox for Leave */}
            {activeTab === 'LEAVE' && (
              <div className="flex items-center gap-3 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHalfDay}
                    onChange={(e) => setIsHalfDay(e.target.checked)}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-slate-700 font-medium">Half day leave</span>
                </label>

                {isHalfDay && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      type="button"
                      onClick={() => setHalfDayPeriod('AM')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                        halfDayPeriod === 'AM'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      First Half (AM)
                    </button>
                    <button
                      type="button"
                      onClick={() => setHalfDayPeriod('PM')}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium border ${
                        halfDayPeriod === 'PM'
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Second Half (PM)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Half day period for WFH */}
            {activeTab === 'WFH' && isHalfDay && (
              <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-slate-700 font-medium">Select Slot:</span>
                <button
                  type="button"
                  onClick={() => setHalfDayPeriod('AM')}
                  className={`px-3 py-1 rounded text-xs font-medium border ${
                    halfDayPeriod === 'AM'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Morning (9 AM – 1 PM remote)
                </button>
                <button
                  type="button"
                  onClick={() => setHalfDayPeriod('PM')}
                  className={`px-3 py-1 rounded text-xs font-medium border ${
                    halfDayPeriod === 'PM'
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200'
                  }`}
                >
                  Afternoon (2 PM – 6 PM remote)
                </button>
              </div>
            )}
          </div>

          {/* Department Conflict Alert */}
          {otherConflicts.length > 0 && (
            <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-amber-900">
                    Team Coverage Notice ({otherConflicts.length} {currentUser.department} colleague{otherConflicts.length > 1 ? 's' : ''} already scheduled out)
                  </div>
                  <div className="text-[11px] text-amber-800 mt-1 space-y-0.5">
                    {otherConflicts.map(c => (
                      <div key={c.id}>
                        · <span className="font-medium">{c.employeeName}</span> ({c.type === 'LEAVE' ? 'On Leave' : 'WFH'}) on {formatDisplayDate(c.startDate)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Reason / Justification <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={activeTab === 'LEAVE' ? 'e.g., Family travel, medical appointment, personal commitments...' : 'e.g., Deep focus coding sprint, broadband technician visit...'}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              required
            />
          </div>

          {/* Deliverables for WFH */}
          {activeTab === 'WFH' && (
            <div>
              <label className="block text-slate-700 font-medium mb-1">
                Planned Tasks / Deliverables
              </label>
              <textarea
                rows={2}
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                placeholder="List key tasks you will accomplish remotely during this time..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
              />
            </div>
          )}

          {/* Handover & Emergency Contact */}
          {activeTab === 'LEAVE' && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Handover Person (Stand-in)
                </label>
                <select
                  value={handoverPersonId}
                  onChange={(e) => setHandoverPersonId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Select colleague...</option>
                  {departmentColleagues.map(colleague => (
                    <option key={colleague.id} value={colleague.id}>
                      {colleague.name} ({colleague.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Emergency Contact Phone
                </label>
                <input
                  type="text"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              Submit Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
