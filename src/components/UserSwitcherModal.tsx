import React from 'react';
import { useAttendance } from '../context/AttendanceContext';
import { Avatar } from './Avatar';
import { X, RotateCcw, Check, ShieldCheck, User } from 'lucide-react';

interface UserSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserSwitcherModal: React.FC<UserSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, setCurrentUser, employees, resetDemoData } = useAttendance();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div 
        className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="switch-user-title"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 id="switch-user-title" className="text-base font-semibold text-slate-900">
              Switch Active User
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Switch between employees and managers to test approval and application flows.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close user switcher"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[380px] overflow-y-auto p-4 space-y-2">
          {employees.map(emp => {
            const isSelected = emp.id === currentUser?.id;
            return (
              <button
                key={emp.id}
                onClick={() => {
                  setCurrentUser(emp);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors border ${
                  isSelected 
                    ? 'border-indigo-600 bg-indigo-50/50' 
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar src={emp.avatar} name={emp.name} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-slate-900 truncate">
                        {emp.name}
                      </span>
                      {emp.isManager ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-100/70 px-1.5 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3" />
                          Manager
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                          <User className="w-3 h-3" />
                          Employee
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {emp.role} · {emp.department}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="flex items-center text-indigo-600 font-medium text-xs gap-1 shrink-0 ml-2">
                    <Check className="w-4 h-4" />
                    <span>Active</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-t border-slate-100">
          <button
            onClick={() => {
              if (window.confirm('Reset all demo requests and leave quotas to default state?')) {
                resetDemoData();
                onClose();
              }
            }}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
