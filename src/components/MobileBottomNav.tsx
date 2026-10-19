import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Building2, CheckSquare, History, FileText, Plus, LogOut } from 'lucide-react';

interface MobileBottomNavProps {
  isIOSTheme?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  isIOSTheme = true,
}) => {
  const { currentUser, userRole, logout, pendingApprovalsCount } = useAttendance();

  if (!currentUser) return null;

  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try { navigator.vibrate(12); } catch {}
    }
  };

  return (
    <div className={`sticky bottom-0 z-40 border-t ${
      isIOSTheme 
        ? 'bg-white/95 backdrop-blur-md border-slate-200/80 shadow-[0_-4px_16px_rgba(0,0,0,0.04)]' 
        : 'bg-white border-slate-200 shadow-[0_-2px_8px_rgba(0,0,0,0.06)]'
    }`}>
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-around">
        {userRole === 'EMPLOYEE' ? (
          <>
            {/* Employee Tab 1: My Requests */}
            <div className="flex flex-col items-center justify-center py-1 text-indigo-600">
              <FileText className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-0.5">My Requests</span>
            </div>

            {/* Employee Tab 2: Apply */}
            <div className="flex flex-col items-center justify-center py-1 text-slate-700">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-xs">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[9px] font-bold text-slate-800 mt-0.5">Apply</span>
            </div>

            {/* Employee Tab 3: Sign Out */}
            <button
              onClick={() => {
                triggerHaptic();
                logout();
              }}
              className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-0.5">Sign Out</span>
            </button>
          </>
        ) : (
          <>
            {/* Manager Tab 1: Pending Approvals */}
            <div className="relative flex flex-col items-center justify-center py-1 text-amber-600">
              <div className="relative">
                <CheckSquare className="w-5 h-5" />
                {pendingApprovalsCount > 0 && (
                  <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-amber-500 text-white font-mono min-w-[14px] text-center leading-tight">
                    {pendingApprovalsCount}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-bold mt-0.5">Approvals</span>
            </div>

            {/* Manager Tab 2: Today's Attendance */}
            <div className="flex flex-col items-center justify-center py-1 text-indigo-600">
              <Building2 className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-0.5">Attendance</span>
            </div>

            {/* Manager Tab 3: Past Requests */}
            <div className="flex flex-col items-center justify-center py-1 text-slate-600">
              <History className="w-5 h-5" />
              <span className="text-[10px] font-bold mt-0.5">Past Requests</span>
            </div>

            {/* Manager Tab 4: Sign Out */}
            <button
              onClick={() => {
                triggerHaptic();
                logout();
              }}
              className="flex flex-col items-center justify-center py-1 text-slate-400 hover:text-rose-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-[10px] font-medium mt-0.5">Sign Out</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};
