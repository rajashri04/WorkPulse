import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Employee, 
  AttendanceRequest, 
  DailyPresenceRecord, 
  DailyPresenceStatus,
  Department
} from '../types';
import { INITIAL_EMPLOYEES, INITIAL_REQUESTS } from '../data/mockData';
import { TODAY_DATE, isDateInRange, calculateBusinessDays } from '../utils/dateUtils';

interface AttendanceContextType {
  currentUser: Employee | null;
  setCurrentUser: (emp: Employee | null) => void;
  login: (employeeId: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: 'EMPLOYEE' | 'MANAGER' | null;
  employees: Employee[];
  requests: AttendanceRequest[];
  applyRequest: (data: {
    type: 'LEAVE' | 'WFH';
    leaveCategory?: any;
    wfhCategory?: any;
    startDate: string;
    endDate: string;
    isHalfDay: boolean;
    halfDayPeriod?: 'AM' | 'PM';
    reason: string;
    deliverablesSummary?: string;
    handoverPersonId?: string;
    emergencyPhone?: string;
  }) => { success: boolean; message?: string };
  approveRequest: (requestId: string, comment?: string) => void;
  rejectRequest: (requestId: string, comment?: string) => void;
  cancelRequest: (requestId: string) => void;
  resetDemoData: () => void;
  getDatePresence: (dateStr: string) => DailyPresenceRecord[];
  getDepartmentConflicts: (
    startDate: string, 
    endDate: string, 
    department: Department, 
    excludeRequestId?: string
  ) => AttendanceRequest[];
  pendingApprovalsCount: number;
}

const STORAGE_KEY_EMPLOYEES = 'workpulse_employees_v1';
const STORAGE_KEY_REQUESTS = 'workpulse_requests_v1';
const STORAGE_KEY_CURRENT_USER = 'workpulse_current_user_v1';

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EMPLOYEES);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_EMPLOYEES;
  });

  const [requests, setRequests] = useState<AttendanceRequest[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_REQUESTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_REQUESTS;
  });

  const [currentUser, setCurrentUserState] = useState<Employee | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) {
        const found = employees.find(e => e.id === saved);
        if (found) return found;
      }
    } catch {
      // fallback
    }
    // Default to Alex Rivera (Employee) for instant start, or null
    return employees[0] || null;
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_EMPLOYEES, JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REQUESTS, JSON.stringify(requests));
  }, [requests]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, currentUser.id);
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUser]);

  const setCurrentUser = (emp: Employee | null) => {
    setCurrentUserState(emp);
  };

  const login = (employeeId: string): boolean => {
    const found = employees.find(e => e.id === employeeId);
    if (found) {
      setCurrentUserState(found);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUserState(null);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_EMPLOYEES);
    localStorage.removeItem(STORAGE_KEY_REQUESTS);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    setEmployees(INITIAL_EMPLOYEES);
    setRequests(INITIAL_REQUESTS);
    setCurrentUserState(INITIAL_EMPLOYEES[0]);
  };

  // Helper to find conflicts in the same department
  const getDepartmentConflicts = (
    startDate: string, 
    endDate: string, 
    department: Department, 
    excludeRequestId?: string
  ): AttendanceRequest[] => {
    return requests.filter(req => {
      if (req.id === excludeRequestId) return false;
      if (req.department !== department) return false;
      if (req.status !== 'APPROVED' && req.status !== 'PENDING') return false;
      
      // Check overlap between [startDate, endDate] and [req.startDate, req.endDate]
      const hasOverlap = (startDate <= req.endDate) && (endDate >= req.startDate);
      return hasOverlap;
    });
  };

  const applyRequest = (data: {
    type: 'LEAVE' | 'WFH';
    leaveCategory?: any;
    wfhCategory?: any;
    startDate: string;
    endDate: string;
    isHalfDay: boolean;
    halfDayPeriod?: 'AM' | 'PM';
    reason: string;
    deliverablesSummary?: string;
    handoverPersonId?: string;
    emergencyPhone?: string;
  }): { success: boolean; message?: string } => {
    if (!currentUser) {
      return { success: false, message: 'You must be logged in to submit a request.' };
    }

    const days = calculateBusinessDays(data.startDate, data.endDate, data.isHalfDay);
    if (days <= 0) {
      return { success: false, message: 'Invalid date selection. End date must be on or after start date.' };
    }

    // Handover employee lookup
    let handoverName = '';
    if (data.handoverPersonId) {
      const ho = employees.find(e => e.id === data.handoverPersonId);
      if (ho) handoverName = ho.name;
    }

    const newReqId = `req-${Date.now()}`;
    const newRequest: AttendanceRequest = {
      id: newReqId,
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      department: currentUser.department,
      employeeAvatar: currentUser.avatar,
      type: data.type,
      leaveCategory: data.leaveCategory,
      wfhCategory: data.wfhCategory,
      startDate: data.startDate,
      endDate: data.endDate,
      daysCount: days,
      isHalfDay: data.isHalfDay,
      halfDayPeriod: data.halfDayPeriod,
      reason: data.reason,
      deliverablesSummary: data.deliverablesSummary,
      handoverPersonId: data.handoverPersonId,
      handoverPersonName: handoverName,
      emergencyPhone: data.emergencyPhone,
      status: 'PENDING',
      appliedAt: new Date().toISOString(),
    };

    setRequests(prev => [newRequest, ...prev]);

    return { success: true, message: 'Request submitted successfully. Manager will review.' };
  };

  const approveRequest = (requestId: string, comment?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;

      // Deduct quota if approving
      if (req.status !== 'APPROVED') {
        setEmployees(empList => empList.map(emp => {
          if (emp.id !== req.employeeId) return emp;
          const balances = { ...emp.leaveBalances };
          if (req.type === 'LEAVE') {
            if (req.leaveCategory === 'ANNUAL') {
              balances.paidLeaveUsed += req.daysCount;
            } else if (req.leaveCategory === 'SICK') {
              balances.sickLeaveUsed += req.daysCount;
            } else if (req.leaveCategory === 'CASUAL') {
              balances.casualLeaveUsed += req.daysCount;
            }
          } else if (req.type === 'WFH') {
            balances.wfhUsedThisMonth += req.daysCount;
          }
          return { ...emp, leaveBalances: balances };
        }));
      }

      return {
        ...req,
        status: 'APPROVED',
        reviewedAt: new Date().toISOString(),
        reviewedBy: currentUser?.name || 'Manager',
        managerComment: comment || 'Approved.',
      };
    }));
  };

  const rejectRequest = (requestId: string, comment?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      return {
        ...req,
        status: 'REJECTED',
        reviewedAt: new Date().toISOString(),
        reviewedBy: currentUser?.name || 'Manager',
        managerComment: comment || 'Request declined by manager.',
      };
    }));
  };

  const cancelRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id !== requestId) return req;
      return {
        ...req,
        status: 'CANCELLED',
      };
    }));
  };

  // Helper to build daily presence record for any specific date
  const getDatePresence = (dateStr: string): DailyPresenceRecord[] => {
    return employees.map(emp => {
      // Find active approved request on this date for this employee
      const activeReq = requests.find(req => 
        req.employeeId === emp.id && 
        req.status === 'APPROVED' && 
        isDateInRange(dateStr, req.startDate, req.endDate)
      );

      let status: DailyPresenceStatus = 'IN_OFFICE';
      let halfDay: 'AM' | 'PM' | undefined = undefined;
      let categoryLabel = '';

      if (activeReq) {
        if (activeReq.type === 'LEAVE') {
          status = 'ON_LEAVE';
          categoryLabel = activeReq.leaveCategory ? `${activeReq.leaveCategory.charAt(0) + activeReq.leaveCategory.slice(1).toLowerCase()} Leave` : 'On Leave';
        } else if (activeReq.type === 'WFH') {
          status = 'WFH';
          categoryLabel = activeReq.isHalfDay 
            ? `WFH (${activeReq.halfDayPeriod === 'AM' ? 'Morning' : 'Afternoon'})` 
            : 'Work From Home';
          halfDay = activeReq.halfDayPeriod;
        }
      }

      return {
        employee: emp,
        status,
        request: activeReq,
        halfDay,
        categoryLabel,
      };
    });
  };

  const pendingApprovalsCount = requests.filter(r => r.status === 'PENDING').length;
  const isAuthenticated = Boolean(currentUser);
  const userRole = currentUser ? (currentUser.isManager ? 'MANAGER' : 'EMPLOYEE') : null;

  return (
    <AttendanceContext.Provider value={{
      currentUser,
      setCurrentUser,
      login,
      logout,
      isAuthenticated,
      userRole,
      employees,
      requests,
      applyRequest,
      approveRequest,
      rejectRequest,
      cancelRequest,
      resetDemoData,
      getDatePresence,
      getDepartmentConflicts,
      pendingApprovalsCount,
    }}>
      {children}
    </AttendanceContext.Provider>
  );
};

export const useAttendance = () => {
  const context = useContext(AttendanceContext);
  if (!context) {
    throw new Error('useAttendance must be used within an AttendanceProvider');
  }
  return context;
};
