export type Department = 
  | 'Engineering' 
  | 'Design & UX' 
  | 'Product' 
  | 'Marketing' 
  | 'Human Resources' 
  | 'Finance';

export interface LeaveBalances {
  paidLeaveTotal: number;
  paidLeaveUsed: number;
  sickLeaveTotal: number;
  sickLeaveUsed: number;
  casualLeaveTotal: number;
  casualLeaveUsed: number;
  wfhMonthlyAllowance: number;
  wfhUsedThisMonth: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: Department;
  avatar: string;
  isManager: boolean;
  managerId?: string;
  phone: string;
  leaveBalances: LeaveBalances;
}

export type RequestType = 'LEAVE' | 'WFH';

export type LeaveCategory = 
  | 'ANNUAL' 
  | 'SICK' 
  | 'CASUAL' 
  | 'BEREAVEMENT' 
  | 'UNPAID';

export type WfhCategory = 
  | 'FULL_DAY' 
  | 'HALF_DAY_AM' 
  | 'HALF_DAY_PM';

export type RequestStatus = 
  | 'PENDING' 
  | 'APPROVED' 
  | 'REJECTED' 
  | 'CANCELLED';

export interface AttendanceRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: Department;
  employeeAvatar: string;
  type: RequestType;
  leaveCategory?: LeaveCategory;
  wfhCategory?: WfhCategory;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  daysCount: number;
  isHalfDay: boolean;
  halfDayPeriod?: 'AM' | 'PM';
  reason: string;
  deliverablesSummary?: string;
  handoverPersonId?: string;
  handoverPersonName?: string;
  emergencyPhone?: string;
  status: RequestStatus;
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  managerComment?: string;
  conflictWarning?: string;
}

export type DailyPresenceStatus = 'IN_OFFICE' | 'WFH' | 'ON_LEAVE';

export interface DailyPresenceRecord {
  employee: Employee;
  status: DailyPresenceStatus;
  request?: AttendanceRequest;
  halfDay?: 'AM' | 'PM';
  categoryLabel?: string;
}
