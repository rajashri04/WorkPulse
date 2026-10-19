/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AttendanceProvider, useAttendance } from './context/AttendanceContext';
import { Navbar } from './components/Navbar';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { ManagerDashboard } from './components/ManagerDashboard';
import { LoginScreen } from './components/LoginScreen';
import { UserSwitcherModal } from './components/UserSwitcherModal';
import { NativePackagingModal } from './components/NativePackagingModal';
import { MobileSimulatorShell, DeviceMode } from './components/MobileSimulatorShell';
import { formatDisplayDate, TODAY_DATE } from './utils/dateUtils';

function AppContent() {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('IOS');
  const [isUserSwitcherOpen, setIsUserSwitcherOpen] = useState(false);
  const [isPackagingModalOpen, setIsPackagingModalOpen] = useState(false);

  const { currentUser, userRole, logout } = useAttendance();

  // Role-based views:
  // If not logged in -> LoginScreen
  // If Employee -> EmployeeDashboard (Apply + My Requests only)
  // If Manager -> ManagerDashboard (Pending Approvals + Current Attendance + Past Requests only)
  const renderedView = !currentUser ? (
    <LoginScreen onOpenPackagingModal={() => setIsPackagingModalOpen(true)} />
  ) : userRole === 'EMPLOYEE' ? (
    <EmployeeDashboard />
  ) : (
    <ManagerDashboard />
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-900 font-sans">
      {/* Top Bar Navigation */}
      <Navbar
        deviceMode={deviceMode}
        setDeviceMode={setDeviceMode}
        onOpenPackagingModal={() => setIsPackagingModalOpen(true)}
        onOpenUserSwitcher={() => setIsUserSwitcherOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4">
        {deviceMode === 'DESKTOP' ? (
          renderedView
        ) : (
          <MobileSimulatorShell
            deviceMode={deviceMode}
            setDeviceMode={setDeviceMode}
            onOpenPackagingModal={() => setIsPackagingModalOpen(true)}
          >
            {renderedView}
          </MobileSimulatorShell>
        )}
      </main>

      {/* Corporate Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">WorkPulse Enterprise</span>
            <span>·</span>
            <span>
              {currentUser 
                ? (userRole === 'EMPLOYEE' ? 'Logged in as Employee' : 'Logged in as Manager') 
                : 'Authentication Gateway'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {currentUser && (
              <button
                onClick={logout}
                className="text-rose-600 hover:text-rose-800 font-semibold transition-colors"
              >
                Sign Out ({currentUser.name})
              </button>
            )}
            <button
              onClick={() => setIsPackagingModalOpen(true)}
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors"
            >
              Android APK & iOS IPA
            </button>
            <span>·</span>
            <span className="font-mono tabular-nums">{formatDisplayDate(TODAY_DATE)}</span>
          </div>
        </div>
      </footer>

      {/* Fast Account Switcher Modal */}
      <UserSwitcherModal
        isOpen={isUserSwitcherOpen}
        onClose={() => setIsUserSwitcherOpen(false)}
      />

      {/* Native App Packaging Guide Modal */}
      <NativePackagingModal
        isOpen={isPackagingModalOpen}
        onClose={() => setIsPackagingModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AttendanceProvider>
      <AppContent />
    </AttendanceProvider>
  );
}
