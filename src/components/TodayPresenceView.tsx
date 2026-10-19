import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Department, DailyPresenceStatus, AttendanceRequest } from '../types';
import { TODAY_DATE, formatDisplayDate } from '../utils/dateUtils';
import { Avatar } from './Avatar';
import { RequestDetailModal } from './RequestDetailModal';
import { 
  Building2, 
  Home, 
  Briefcase, 
  Search, 
  Download, 
  Filter, 
  ExternalLink,
  Phone,
  Mail,
  UserCheck
} from 'lucide-react';

export const TodayPresenceView: React.FC<{ onApplyClick: () => void }> = ({ onApplyClick }) => {
  const { getDatePresence } = useAttendance();
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeRequestDetail, setActiveRequestDetail] = useState<AttendanceRequest | null>(null);

  const presenceList = getDatePresence(TODAY_DATE);

  // Compute counts
  const total = presenceList.length;
  const inOfficeCount = presenceList.filter(p => p.status === 'IN_OFFICE').length;
  const wfhCount = presenceList.filter(p => p.status === 'WFH').length;
  const onLeaveCount = presenceList.filter(p => p.status === 'ON_LEAVE').length;

  const departments: Department[] = [
    'Engineering',
    'Design & UX',
    'Product',
    'Marketing',
    'Human Resources',
    'Finance',
  ];

  // Filtering
  const filteredList = presenceList.filter(item => {
    if (selectedDept !== 'ALL' && item.employee.department !== selectedDept) return false;
    if (selectedStatus !== 'ALL' && item.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = item.employee.name.toLowerCase().includes(q);
      const matchesRole = item.employee.role.toLowerCase().includes(q);
      const matchesDept = item.employee.department.toLowerCase().includes(q);
      if (!matchesName && !matchesRole && !matchesDept) return false;
    }
    return true;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Name', 'Role', 'Department', 'Email', 'Today Status', 'Details / Note', 'Handover Colleague'];
    const rows = filteredList.map(item => [
      `"${item.employee.name}"`,
      `"${item.employee.role}"`,
      `"${item.employee.department}"`,
      `"${item.employee.email}"`,
      `"${item.status === 'IN_OFFICE' ? 'In Office' : item.status === 'WFH' ? 'Working From Home' : 'On Leave'}"`,
      `"${item.request?.reason ? item.request.reason.replace(/"/g, '""') : 'Regular Workday'}"`,
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

  return (
    <div className="space-y-6">
      {/* Title & Today At A Glance Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Today's Team Presence Roster
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Tracking employee office attendance, remote work status, and approved leaves for {formatDisplayDate(TODAY_DATE)}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export CSV
          </button>
          <button
            onClick={onApplyClick}
            className="px-3.5 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-2xs"
          >
            + Apply Leave / WFH
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Workforce</span>
            <div className="p-1.5 bg-slate-100 rounded-md text-slate-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {total}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            100% active staff accounts
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">In Office</span>
            <div className="p-1.5 bg-emerald-50 rounded-md text-emerald-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {inOfficeCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
            {Math.round((inOfficeCount / total) * 100)}% on-premise today
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Working From Home</span>
            <div className="p-1.5 bg-indigo-50 rounded-md text-indigo-600">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-indigo-700 font-mono tabular-nums">
            {wfhCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
            {Math.round((wfhCount / total) * 100)}% remote today
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">On Leave</span>
            <div className="p-1.5 bg-amber-50 rounded-md text-amber-600">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-700 font-mono tabular-nums">
            {onLeaveCount}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5 font-mono tabular-nums">
            {Math.round((onLeaveCount / total) * 100)}% out of office
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name, role, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-900"
            />
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            {[
              { id: 'ALL', label: 'All Status' },
              { id: 'IN_OFFICE', label: `In Office (${inOfficeCount})` },
              { id: 'WFH', label: `WFH (${wfhCount})` },
              { id: 'ON_LEAVE', label: `On Leave (${onLeaveCount})` },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
                  selectedStatus === tab.id
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Department Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-t border-slate-100 pt-3">
          <span className="text-slate-400 font-medium text-[11px] mr-1 shrink-0 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Dept:
          </span>
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 ${
              selectedDept === 'ALL'
                ? 'bg-slate-900 text-white font-medium'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Departments
          </button>
          {departments.map(dept => (
            <button
              key={dept}
              onClick={() => setSelectedDept(dept)}
              className={`px-2.5 py-1 rounded text-xs transition-colors shrink-0 ${
                selectedDept === dept
                  ? 'bg-slate-900 text-white font-medium'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-medium">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department & Role</th>
                <th className="py-3 px-4">Today's Presence</th>
                <th className="py-3 px-4">Details / Handover</th>
                <th className="py-3 px-4 text-right">Contact / Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    No employees found matching the selected filters.
                  </td>
                </tr>
              ) : (
                filteredList.map(item => {
                  const emp = item.employee;
                  const req = item.request;

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Employee Identity */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar src={emp.avatar} name={emp.name} size="md" />
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              <span>{emp.name}</span>
                              {emp.isManager && (
                                <span className="text-[10px] text-indigo-700 bg-indigo-50 border border-indigo-200 px-1 rounded font-medium">
                                  Manager
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500">{emp.email}</span>
                          </div>
                        </div>
                      </td>

                      {/* Department & Role */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{emp.role}</div>
                        <div className="text-slate-500 text-[11px] mt-0.5">{emp.department}</div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {item.status === 'IN_OFFICE' && (
                          <div className="inline-flex items-center gap-1.5 font-medium text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                            <span>In Office (Floor 4)</span>
                          </div>
                        )}
                        {item.status === 'WFH' && (
                          <div className="inline-flex items-center gap-1.5 font-medium text-indigo-800 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                            <span>{item.categoryLabel || 'Working From Home'}</span>
                          </div>
                        )}
                        {item.status === 'ON_LEAVE' && (
                          <div className="inline-flex items-center gap-1.5 font-medium text-rose-800 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                            <span>{item.categoryLabel || 'On Leave'}</span>
                          </div>
                        )}
                      </td>

                      {/* Details / Handover */}
                      <td className="py-3.5 px-4 max-w-xs">
                        {req ? (
                          <div className="space-y-1">
                            <p className="text-slate-700 truncate" title={req.reason}>
                              {req.reason}
                            </p>
                            {req.handoverPersonName && (
                              <div className="flex items-center gap-1 text-[11px] text-slate-500">
                                <UserCheck className="w-3 h-3 text-slate-400" />
                                <span>Stand-in: <strong className="text-slate-700">{req.handoverPersonName}</strong></span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Regular desk hours</span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {req ? (
                            <button
                              onClick={() => setActiveRequestDetail(req)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-50 transition-colors"
                            >
                              <span>View Note</span>
                              <ExternalLink className="w-3 h-3 text-slate-400" />
                            </button>
                          ) : (
                            <a
                              href={`mailto:${emp.email}`}
                              className="p-1.5 text-slate-400 hover:text-slate-600 rounded hover:bg-slate-100 transition-colors"
                              title="Send Email"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
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

      {/* Modal for Request Detail */}
      <RequestDetailModal
        request={activeRequestDetail}
        isOpen={Boolean(activeRequestDetail)}
        onClose={() => setActiveRequestDetail(null)}
      />
    </div>
  );
};
