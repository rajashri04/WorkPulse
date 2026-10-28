import React, { useState } from 'react';
import { 
  Wifi, 
  Battery, 
  Signal, 
  Bell, 
  Smartphone, 
  Maximize2, 
  Apple, 
  Cpu, 
  User,
  ShieldCheck
} from 'lucide-react';
import { MobileBottomNav } from './MobileBottomNav';
import { useAttendance } from '../context/AttendanceContext';

export type DeviceMode = 'DESKTOP' | 'IOS' | 'ANDROID';

interface MobileSimulatorShellProps {
  deviceMode: DeviceMode;
  setDeviceMode: (mode: DeviceMode) => void;
  onOpenPackagingModal: () => void;
  children: React.ReactNode;
}

export const MobileSimulatorShell: React.FC<MobileSimulatorShellProps> = ({
  deviceMode,
  setDeviceMode,
  onOpenPackagingModal,
  children,
}) => {
  const { currentUser, userRole } = useAttendance();
  const [notification, setNotification] = useState<{ title: string; body: string } | null>(null);

  const triggerTestNotification = () => {
    setNotification({
      title: 'WorkPulse Notification',
      body: userRole === 'MANAGER' 
        ? 'Alex Rivera requested 3 days Vacation Leave. Tap to review.' 
        : 'Your manager approved your Work From Home request for today!',
    });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // If in desktop mode, render standard full-width layout
  if (deviceMode === 'DESKTOP') {
    return <>{children}</>;
  }

  const isIOS = deviceMode === 'IOS';

  return (
    <div className="py-4 flex flex-col items-center justify-center min-h-[calc(100vh-140px)]">
      {/* Device Toolbar Controls */}
      <div className="mb-4 flex flex-wrap items-center justify-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm text-xs">
        <span className="text-slate-400 font-medium mr-1">Preview Frame:</span>
        <button
          onClick={() => setDeviceMode('IOS')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-colors ${
            deviceMode === 'IOS' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Apple className="w-3.5 h-3.5" />
          <span>iPhone 16 Pro</span>
        </button>

        <button
          onClick={() => setDeviceMode('ANDROID')}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full font-bold transition-colors ${
            deviceMode === 'ANDROID' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pixel 9</span>
        </button>

        <button
          onClick={() => setDeviceMode('DESKTOP')}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-slate-600 hover:text-slate-900 transition-colors font-medium"
          title="Switch to full screen layout"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Desktop View</span>
        </button>

        <span className="text-slate-300">|</span>

        {/* Test Push Notification button */}
        <button
          onClick={triggerTestNotification}
          className="flex items-center gap-1 px-2.5 py-1 text-slate-700 hover:text-indigo-600 font-medium transition-colors"
          title="Simulate native mobile push notification"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Test Push</span>
        </button>

        {/* Packaging guide */}
        <button
          onClick={onOpenPackagingModal}
          className="flex items-center gap-1 px-2.5 py-1 text-indigo-600 hover:text-indigo-800 font-bold transition-colors"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>APK / IPA</span>
        </button>
      </div>

      {/* Realistic Native Phone Chassis */}
      <div className={`relative transition-all duration-300 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] ${
        isIOS
          ? 'w-[390px] max-w-[calc(100vw-24px)] h-[815px] max-h-[calc(100vh-90px)] rounded-[52px] p-[10px] bg-slate-900 border-[3.5px] border-slate-700 ring-1 ring-slate-800'
          : 'w-[395px] max-w-[calc(100vw-24px)] h-[820px] max-h-[calc(100vh-90px)] rounded-[42px] p-[8px] bg-neutral-900 border-[3.5px] border-neutral-700'
      }`}>
        {/* Outer Phone Shell Screen Container */}
        <div className={`w-full h-full bg-slate-50 flex flex-col overflow-hidden relative ${
          isIOS ? 'rounded-[42px]' : 'rounded-[34px]'
        }`}>
          {/* Native System Status Bar */}
          <div className="h-10 w-full bg-white/95 backdrop-blur-md px-6 flex items-center justify-between text-[11px] font-semibold text-slate-900 select-none shrink-0 z-30">
            {/* Left: Clock */}
            <span className="font-mono">9:41</span>

            {/* Center: Dynamic Island (iOS) or Punch-hole (Android) */}
            {isIOS ? (
              <div className="w-24 h-6 bg-black rounded-full flex items-center justify-center px-2 shadow-inner">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 mr-auto border border-slate-800"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-950/60 ml-auto"></div>
              </div>
            ) : (
              <div className="w-3.5 h-3.5 rounded-full bg-black shadow-inner"></div>
            )}

            {/* Right: Cellular, Wifi, Battery */}
            <div className="flex items-center gap-1.5 text-slate-800">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[10px] font-mono">100%</span>
                <Battery className="w-4 h-4 fill-slate-800" />
              </div>
            </div>
          </div>

          {/* Simulated Native Push Notification Banner */}
          {notification && (
            <div className="absolute top-12 left-3 right-3 z-50 bg-slate-900/95 text-white p-3 rounded-2xl shadow-2xl border border-slate-700 backdrop-blur-md animate-in slide-in-from-top-4 duration-200">
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shrink-0 font-bold text-xs">
                  WP
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs truncate">{notification.title}</span>
                    <span className="text-[10px] text-slate-400">now</span>
                  </div>
                  <p className="text-[11px] text-slate-200 mt-0.5 leading-snug">
                    {notification.body}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Mobile In-App Top Bar */}
          <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 z-20">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                WP
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-slate-900 block leading-none">WorkPulse</span>
                {currentUser && (
                  <span className="text-[10px] text-slate-500 font-medium">
                    {currentUser.isManager ? 'Manager Portal' : 'Employee Portal'}
                  </span>
                )}
              </div>
            </div>

            {currentUser && (
              <div className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[11px] font-semibold text-slate-700 max-w-[110px] truncate">
                  {currentUser.name}
                </span>
              </div>
            )}
          </div>

          {/* Scrollable Viewport Body */}
          <div className="flex-1 overflow-y-auto overscroll-contain px-2.5 py-3.5 sm:px-3 sm:py-4 space-y-3.5 pb-6">
            {children}
          </div>

          {/* Native Bottom Tab Navigation (Only shown when logged in) */}
          {currentUser && (
            <MobileBottomNav isIOSTheme={isIOS} />
          )}

          {/* Native Home Indicator Bar (iOS) or Gesture Bar (Android) */}
          <div className="h-5 w-full bg-white flex items-center justify-center shrink-0">
            {isIOS ? (
              <div className="w-32 h-1 bg-slate-800 rounded-full"></div>
            ) : (
              <div className="w-20 h-1 bg-neutral-400 rounded-full"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
