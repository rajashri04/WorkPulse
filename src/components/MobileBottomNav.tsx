import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Building2, CheckSquare, History, FileText, Plus, LogOut } from 'lucide-react';

interface MobileBottomNavProps {
  isIOSTheme?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  isIOSTheme = true,
}) => {
  const { 
    currentUser, 
    userRole, 
    logout, 
    pendingApprovalsCount,
    managerActiveTab,
    setManagerActiveTab,
    employeeActiveTab,
    setEmployeeActiveTab,
  } = useAttendance();

  if (!currentUser) return null;

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(12); } catch {}
    }
  };

  return (
    <nav 
      aria-label="Bottom Navigation" 
      className={`sticky bottom-0 z-40 border-t select-none ${
        isIOSTheme 
          ? 'bg-white/95 backdrop-blur-md border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]' 
          : 'bg-white border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]'
      }`}
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around gap-1">
        {userRole === 'EMPLOYEE' ? (
          <>
            {/* Employee Tab 1: My Requests */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setEmployeeActiveTab('MY_REQUESTS');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                employeeActiveTab === 'MY_REQUESTS'
                  ? 'text-indigo-600 bg-indigo-50/80 font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
              }`}
            >
              <FileText className={`w-5 h-5 ${employeeActiveTab === 'MY_REQUESTS' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">My Requests</span>
            </button>

            {/* Employee Tab 2: Apply */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setEmployeeActiveTab('APPLY');
              }}
              className={`flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                employeeActiveTab === 'APPLY'
                  ? 'text-indigo-950 font-bold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-xs transition-transform ${
                employeeActiveTab === 'APPLY'
                  ? 'bg-indigo-600 text-white scale-105'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}>
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${
                employeeActiveTab === 'APPLY' ? 'text-indigo-600 font-bold' : 'text-slate-600'
              }`}>
                Apply Leave/WFH
              </span>
            </button>

            {/* Employee Tab 3: Sign Out */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                logout();
              }}
              className="flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-colors font-medium"
            >
              <LogOut className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[10px] mt-0.5 tracking-tight">Sign Out</span>
            </button>
          </>
        ) : (
          <>
            {/* Manager Tab 1: Pending Approvals */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setManagerActiveTab('APPROVALS');
              }}
              className={`flex-1 py-1.5 px-1.5 rounded-xl flex flex-col items-center justify-center transition-all relative ${
                managerActiveTab === 'APPROVALS'
                  ? 'text-amber-600 bg-amber-50/80 font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
              }`}
            >
              <div className="relative">
                <CheckSquare className={`w-5 h-5 ${managerActiveTab === 'APPROVALS' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                {pendingApprovalsCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-amber-500 text-white font-mono min-w-[14px] text-center leading-tight shadow-2xs">
                    {pendingApprovalsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">Approvals</span>
            </button>

            {/* Manager Tab 2: Today's Attendance */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setManagerActiveTab('ATTENDANCE');
              }}
              className={`flex-1 py-1.5 px-1.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                managerActiveTab === 'ATTENDANCE'
                  ? 'text-indigo-600 bg-indigo-50/80 font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
              }`}
            >
              <Building2 className={`w-5 h-5 ${managerActiveTab === 'ATTENDANCE' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">Attendance</span>
            </button>

            {/* Manager Tab 3: Past Requests */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                setManagerActiveTab('PAST_REQUESTS');
              }}
              className={`flex-1 py-1.5 px-1.5 rounded-xl flex flex-col items-center justify-center transition-all ${
                managerActiveTab === 'PAST_REQUESTS'
                  ? 'text-slate-900 bg-slate-100 font-bold'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50 font-medium'
              }`}
            >
              <History className={`w-5 h-5 ${managerActiveTab === 'PAST_REQUESTS' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">Past Requests</span>
            </button>

            {/* Manager Tab 4: Sign Out */}
            <button
              type="button"
              onClick={() => {
                triggerHaptic();
                logout();
              }}
              className="py-1.5 px-2 rounded-xl flex flex-col items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 transition-colors font-medium shrink-0"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5 stroke-[1.8]" />
              <span className="text-[10px] mt-0.5 tracking-tight">Sign Out</span>
            </button>
          </>
        )}
      </div>
    </nav>
  );
};
