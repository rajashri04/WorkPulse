import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { AttendanceRequest, Department } from '../types';
import { TODAY_DATE, formatDisplayDate, formatDateRange } from '../utils/dateUtils';
import { Avatar } from './Avatar';
import { RequestDetailModal } from './RequestDetailModal';
import { SwipableQuotaDeck, QuotaCardItem } from './SwipableQuotaDeck';
import { 
  Building2, 
  Home, 
  Briefcase, 
  CheckSquare, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Download, 
  Filter, 
  AlertTriangle,
  UserCheck,
  CheckCheck,
  Check,
  ExternalLink,
  History,
  Users,
  ShieldCheck,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';

export const ManagerDashboard: React.FC = () => {
  const { 
    currentUser, 
    requests, 
    employees, 
    approveRequest, 
    rejectRequest, 
    getDatePresence, 
    getDepartmentConflicts,
    pendingApprovalsCount,
    managerActiveTab: activeTab,
    setManagerActiveTab: setActiveTab
  } = useAttendance();

  const [selectedRequest, setSelectedRequest] = useState<AttendanceRequest | null>(null);

  // Filters for Attendance & History
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [presenceStatusFilter, setPresenceStatusFilter] = useState<'ALL' | 'IN_OFFICE' | 'WFH' | 'ON_LEAVE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [historyTypeFilter, setHistoryTypeFilter] = useState<'ALL' | 'LEAVE' | 'WFH'>('ALL');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<'ALL' | 'APPROVED' | 'REJECTED'>('ALL');

  if (!currentUser) return null;

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const pastRequests = requests.filter(r => r.status === 'APPROVED' || r.status === 'REJECTED');

  const filteredPastRequests = pastRequests.filter(req => {
    if (historyTypeFilter !== 'ALL' && req.type !== historyTypeFilter) return false;
    if (historyStatusFilter !== 'ALL' && req.status !== historyStatusFilter) return false;
    if (deptFilter !== 'ALL' && req.department !== deptFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = req.employeeName.toLowerCase().includes(q);
      const matchReason = req.reason.toLowerCase().includes(q);
      if (!matchName && !matchReason) return false;
    }
    return true;
  });

  // Today's presence list
  const presenceList = getDatePresence(TODAY_DATE);
  const totalEmployees = presenceList.length;
  const inOfficeCount = presenceList.filter(p => p.status === 'IN_OFFICE').length;
  const wfhCount = presenceList.filter(p => p.status === 'WFH').length;
  const onLeaveCount = presenceList.filter(p => p.status === 'ON_LEAVE').length;

  const filteredPresence = presenceList.filter(item => {
    if (deptFilter !== 'ALL' && item.employee.department !== deptFilter) return false;
    if (presenceStatusFilter !== 'ALL' && item.status !== presenceStatusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.employee.name.toLowerCase().includes(q);
      const matchRole = item.employee.role.toLowerCase().includes(q);
      const matchDept = item.employee.department.toLowerCase().includes(q);
      if (!matchName && !matchRole && !matchDept) return false;
    }
    return true;
  });

  const handleApproveAll = () => {
    if (pendingRequests.length === 0) return;
    if (window.confirm(`Approve all ${pendingRequests.length} pending employee requests now?`)) {
      pendingRequests.forEach(r => {
        approveRequest(r.id, 'Batch approved by manager.');
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ['Employee', 'Role', 'Department', 'Email', 'Today Status', 'Details / Reason', 'Handover Stand-in'];
    const rows = filteredPresence.map(item => [
      `"${item.employee.name}"`,
      `"${item.employee.role}"`,
      `"${item.employee.department}"`,
      `"${item.employee.email}"`,
      `"${item.status === 'IN_OFFICE' ? 'In Office' : item.status === 'WFH' ? 'Working From Home' : 'On Leave'}"`,
      `"${item.request?.reason ? item.request.reason.replace(/"/g, '""') : 'Regular Office Shift'}"`,
      `"${item.request?.handoverPersonName || 'None'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `workpulse_attendance_${TODAY_DATE}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const departments: Department[] = [
    'Engineering',
    'Design & UX',
    'Product',
    'Marketing',
    'Human Resources',
    'Finance',
  ];

  // Swipable Manager KPI Cards
  const managerKpiCards: QuotaCardItem[] = [
    {
      id: 'pending-approvals',
      title: 'Pending Approvals',
      subtitle: 'Review & Decisions',
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount} Action Required` : 'Clear',
      mainValue: pendingApprovalsCount,
      totalValue: requests.length,
      unit: 'total requests',
      progressPercent: (pendingApprovalsCount / Math.max(1, requests.length)) * 100,
      caption: 'Submissions awaiting your validation',
      icon: <CheckSquare className="w-5 h-5" />,
      theme: 'amber',
      actionLabel: pendingApprovalsCount > 0 ? '✓ Review Pending Approvals' : 'View Approval History',
      onAction: () => setActiveTab('APPROVALS'),
    },
    {
      id: 'in-office',
      title: 'In Office Today',
      subtitle: 'On-Premise Workforce',
      badge: 'Active Floor',
      mainValue: inOfficeCount,
      totalValue: totalEmployees,
      unit: 'staff',
      progressPercent: (inOfficeCount / Math.max(1, totalEmployees)) * 100,
      caption: `${Math.round((inOfficeCount / Math.max(1, totalEmployees)) * 100)}% on-premise attendance rate today`,
      icon: <Building2 className="w-5 h-5" />,
      theme: 'emerald',
      actionLabel: 'View On-Premise Staff',
      onAction: () => {
        setPresenceStatusFilter('IN_OFFICE');
        setActiveTab('ATTENDANCE');
      },
    },
    {
      id: 'wfh-today',
      title: 'Remote Work Today',
      subtitle: 'Working From Home',
      badge: 'Active Remote',
      mainValue: wfhCount,
      totalValue: totalEmployees,
      unit: 'staff',
      progressPercent: (wfhCount / Math.max(1, totalEmployees)) * 100,
      caption: `${Math.round((wfhCount / Math.max(1, totalEmployees)) * 100)}% of team working remotely today`,
      icon: <Home className="w-5 h-5" />,
      theme: 'indigo',
      actionLabel: 'View Remote Staff',
      onAction: () => {
        setPresenceStatusFilter('WFH');
        setActiveTab('ATTENDANCE');
      },
    },
    {
      id: 'on-leave-today',
      title: 'On Approved Leave',
      subtitle: 'Out of Office',
      badge: 'Covered',
      mainValue: onLeaveCount,
      totalValue: totalEmployees,
      unit: 'staff',
      progressPercent: (onLeaveCount / Math.max(1, totalEmployees)) * 100,
      caption: 'Medical and vacation leaves with stand-ins assigned',
      icon: <Briefcase className="w-5 h-5" />,
      theme: 'rose',
      actionLabel: 'View Out-of-Office Staff',
      onAction: () => {
        setPresenceStatusFilter('ON_LEAVE');
        setActiveTab('ATTENDANCE');
      },
    },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* 1. UPPER SECTION: USER IDENTITY + INTERACTIVE TABS + SWIPEABLE/GRID CARDS */}
      <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-3.5 sm:p-5 shadow-2xs w-full">
        {/* Manager Identity Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 mb-3 border-b border-slate-100">
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2 flex-wrap">
              <span>{currentUser.name}</span>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Manager Portal
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {currentUser.role} · Team Coverage & Approvals Hub
            </p>
          </div>

          {/* 3 Strict Manager Sub-Tabs (Approvals, Attendance, Past Requests) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-bold w-full sm:w-auto overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('APPROVALS')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'APPROVALS'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>Approvals</span>
              {pendingApprovalsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono tabular-nums font-bold">
                  {pendingApprovalsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('ATTENDANCE')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'ATTENDANCE'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
              <span>Attendance</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('PAST_REQUESTS')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 shrink-0 ${
                activeTab === 'PAST_REQUESTS'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <span>Past Requests</span>
            </button>
          </div>
        </div>

        {/* Swipeable Manager KPI Deck & Quick Selectors */}
        <SwipableQuotaDeck cards={managerKpiCards} />
      </div>

      {/* 2. BELOW SECTION: 100% VISIBLE REDESIGNED HIGH-UX CARDS */}

      {/* VIEW A: PENDING APPROVALS */}
      {activeTab === 'APPROVALS' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>Pending Approvals Queue</span>
                <span className="text-xs font-normal text-slate-500 font-mono">({pendingRequests.length} pending)</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Review employee requests, check team coverage, and make decisions.
              </p>
            </div>

            {pendingRequests.length > 0 && (
              <button
                type="button"
                onClick={handleApproveAll}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs shrink-0 self-start sm:self-auto"
              >
                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Batch Approve All ({pendingRequests.length})</span>
              </button>
            )}
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-12 text-center text-slate-500 shadow-2xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-900">Queue is Clear</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                All employee leave and remote work submissions have been reviewed and decided.
              </p>
              <button
                type="button"
                onClick={() => setActiveTab('ATTENDANCE')}
                className="mt-4 inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>View Today's Attendance Roster</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {pendingRequests.map(req => {
                const isLeave = req.type === 'LEAVE';
                const conflicts = getDepartmentConflicts(req.startDate, req.endDate, req.department, req.id);

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs hover:border-slate-300 hover:shadow-xs transition-all space-y-3 sm:space-y-4"
                  >
                    {/* Header: Employee Avatar, Identity & Duration */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar src={req.employeeAvatar} name={req.employeeName} size="lg" />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">
                              {req.employeeName}
                            </span>
                            <span className="text-xs text-slate-400">·</span>
                            <span className="text-xs text-slate-500 font-medium">
                              {req.department}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            Applied {formatDisplayDate(req.appliedAt.split('T')[0])}
                          </span>
                        </div>
                      </div>

                      {/* Request Type Badge & Duration */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-1 shrink-0">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-xl ${
                          isLeave 
                            ? 'bg-amber-50 text-amber-900 border border-amber-200' 
                            : 'bg-indigo-50 text-indigo-900 border border-indigo-200'
                        }`}>
                          {isLeave ? <Briefcase className="w-3.5 h-3.5 text-amber-600 shrink-0" /> : <Home className="w-3.5 h-3.5 text-indigo-600 shrink-0" />}
                          <span>
                            {isLeave 
                              ? `${req.leaveCategory || 'Leave'} Leave` 
                              : req.isHalfDay ? `WFH (${req.halfDayPeriod})` : 'WFH Full Day'}
                          </span>
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600">
                          {req.daysCount} business day{req.daysCount === 1 ? '' : 's'}
                        </span>
                      </div>
                    </div>

                    {/* Schedule Dates Bar */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
                      <span>{formatDateRange(req.startDate, req.endDate, req.isHalfDay, req.halfDayPeriod)}</span>
                    </div>

                    {/* Reason Text */}
                    <div className="p-3 bg-slate-50/70 border border-slate-100 rounded-xl text-xs space-y-1">
                      <strong className="text-slate-900 font-semibold block">Reason for Request:</strong>
                      <p className="text-slate-700 leading-relaxed">{req.reason}</p>
                    </div>

                    {/* Deliverables if WFH */}
                    {req.deliverablesSummary && (
                      <div className="p-3 bg-indigo-50/50 border border-indigo-100/70 rounded-xl text-xs space-y-1">
                        <strong className="text-indigo-950 font-semibold block">Planned Deliverables:</strong>
                        <p className="text-slate-700 leading-relaxed">{req.deliverablesSummary}</p>
                      </div>
                    )}

                    {/* Collision Advisory */}
                    {conflicts.length > 0 && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-amber-950 text-xs">
                            Team Coverage Alert: {conflicts.length} department colleague{conflicts.length > 1 ? 's' : ''} out on these dates
                          </div>
                          <div className="text-[11px] text-amber-800 mt-1 space-y-0.5">
                            {conflicts.map(c => (
                              <div key={c.id}>
                                · <strong>{c.employeeName}</strong> ({c.type}) on {formatDisplayDate(c.startDate)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Handover & Contact */}
                    {req.handoverPersonName && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>Coverage Stand-in: <strong className="text-slate-900 font-semibold">{req.handoverPersonName}</strong></span>
                      </div>
                    )}

                    {/* Action Bar - Fully Visible and Responsive */}
                    <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(req)}
                        className="inline-flex items-center justify-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 py-2 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors"
                      >
                        <span>Add Review Remarks</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </button>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => rejectRequest(req.id, 'Declined due to team coverage constraints.')}
                          className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors text-center"
                        >
                          Decline
                        </button>
                        <button
                          type="button"
                          onClick={() => approveRequest(req.id, 'Approved.')}
                          className="flex-1 sm:flex-none px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-2xs flex items-center justify-center gap-1.5"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Approve</span>
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

      {/* VIEW B: CURRENT ATTENDANCE */}
      {activeTab === 'ATTENDANCE' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Current Attendance Roster</span>
                  <span className="text-xs font-normal text-slate-500 font-mono">({formatDisplayDate(TODAY_DATE)})</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Real-time visibility of who is in the office, remote, or on leave.
                </p>
              </div>

              <button
                type="button"
                onClick={handleExportCSV}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 shadow-2xs shrink-0 self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5 text-slate-500" />
                <span>Export CSV</span>
              </button>
            </div>

            {/* Quick Status Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              <button
                type="button"
                onClick={() => setPresenceStatusFilter('ALL')}
                className={`px-2.5 py-1 text-xs rounded-xl border transition-all flex items-center gap-1 shrink-0 ${
                  presenceStatusFilter === 'ALL'
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
                }`}
              >
                <span>All Staff</span>
                <span className="font-mono tabular-nums text-[10px] font-bold">({totalEmployees})</span>
              </button>

              <button
                type="button"
                onClick={() => setPresenceStatusFilter('IN_OFFICE')}
                className={`px-2.5 py-1 text-xs rounded-xl border transition-all flex items-center gap-1 shrink-0 ${
                  presenceStatusFilter === 'IN_OFFICE'
                    ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                    : 'bg-emerald-50 hover:bg-emerald-100/70 text-emerald-800 border-emerald-200 font-medium'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>In Office</span>
                <span className="font-mono tabular-nums text-[10px] font-bold">({inOfficeCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setPresenceStatusFilter('WFH')}
                className={`px-2.5 py-1 text-xs rounded-xl border transition-all flex items-center gap-1 shrink-0 ${
                  presenceStatusFilter === 'WFH'
                    ? 'bg-indigo-700 text-white border-indigo-700 font-bold'
                    : 'bg-indigo-50 hover:bg-indigo-100/70 text-indigo-800 border-indigo-200 font-medium'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-indigo-500" />
                <span>Working Remote</span>
                <span className="font-mono tabular-nums text-[10px] font-bold">({wfhCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setPresenceStatusFilter('ON_LEAVE')}
                className={`px-2.5 py-1 text-xs rounded-xl border transition-all flex items-center gap-1 shrink-0 ${
                  presenceStatusFilter === 'ON_LEAVE'
                    ? 'bg-rose-700 text-white border-rose-700 font-bold'
                    : 'bg-rose-50 hover:bg-rose-100/70 text-rose-800 border-rose-200 font-medium'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>On Leave</span>
                <span className="font-mono tabular-nums text-[10px] font-bold">({onLeaveCount})</span>
              </button>
            </div>

            {/* Search Box and Department Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff member by name or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
                />
              </div>

              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-xl text-slate-900 bg-white font-bold shrink-0"
              >
                <option value="ALL">All Departments</option>
                {departments.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cards Grid for Today's Attendance - 100% Completely Visible */}
          {filteredPresence.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-2xs">
              <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No staff match this filter</h3>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting All Staff.</p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setDeptFilter('ALL');
                  setPresenceStatusFilter('ALL');
                }}
                className="mt-3 text-xs font-bold text-indigo-600 hover:underline"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredPresence.map(item => {
                const emp = item.employee;
                const req = item.request;
                const isInOffice = item.status === 'IN_OFFICE';
                const isWfh = item.status === 'WFH';
                const isOnLeave = item.status === 'ON_LEAVE';

                return (
                  <div
                    key={emp.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2.5">
                      {/* Top Identity & Status Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Avatar src={emp.avatar} name={emp.name} size="md" />
                          <div className="min-w-0">
                            <span className="font-bold text-xs text-slate-900 block truncate">
                              {emp.name}
                            </span>
                            <span className="text-[11px] text-slate-500 block truncate">
                              {emp.role}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                          isInOffice 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : isWfh 
                            ? 'bg-indigo-50 text-indigo-800 border border-indigo-200' 
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isInOffice ? 'bg-emerald-600' : isWfh ? 'bg-indigo-600' : 'bg-rose-600'
                          }`} />
                          <span>{isInOffice ? 'In Office' : isWfh ? 'Remote WFH' : 'On Leave'}</span>
                        </span>
                      </div>

                      {/* Department Tag */}
                      <div className="text-[11px] text-slate-600 font-medium bg-slate-50 px-2 py-1 rounded-lg">
                        {emp.department}
                      </div>

                      {/* Details note */}
                      <div className="text-xs text-slate-600 leading-snug">
                        {req ? (
                          <div>
                            <p className="line-clamp-2 italic">"{req.reason}"</p>
                            {req.handoverPersonName && (
                              <span className="text-[10px] text-slate-500 block mt-1">
                                Stand-in: <strong className="text-slate-800">{req.handoverPersonName}</strong>
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Regular office desk shift</span>
                        )}
                      </div>
                    </div>

                    {/* Contact / Inspect Footer */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400 font-mono truncate max-w-[140px]">
                        {emp.phone || emp.email}
                      </span>

                      {req ? (
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline"
                        >
                          Inspect Request
                        </button>
                      ) : (
                        <a
                          href={`mailto:${emp.email}`}
                          className="text-slate-500 hover:text-slate-800 font-medium hover:underline text-[11px]"
                        >
                          Email Staff
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW C: PAST REQUESTS */}
      {activeTab === 'PAST_REQUESTS' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-3.5 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Historical Decisions Log ({filteredPastRequests.length})</h2>
                <p className="text-xs text-slate-500">Audit trail of all processed leave and WFH submissions.</p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={historyTypeFilter}
                  onChange={(e) => setHistoryTypeFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl text-slate-900 bg-white font-bold"
                >
                  <option value="ALL">All Categories</option>
                  <option value="LEAVE">Leaves</option>
                  <option value="WFH">WFH</option>
                </select>

                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 text-xs border border-slate-200 rounded-xl text-slate-900 bg-white font-bold"
                >
                  <option value="ALL">All Decisions</option>
                  <option value="APPROVED">Approved</option>
                  <option value="REJECTED">Declined</option>
                </select>
              </div>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search history by employee name or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900 font-medium"
              />
            </div>
          </div>

          {filteredPastRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-2xs">
              <History className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-800">No past requests found</h3>
              <p className="text-xs text-slate-500 mt-1">No requests match your current filters.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPastRequests.map(req => {
                const isApproved = req.status === 'APPROVED';

                return (
                  <div
                    key={req.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar src={req.employeeAvatar} name={req.employeeName} size="sm" />
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-900 block truncate">{req.employeeName}</span>
                          <span className="text-[10px] text-slate-500 block truncate">{req.department}</span>
                        </div>
                      </div>

                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${
                        isApproved 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                          : 'bg-rose-50 text-rose-800 border-rose-200'
                      }`}>
                        {isApproved ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <XCircle className="w-3 h-3 text-rose-600" />}
                        <span>{req.status}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-800 font-medium bg-slate-50 p-2 rounded-xl">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{formatDateRange(req.startDate, req.endDate, req.isHalfDay, req.halfDayPeriod)}</span>
                      <span className="text-slate-400">·</span>
                      <span className="font-mono tabular-nums font-bold">{req.daysCount} business day{req.daysCount === 1 ? '' : 's'}</span>
                    </div>

                    <p className="text-xs text-slate-600 italic">
                      "{req.reason}"
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <div className="truncate min-w-0 flex-1 pr-2">
                        Reviewed by <strong className="text-slate-800">{req.reviewedBy}</strong>: "{req.managerComment || 'No remarks'}"
                      </div>

                      <button
                        type="button"
                        onClick={() => setSelectedRequest(req)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline shrink-0"
                      >
                        Details
                      </button>
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
