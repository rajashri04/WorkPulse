import React, { useState } from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Avatar } from './Avatar';
import { 
  User, 
  ShieldCheck, 
  ArrowRight, 
  Briefcase, 
  CheckSquare, 
  Building2, 
  Lock, 
  Sparkles,
  Smartphone
} from 'lucide-react';

interface LoginScreenProps {
  onOpenPackagingModal?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onOpenPackagingModal }) => {
  const { employees, login } = useAttendance();
  const [activePortal, setActivePortal] = useState<'EMPLOYEE' | 'MANAGER'>('EMPLOYEE');

  // Filter employees vs managers
  const employeeAccounts = employees.filter(e => !e.isManager);
  const managerAccounts = employees.filter(e => e.isManager);

  const [selectedEmpId, setSelectedEmpId] = useState(
    employeeAccounts[0]?.id || ''
  );
  const [selectedMgrId, setSelectedMgrId] = useState(
    managerAccounts[0]?.id || ''
  );

  const handleLogin = (idToUse?: string) => {
    const id = idToUse || (activePortal === 'EMPLOYEE' ? selectedEmpId : selectedMgrId);
    if (id) {
      login(id);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto py-4 px-3 sm:px-4">
      {/* App Branding Header */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white font-bold text-lg shadow-md mb-3">
          WP
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          WorkPulse Enterprise
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Secure Role-Based Portal for Employee Leave/WFH Applications & Manager Team Approvals
        </p>
      </div>

      {/* Role Selection Switcher (2 Distinct Portals) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="grid grid-cols-2 p-1.5 bg-slate-100/80 border-b border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setActivePortal('EMPLOYEE')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold transition-all ${
              activePortal === 'EMPLOYEE'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-indigo-600" />
            <span>Employee Login</span>
          </button>

          <button
            type="button"
            onClick={() => setActivePortal('MANAGER')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl font-bold transition-all ${
              activePortal === 'MANAGER'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Manager Login</span>
          </button>
        </div>

        {/* Portal Information Banner */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/50">
          {activePortal === 'EMPLOYEE' ? (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>Employee Account Gateway</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                As an employee, you can <strong>only apply for leave / work from home</strong> and <strong>view your requests and quota balance</strong>. No team management access is granted.
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                <span>✓ Apply Leave & WFH</span>
                <span>·</span>
                <span>✓ Personal Requests</span>
                <span>·</span>
                <span>✓ Leave Balances</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>Manager Account Gateway</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                As a manager, you can <strong>only review pending approvals</strong>, <strong>view current team attendance roster</strong>, and <strong>audit past decisions</strong>.
              </p>
              <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-500">
                <span>✓ Pending Approvals</span>
                <span>·</span>
                <span>✓ Live Attendance</span>
                <span>·</span>
                <span>✓ Past Requests</span>
              </div>
            </div>
          )}
        </div>

        {/* Account Selection Form */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select {activePortal === 'EMPLOYEE' ? 'Employee' : 'Manager'} Account:
            </label>

            <div className="space-y-2 max-h-[220px] overflow-y-auto">
              {(activePortal === 'EMPLOYEE' ? employeeAccounts : managerAccounts).map(emp => {
                const isSelected = activePortal === 'EMPLOYEE' 
                  ? selectedEmpId === emp.id 
                  : selectedMgrId === emp.id;

                return (
                  <div
                    key={emp.id}
                    onClick={() => {
                      if (activePortal === 'EMPLOYEE') setSelectedEmpId(emp.id);
                      else setSelectedMgrId(emp.id);
                    }}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/60 ring-1 ring-indigo-500'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar src={emp.avatar} name={emp.name} size="md" />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">
                          {emp.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {emp.role} · {emp.department}
                        </div>
                      </div>
                    </div>

                    <div className="shrink-0 ml-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'
                      }`}>
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Login Button */}
          <button
            onClick={() => handleLogin()}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-slate-800 active:scale-98 transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            <span>Log In as {activePortal === 'EMPLOYEE' ? 'Employee' : 'Manager'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1-Click Fast Switch Bar */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 bg-white/70 p-3 rounded-xl border border-slate-200">
        <span>Instant Quick Logins:</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActivePortal('EMPLOYEE');
              handleLogin('emp-1'); // Alex Rivera
            }}
            className="px-2.5 py-1 text-[11px] font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-2xs"
          >
            Alex Rivera (Emp)
          </button>
          <button
            onClick={() => {
              setActivePortal('MANAGER');
              handleLogin('emp-2'); // Sarah Chen
            }}
            className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 shadow-2xs"
          >
            Sarah Chen (Mgr)
          </button>
        </div>
      </div>

      {onOpenPackagingModal && (
        <div className="mt-4 text-center">
          <button
            onClick={onOpenPackagingModal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Install on Real Android / iOS Phone</span>
          </button>
        </div>
      )}
    </div>
  );
};
