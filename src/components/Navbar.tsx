import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Avatar } from './Avatar';
import { ShieldCheck, User, LogOut, Smartphone } from 'lucide-react';

interface NavbarProps {
  deviceMode: 'DESKTOP' | 'IOS' | 'ANDROID';
  setDeviceMode: (mode: 'DESKTOP' | 'IOS' | 'ANDROID') => void;
  onOpenPackagingModal: () => void;
  onOpenUserSwitcher: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  deviceMode,
  setDeviceMode,
  onOpenPackagingModal,
  onOpenUserSwitcher,
}) => {
  const { currentUser, userRole, logout, pendingApprovalsCount } = useAttendance();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
        {/* Zone 1: Wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            WP
          </div>
          <div>
            <div className="text-base font-bold tracking-tight text-slate-900 leading-tight">
              WorkPulse
            </div>
            {userRole && (
              <span className="text-[10px] text-slate-500 font-medium">
                {userRole === 'EMPLOYEE' ? 'Employee Self-Service' : 'Manager Operations'}
              </span>
            )}
          </div>
        </div>

        {/* Zone 2: Informational tag or mode indicator */}
        <div className="hidden md:flex items-center gap-3 text-xs">
          {userRole === 'EMPLOYEE' && (
            <div className="px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-full font-semibold flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Employee View: Apply & View My Requests Only</span>
            </div>
          )}
          {userRole === 'MANAGER' && (
            <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Manager View: Pending Approvals, Attendance & Past Requests Only</span>
            </div>
          )}
        </div>

        {/* Zone 3: Device switcher + Profile + Logout */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Device Preview Mode Switcher */}
          <div className="hidden lg:flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setDeviceMode('DESKTOP')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                deviceMode === 'DESKTOP' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Desktop
            </button>
            <button
              onClick={() => setDeviceMode('IOS')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                deviceMode === 'IOS' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              iPhone (iOS)
            </button>
            <button
              onClick={() => setDeviceMode('ANDROID')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                deviceMode === 'ANDROID' ? 'bg-white text-emerald-700 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pixel (Android)
            </button>
          </div>

          {/* Native APK/IPA trigger */}
          <button
            onClick={onOpenPackagingModal}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>APK / IPA</span>
          </button>

          {/* User Profile / Switcher */}
          {currentUser && (
            <button
              onClick={onOpenUserSwitcher}
              className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors text-left"
              title="Switch account"
            >
              <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentUser.isManager ? 'Manager' : 'Employee'}
                </div>
              </div>
            </button>
          )}

          {/* Logout Button */}
          {currentUser && (
            <button
              onClick={logout}
              className="p-2 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
              title="Log Out to Switch Portal"
              aria-label="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
