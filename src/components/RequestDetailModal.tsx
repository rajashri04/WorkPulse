import React, { useState } from 'react';
import { AttendanceRequest } from '../types';
import { useAttendance } from '../context/AttendanceContext';
import { Avatar } from './Avatar';
import { formatDisplayDate, formatDateRange } from '../utils/dateUtils';
import { X, Calendar, UserCheck, Phone, CheckCircle2, XCircle, Clock, Home, Briefcase, FileText, AlertTriangle } from 'lucide-react';

interface RequestDetailModalProps {
  request: AttendanceRequest | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  request,
  isOpen,
  onClose,
}) => {
  const { currentUser, approveRequest, rejectRequest, cancelRequest, getDepartmentConflicts } = useAttendance();
  const [managerComment, setManagerComment] = useState('');

  if (!isOpen || !request) return null;

  const isApplicant = currentUser ? currentUser.id === request.employeeId : false;
  const isManager = currentUser ? currentUser.isManager : false;

  const conflicts = getDepartmentConflicts(request.startDate, request.endDate, request.department, request.id);

  const handleApprove = () => {
    approveRequest(request.id, managerComment);
    onClose();
  };

  const handleReject = () => {
    rejectRequest(request.id, managerComment);
    onClose();
  };

  const handleCancel = () => {
    if (window.confirm('Withdraw this pending request?')) {
      cancelRequest(request.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-detail-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Avatar src={request.employeeAvatar} name={request.employeeName} size="md" />
            <div>
              <h2 id="request-detail-title" className="text-base font-semibold text-slate-900">
                {request.employeeName}
              </h2>
              <p className="text-xs text-slate-500">
                {request.department} · Applied on {formatDisplayDate(request.appliedAt.split('T')[0])}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {/* Status Badge & Request Type Header */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200/80 rounded-lg">
            <div className="flex items-center gap-2.5">
              <div className={`p-2 rounded-lg ${
                request.type === 'LEAVE' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
              }`}>
                {request.type === 'LEAVE' ? <Briefcase className="w-4 h-4" /> : <Home className="w-4 h-4" />}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Request Type
                </span>
                <p className="text-sm font-semibold text-slate-900 mt-0.5">
                  {request.type === 'LEAVE' ? (
                    `${request.leaveCategory ? request.leaveCategory.charAt(0) + request.leaveCategory.slice(1).toLowerCase() : ''} Leave`
                  ) : (
                    request.isHalfDay 
                      ? `Work From Home (${request.halfDayPeriod === 'AM' ? 'First Half / Morning' : 'Second Half / Afternoon'})`
                      : 'Work From Home (Full Day)'
                  )}
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Status
              </span>
              <span className={`inline-flex items-center gap-1 font-semibold text-xs mt-0.5 px-2 py-0.5 rounded ${
                request.status === 'APPROVED' 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : request.status === 'REJECTED'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : request.status === 'CANCELLED'
                  ? 'bg-slate-100 text-slate-600 border border-slate-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {request.status === 'APPROVED' && <CheckCircle2 className="w-3.5 h-3.5" />}
                {request.status === 'REJECTED' && <XCircle className="w-3.5 h-3.5" />}
                {request.status === 'PENDING' && <Clock className="w-3.5 h-3.5" />}
                {request.status}
              </span>
            </div>
          </div>

          {/* Schedule / Duration */}
          <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-lg">
            <div>
              <span className="text-slate-500 font-medium">Schedule Dates</span>
              <p className="text-slate-900 font-semibold mt-0.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDateRange(request.startDate, request.endDate, request.isHalfDay, request.halfDayPeriod)}
              </p>
            </div>
            <div>
              <span className="text-slate-500 font-medium">Duration</span>
              <p className="text-slate-900 font-semibold font-mono tabular-nums mt-0.5">
                {request.daysCount} working day{request.daysCount === 1 ? '' : 's'}
              </p>
            </div>
          </div>

          {/* Conflict warnings */}
          {conflicts.length > 0 && request.status === 'PENDING' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-amber-900">
                    Overlap Advisory ({conflicts.length} department colleague{conflicts.length > 1 ? 's' : ''} out)
                  </span>
                  <div className="mt-1 space-y-0.5 text-[11px]">
                    {conflicts.map(c => (
                      <div key={c.id}>
                        · <span className="font-medium">{c.employeeName}</span> ({c.type}) on {formatDisplayDate(c.startDate)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reason */}
          <div className="space-y-1">
            <span className="text-slate-500 font-medium">Reason for Request</span>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed">
              {request.reason}
            </div>
          </div>

          {/* Deliverables summary if WFH */}
          {request.deliverablesSummary && (
            <div className="space-y-1">
              <span className="text-slate-500 font-medium">Planned Deliverables (WFH)</span>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 leading-relaxed">
                {request.deliverablesSummary}
              </div>
            </div>
          )}

          {/* Handover & Emergency Contact */}
          {(request.handoverPersonName || request.emergencyPhone) && (
            <div className="grid grid-cols-2 gap-3 pt-1">
              {request.handoverPersonName && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    Handover Person
                  </span>
                  <p className="text-slate-900 font-semibold mt-1">
                    {request.handoverPersonName}
                  </p>
                </div>
              )}
              {request.emergencyPhone && (
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Emergency Contact
                  </span>
                  <p className="text-slate-900 font-semibold mt-1 font-mono">
                    {request.emergencyPhone}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Manager Review / Remarks Section */}
          {request.status !== 'PENDING' ? (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
              <div className="flex items-center justify-between text-slate-500 font-medium">
                <span>Decision by {request.reviewedBy || 'Manager'}</span>
                {request.reviewedAt && (
                  <span className="font-mono tabular-nums text-[11px]">
                    {formatDisplayDate(request.reviewedAt.split('T')[0])}
                  </span>
                )}
              </div>
              <p className="text-slate-800 italic">
                "{request.managerComment || 'No comments provided.'}"
              </p>
            </div>
          ) : isManager ? (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-slate-700 font-medium">
                Manager Review Remarks (Optional)
              </label>
              <input
                type="text"
                value={managerComment}
                onChange={(e) => setManagerComment(e.target.value)}
                placeholder="e.g. Approved. Please ensure standup notes are posted..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-100">
          <div>
            {isApplicant && request.status === 'PENDING' && (
              <button
                onClick={handleCancel}
                className="text-rose-600 hover:text-rose-700 text-xs font-medium hover:underline"
              >
                Withdraw Request
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-xs"
            >
              Close
            </button>

            {isManager && request.status === 'PENDING' && (
              <>
                <button
                  onClick={handleReject}
                  className="px-3.5 py-2 font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors text-xs"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors text-xs shadow-xs"
                >
                  Approve Request
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
