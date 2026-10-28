package com.workpulse.app.data

import com.google.firebase.Timestamp
import com.google.firebase.firestore.DocumentId

enum class Role {
    EMPLOYEE,
    MANAGER
}

enum class LeaveType(val label: String) {
    CASUAL("Casual Leave"),
    SICK("Sick Leave"),
    PAID("Paid Leave"),
    WFH("Work From Home")
}

enum class LeaveStatus {
    PENDING,
    APPROVED,
    REJECTED
}

data class User(
    @DocumentId val id: String = "",
    val name: String = "",
    val email: String = "",
    val role: Role = Role.EMPLOYEE,
    val department: String = "Engineering",
    val avatarUrl: String = "",
    val remainingCasual: Int = 12,
    val remainingSick: Int = 8,
    val remainingPaid: Int = 15,
    val remainingWfh: Int = 24
)

data class LeaveRequest(
    @DocumentId val id: String = "",
    val userId: String = "",
    val userName: String = "",
    val userRole: String = "Employee",
    val type: LeaveType = LeaveType.CASUAL,
    val startDate: String = "",
    val endDate: String = "",
    val daysCount: Int = 1,
    val reason: String = "",
    val status: LeaveStatus = LeaveStatus.PENDING,
    val createdAt: Timestamp? = null,
    val reviewedBy: String? = null,
    val reviewNote: String? = null
)

data class AttendanceRecord(
    @DocumentId val id: String = "",
    val userId: String = "",
    val userName: String = "",
    val date: String = "",
    val checkInTime: String? = null,
    val checkOutTime: String? = null,
    val status: String = "PRESENT", // PRESENT, ON_LEAVE, WFH, ABSENT
    val department: String = "Engineering"
)
