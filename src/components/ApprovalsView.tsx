import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceRequest, Department } from '../types';
import { formatDateRange, formatDisplayDate } from '../utils/dateUtils';
import { Avatar } from './Avatar';
import { RequestDetailModal } from './RequestDetailModal';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  Briefcase, 
  Home, 
  Filter, 
  CheckCheck, 
  ExternalLink,
  ShieldAlert,
  UserCheck
} from 'lucide-react';

export const ApprovalsView: React.FC<{ onSwitchToManager: () => void }> = ({ onSwitchToManager }) => {
  const { 
    currentUser, 
    requests, 
    approveRequest, 
    rejectRequest, 
    getDepartmentConflicts 
  } = useAttendance();

  const [statusFilter, setStatusFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'LEAVE' | 'WFH'>('ALL');
  const [departmentFilter, setDepartmentFilter] = useState<string>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<AttendanceRequest | null>(null);

  // If current user is not a manager, show notice with quick switch
  const isManager = currentUser?.isManager ?? false;

  const filteredRequests = requests.filter(req => {
    if (statusFilter !== 'ALL' && req.status !== statusFilter) return false;
    if (typeFilter !== 'ALL' && req.type !== typeFilter) return false;
    if (departmentFilter !== 'ALL' && req.department !== departmentFilter) return false;
    return true;
  });

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;
  const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
  const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;

  const handleApproveAllPending = () => {
    const pendingList = requests.filter(r => r.status === 'PENDING');
    if (pendingList.length === 0) return;
    if (window.confirm(`Approve all ${pendingList.length} pending requests?`)) {
      pendingList.forEach(req => {
        approveRequest(req.id, 'Batch approved by manager.');
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Manager Approvals Hub
            </h1>
            {currentUser && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {currentUser.name} ({currentUser.role})
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review, validate team coverage, and approve or reject employee leave and remote work submissions.
          </p>
        </div>

        {isManager ? (
          pendingCount > 0 && (
            <button
              onClick={handleApproveAllPending}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
            >
              <CheckCheck className="w-4 h-4 text-emerald-400" />
              Approve All Pending ({pendingCount})
            </button>
          )
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs text-amber-800">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>You are viewing as an Employee.</span>
            <button
              onClick={onSwitchToManager}
              className="font-semibold text-indigo-700 hover:underline ml-1"
            >
              Switch to Sarah Chen (Manager)
            </button>
          </div>
        )}
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === 'PENDING'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending Action</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 font-mono tabular-nums">
                {pendingCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === 'APPROVED'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Approved</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono tabular-nums">
                {approvedCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('REJECTED')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all flex items-center gap-1.5 ${
                statusFilter === 'REJECTED'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Declined</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono tabular-nums">
                {rejectedCount}
              </span>
            </button>
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all ${
                statusFilter === 'ALL'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Requests
            </button>
          </div>

          {/* Type Filters */}
          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="LEAVE">Leaves Only</option>
              <option value="WFH">WFH Only</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
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
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500 shadow-2xs">
            <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-800">No requests in this queue</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {statusFilter === 'PENDING' 
                ? 'All employee leave and work from home submissions have been reviewed.'
                : 'No requests matched your filter criteria.'}
            </p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const isLeave = req.type === 'LEAVE';
            const conflicts = getDepartmentConflicts(req.startDate, req.endDate, req.department, req.id);

            return (
              <div 
                key={req.id} 
                className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Left: Employee Info and Request Details */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <Avatar src={req.employeeAvatar} name={req.employeeName} size="lg" />
                  
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{req.employeeName}</span>
                      <span className="text-xs text-slate-400">·</span>
                      <span className="text-xs text-slate-500">{req.department}</span>
                      <span className="text-xs text-slate-400">·</span>
                      
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                        isLeave ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}>
                        {isLeave ? <Briefcase className="w-3 h-3" /> : <Home className="w-3 h-3" />}
                        {isLeave 
                          ? `${req.leaveCategory ? req.leaveCategory.charAt(0) + req.leaveCategory.slice(1).toLowerCase() : ''} Leave` 
                          : req.isHalfDay 
                          ? `WFH (${req.halfDayPeriod === 'AM' ? 'AM' : 'PM'})` 
                          : 'WFH Full Day'}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                      <span>{formatDateRange(req.startDate, req.endDate, req.isHalfDay, req.halfDayPeriod)}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono tabular-nums text-slate-600">
                        {req.daysCount} working day{req.daysCount === 1 ? '' : 's'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-1 max-w-xl">
                      <strong className="text-slate-700">Reason:</strong> {req.reason}
                    </p>

                    {/* Conflict notice badge */}
                    {conflicts.length > 0 && req.status === 'PENDING' && (
                      <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                        <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Team Coverage Alert: {conflicts.length} department colleague{conflicts.length > 1 ? 's' : ''} out on these dates</span>
                      </div>
                    )}

                    {/* Stand-in colleague info if leave */}
                    {req.handoverPersonName && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-500">
                        <UserCheck className="w-3 h-3 text-slate-400" />
                        <span>Coverage Handover: <strong className="text-slate-700">{req.handoverPersonName}</strong></span>
                      </div>
                    )}

                    {/* Reviewer Note if already reviewed */}
                    {req.status !== 'PENDING' && (
                      <div className="text-[11px] text-slate-500 italic pt-0.5">
                        Reviewed by {req.reviewedBy || 'Manager'}: "{req.managerComment || 'No comments'}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setSelectedRequest(req)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>

                  {req.status === 'PENDING' ? (
                    <>
                      <button
                        onClick={() => rejectRequest(req.id, 'Declined due to scheduling or operational conflicts.')}
                        className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => approveRequest(req.id, 'Approved.')}
                        className="px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
                      >
                        Approve
                      </button>
                    </>
                  ) : (
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-md border ${
                      req.status === 'APPROVED' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : req.status === 'REJECTED'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      {req.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
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
