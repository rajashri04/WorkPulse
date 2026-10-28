import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { 
  Employee, 
  AttendanceRequest, 
  DailyPresenceRecord, 
  DailyPresenceStatus,
  Department
} from '../types';
import { INITIAL_EMPLOYEES, INITIAL_REQUESTS } from '../data/mockData';
import { TODAY_DATE, isDateInRange, calculateBusinessDays } from '../utils/dateUtils';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';

interface AttendanceContextType {
  currentUser: Employee | null;
  setCurrentUser: (emp: Employee | null) => void;
  login: (employeeId: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
  userRole: 'EMPLOYEE' | 'MANAGER' | null;
  employees: Employee[];
  requests: AttendanceRequest[];
  isCloudSyncActive: boolean;
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
  managerActiveTab: 'APPROVALS' | 'ATTENDANCE' | 'PAST_REQUESTS';
  setManagerActiveTab: (tab: 'APPROVALS' | 'ATTENDANCE' | 'PAST_REQUESTS') => void;
  employeeActiveTab: 'MY_REQUESTS' | 'APPLY';
  setEmployeeActiveTab: (tab: 'MY_REQUESTS' | 'APPLY') => void;
}

const STORAGE_KEY_CURRENT_USER = 'workpulse_current_user_v1';

const AttendanceContext = createContext<AttendanceContextType | undefined>(undefined);

export const AttendanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [employees, setEmployees] = useState<Employee[]>(INITIAL_EMPLOYEES);
  const [requests, setRequests] = useState<AttendanceRequest[]>(INITIAL_REQUESTS);
  const [isCloudSyncActive, setIsCloudSyncActive] = useState<boolean>(false);
  const hasSeededRef = useRef<boolean>(false);

  const [currentUser, setCurrentUserState] = useState<Employee | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
      if (saved) {
        const found = INITIAL_EMPLOYEES.find(e => e.id === saved);
        if (found) return found;
      }
    } catch {
      // fallback
    }
    return INITIAL_EMPLOYEES[0] || null;
  });

  const [managerActiveTab, setManagerActiveTab] = useState<'APPROVALS' | 'ATTENDANCE' | 'PAST_REQUESTS'>('APPROVALS');
  const [employeeActiveTab, setEmployeeActiveTab] = useState<'MY_REQUESTS' | 'APPLY'>('MY_REQUESTS');

  // Real-time Firestore Listeners
  useEffect(() => {
    const employeesCol = collection(db, 'employees');
    const requestsCol = collection(db, 'requests');

    // 1. Subscribe to Employees
    const unsubEmployees = onSnapshot(employeesCol, async (snapshot) => {
      setIsCloudSyncActive(true);
      if (snapshot.empty && !hasSeededRef.current) {
        hasSeededRef.current = true;
        // Seed initial employees into Firestore
        try {
          for (const emp of INITIAL_EMPLOYEES) {
            await setDoc(doc(db, 'employees', emp.id), emp);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'employees');
        }
      } else if (!snapshot.empty) {
        const loaded: Employee[] = [];
        snapshot.forEach((d) => loaded.push(d.data() as Employee));
        setEmployees(loaded);

        // Keep current user in sync with updated balances
        setCurrentUserState((prev) => {
          if (!prev) return prev;
          const match = loaded.find((e) => e.id === prev.id);
          return match || prev;
        });
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'employees');
    });

    // 2. Subscribe to Requests
    const unsubRequests = onSnapshot(requestsCol, async (snapshot) => {
      setIsCloudSyncActive(true);
      if (snapshot.empty && !hasSeededRef.current) {
        hasSeededRef.current = true;
        // Seed initial requests into Firestore
        try {
          for (const req of INITIAL_REQUESTS) {
            await setDoc(doc(db, 'requests', req.id), req);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, 'requests');
        }
      } else if (!snapshot.empty) {
        const loaded: AttendanceRequest[] = [];
        snapshot.forEach((d) => loaded.push(d.data() as AttendanceRequest));
        // Sort newest first
        loaded.sort((a, b) => new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime());
        setRequests(loaded);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'requests');
    });

    return () => {
      unsubEmployees();
      unsubRequests();
    };
  }, []);

  // Sync active user to localStorage for instant reload
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, currentUser.id);
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  }, [currentUser]);

  const setCurrentUser = (emp: Employee | null) => {
    setCurrentUserState(emp);
    if (emp?.isManager) {
      setManagerActiveTab('APPROVALS');
    } else if (emp) {
      setEmployeeActiveTab('MY_REQUESTS');
    }
  };

  const login = (employeeId: string): boolean => {
    const found = employees.find(e => e.id === employeeId);
    if (found) {
      setCurrentUserState(found);
      if (found.isManager) {
        setManagerActiveTab('APPROVALS');
      } else {
        setEmployeeActiveTab('MY_REQUESTS');
      }
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUserState(null);
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  };

  const resetDemoData = async () => {
    try {
      for (const emp of INITIAL_EMPLOYEES) {
        await setDoc(doc(db, 'employees', emp.id), emp);
      }
      for (const req of INITIAL_REQUESTS) {
        await setDoc(doc(db, 'requests', req.id), req);
      }
      setCurrentUserState(INITIAL_EMPLOYEES[0]);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'resetDemoData');
    }
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

    // Optimistically update local state & sync to Firestore in real time
    setRequests(prev => [newRequest, ...prev]);
    setDoc(doc(db, 'requests', newReqId), newRequest).catch(err => {
      handleFirestoreError(err, OperationType.WRITE, `requests/${newReqId}`);
    });

    return { success: true, message: 'Request submitted successfully. Manager will review.' };
  };

  const approveRequest = async (requestId: string, comment?: string) => {
    const targetReq = requests.find(r => r.id === requestId);
    if (!targetReq) return;

    const updatedData: Partial<AttendanceRequest> = {
      status: 'APPROVED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser?.name || 'Manager',
      managerComment: comment || 'Approved.',
    };

    // Optimistic update
    setRequests(prev => prev.map(req => req.id === requestId ? { ...req, ...updatedData } : req));

    // Deduct quota if approving
    if (targetReq.status !== 'APPROVED') {
      const emp = employees.find(e => e.id === targetReq.employeeId);
      if (emp) {
        const balances = { ...emp.leaveBalances };
        if (targetReq.type === 'LEAVE') {
          if (targetReq.leaveCategory === 'ANNUAL') {
            balances.paidLeaveUsed += targetReq.daysCount;
          } else if (targetReq.leaveCategory === 'SICK') {
            balances.sickLeaveUsed += targetReq.daysCount;
          } else if (targetReq.leaveCategory === 'CASUAL') {
            balances.casualLeaveUsed += targetReq.daysCount;
          }
        } else if (targetReq.type === 'WFH') {
          balances.wfhUsedThisMonth += targetReq.daysCount;
        }

        setEmployees(empList => empList.map(e => e.id === emp.id ? { ...e, leaveBalances: balances } : e));
        
        updateDoc(doc(db, 'employees', emp.id), { leaveBalances: balances }).catch(err => {
          handleFirestoreError(err, OperationType.UPDATE, `employees/${emp.id}`);
        });
      }
    }

    // Update request in Firestore
    updateDoc(doc(db, 'requests', requestId), updatedData).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `requests/${requestId}`);
    });
  };

  const rejectRequest = (requestId: string, comment?: string) => {
    const updatedData: Partial<AttendanceRequest> = {
      status: 'REJECTED',
      reviewedAt: new Date().toISOString(),
      reviewedBy: currentUser?.name || 'Manager',
      managerComment: comment || 'Request declined by manager.',
    };

    setRequests(prev => prev.map(req => req.id === requestId ? { ...req, ...updatedData } : req));
    updateDoc(doc(db, 'requests', requestId), updatedData).catch(err => {
      handleFirestoreError(err, OperationType.UPDATE, `requests/${requestId}`);
    });
  };

  const cancelRequest = (requestId: string) => {
    setRequests(prev => prev.map(req => req.id === requestId ? { ...req, status: 'CANCELLED' } : req));
    deleteDoc(doc(db, 'requests', requestId)).catch(err => {
      handleFirestoreError(err, OperationType.DELETE, `requests/${requestId}`);
    });
  };

  // Helper to build daily presence record for any specific date
  const getDatePresence = (dateStr: string): DailyPresenceRecord[] => {
    return employees.map(emp => {
      const activeReq = requests.find(req => 
        req.employeeId === emp.id && 
        req.status === 'APPROVED' && 
        isDateInRange(dateStr, req.startDate, req.endDate)
      );

      let status: DailyPresenceStatus = 'IN_OFFICE';
      let halfDay: 'AM' | 'PM' | undefined = undefined;
      let categoryLabel = '';

      if (activeReq) {
        if (activeReq.type === 'WFH') {
          status = 'WFH';
          halfDay = activeReq.isHalfDay ? activeReq.halfDayPeriod : undefined;
          categoryLabel = activeReq.isHalfDay ? `WFH (${activeReq.halfDayPeriod})` : 'Work From Home';
        } else {
          status = 'ON_LEAVE';
          halfDay = activeReq.isHalfDay ? activeReq.halfDayPeriod : undefined;
          categoryLabel = `${activeReq.leaveCategory || 'Personal'} Leave`;
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
      isCloudSyncActive,
      applyRequest,
      approveRequest,
      rejectRequest,
      cancelRequest,
      resetDemoData,
      getDatePresence,
      getDepartmentConflicts,
      pendingApprovalsCount,
      managerActiveTab,
      setManagerActiveTab,
      employeeActiveTab,
      setEmployeeActiveTab,
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
