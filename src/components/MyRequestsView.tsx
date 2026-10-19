import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceRequest, RequestType } from '../types';
import { formatDateRange, formatDisplayDate, TODAY_DATE } from '../utils/dateUtils';
import { RequestDetailModal } from './RequestDetailModal';
import { 
  Calendar, 
  Briefcase, 
  Home, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Plus, 
  Zap, 
  Thermometer, 
  Palmtree, 
  AlertCircle 
} from 'lucide-react';

interface MyRequestsViewProps {
  onOpenApplyModal: (type?: RequestType, date?: string) => void;
}

export const MyRequestsView: React.FC<MyRequestsViewProps> = ({ onOpenApplyModal }) => {
  const { currentUser, requests, cancelRequest } = useAttendance();
  const [selectedRequest, setSelectedRequest] = useState<AttendanceRequest | null>(null);

  if (!currentUser) return null;

  // Filter requests for current logged-in user
  const myRequests = requests.filter(r => r.employeeId === currentUser.id);

  const balances = currentUser.leaveBalances;
  const paidRemaining = balances.paidLeaveTotal - balances.paidLeaveUsed;
  const sickRemaining = balances.sickLeaveTotal - balances.sickLeaveUsed;
  const casualRemaining = balances.casualLeaveTotal - balances.casualLeaveUsed;
  const wfhRemaining = balances.wfhMonthlyAllowance - balances.wfhUsedThisMonth;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            My Leaves & Work From Home
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Track your personal leave allocations, submit new requests, and review manager decisions.
          </p>
        </div>

        <button
          onClick={() => onOpenApplyModal('LEAVE')}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          Apply New Request
        </button>
      </div>

      {/* Quota Balances Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Paid Vacation */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Paid Vacation</span>
            <div className="p-1.5 bg-amber-50 rounded-md text-amber-700">
              <Palmtree className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {paidRemaining} <span className="text-xs font-normal text-slate-400">/ {balances.paidLeaveTotal} days</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-1.5 rounded-full" 
                style={{ width: `${(paidRemaining / balances.paidLeaveTotal) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-0.5 font-mono tabular-nums">
            {balances.paidLeaveUsed} days utilized this year
          </div>
        </div>

        {/* Sick Leave */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Sick / Medical</span>
            <div className="p-1.5 bg-rose-50 rounded-md text-rose-700">
              <Thermometer className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {sickRemaining} <span className="text-xs font-normal text-slate-400">/ {balances.sickLeaveTotal} days</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-rose-500 h-1.5 rounded-full" 
                style={{ width: `${(sickRemaining / balances.sickLeaveTotal) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-0.5 font-mono tabular-nums">
            {balances.sickLeaveUsed} days utilized this year
          </div>
        </div>

        {/* Casual Leave */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Casual Leave</span>
            <div className="p-1.5 bg-teal-50 rounded-md text-teal-700">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
              {casualRemaining} <span className="text-xs font-normal text-slate-400">/ {balances.casualLeaveTotal} days</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-teal-500 h-1.5 rounded-full" 
                style={{ width: `${(casualRemaining / balances.casualLeaveTotal) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-0.5 font-mono tabular-nums">
            {balances.casualLeaveUsed} days utilized this year
          </div>
        </div>

        {/* WFH Monthly Quota */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monthly WFH Quota</span>
            <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-700">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-700 font-mono tabular-nums">
              {wfhRemaining} <span className="text-xs font-normal text-slate-400">/ {balances.wfhMonthlyAllowance} days</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-indigo-600 h-1.5 rounded-full" 
                style={{ width: `${(wfhRemaining / balances.wfhMonthlyAllowance) * 100}%` }}
              ></div>
            </div>
          </div>
          <div className="text-[11px] text-slate-500 pt-0.5 font-mono tabular-nums">
            {balances.wfhUsedThisMonth} days utilized in October
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Quick Application Shortcuts
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Need immediate unplanned remote work or sick leave for today ({formatDisplayDate(TODAY_DATE)})?
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => onOpenApplyModal('WFH', TODAY_DATE)}
              className="px-3 py-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 transition-colors"
            >
              Today's WFH
            </button>
            <button
              onClick={() => onOpenApplyModal('LEAVE', TODAY_DATE)}
              className="px-3 py-1.5 text-xs font-medium bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 rounded-lg border border-rose-500/40 transition-colors"
            >
              Today's Sick Leave
            </button>
          </div>
        </div>
      </div>

      {/* My History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            My Request History ({myRequests.length})
          </h2>
          <span className="text-xs text-slate-500">
            Real-time status synced with manager approvals
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-medium">
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Schedule Dates</th>
                <th className="py-3 px-4">Days</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Manager Review</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {myRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    You have not submitted any leave or WFH requests yet.
                  </td>
                </tr>
              ) : (
                myRequests.map(req => {
                  const isLeave = req.type === 'LEAVE';

                  return (
                    <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Type */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          isLeave 
                            ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                            : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                        }`}>
                          {isLeave ? <Briefcase className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                          {isLeave 
                            ? `${req.leaveCategory ? req.leaveCategory.charAt(0) + req.leaveCategory.slice(1).toLowerCase() : ''} Leave` 
                            : req.isHalfDay 
                            ? `WFH (${req.halfDayPeriod || 'Half'})` 
                            : 'WFH Full'}
                        </span>
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 font-medium text-slate-900 whitespace-nowrap">
                        {formatDateRange(req.startDate, req.endDate, req.isHalfDay, req.halfDayPeriod)}
                      </td>

                      {/* Days */}
                      <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700">
                        {req.daysCount} day{req.daysCount === 1 ? '' : 's'}
                      </td>

                      {/* Reason */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="truncate text-slate-700" title={req.reason}>
                          {req.reason}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded ${
                          req.status === 'APPROVED' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : req.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : req.status === 'CANCELLED'
                            ? 'bg-slate-100 text-slate-600 border border-slate-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {req.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {req.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                          {req.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                          {req.status}
                        </span>
                      </td>

                      {/* Manager Review */}
                      <td className="py-3.5 px-4 text-slate-500 max-w-[200px]">
                        {req.reviewedBy ? (
                          <div className="truncate text-[11px]" title={`By ${req.reviewedBy}: ${req.managerComment}`}>
                            <span className="font-medium text-slate-700">{req.reviewedBy}:</span> {req.managerComment}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Pending review</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedRequest(req)}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium hover:underline"
                          >
                            Details
                          </button>
                          {req.status === 'PENDING' && (
                            <button
                              onClick={() => {
                                if (window.confirm('Withdraw this pending request?')) {
                                  cancelRequest(req.id);
                                }
                              }}
                              className="text-xs text-rose-600 hover:text-rose-800 font-medium hover:underline"
                            >
                              Withdraw
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Request Detail Modal */}
      <RequestDetailModal
        request={selectedRequest}
        isOpen={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
      />
    </div>
  );
};
