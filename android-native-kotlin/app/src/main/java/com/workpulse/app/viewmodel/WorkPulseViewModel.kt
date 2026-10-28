package com.workpulse.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.workpulse.app.data.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class WorkPulseUiState(
    val currentUser: User = User(
        id = "emp_1",
        name = "Alex Rivera",
        email = "alex.rivera@workpulse.com",
        role = Role.EMPLOYEE,
        department = "Mobile Engineering"
    ),
    val allRequests: List<LeaveRequest> = emptyList(),
    val attendanceRecords: List<AttendanceRecord> = emptyList(),
    val selectedTab: Int = 0,
    val isLoading: Boolean = false,
    val errorMessage: String? = null
)

class WorkPulseViewModel(
    private val repository: WorkPulseRepository = WorkPulseRepository()
) : ViewModel() {

    private val _uiState = MutableStateFlow(WorkPulseUiState())
    val uiState: StateFlow<WorkPulseUiState> = _uiState.asStateFlow()

    init {
        observeRequests()
        observeAttendance()
    }

    private fun observeRequests() {
        viewModelScope.launch {
            repository.getRequestsFlow().collect { requests ->
                _uiState.value = _uiState.value.copy(allRequests = requests)
            }
        }
    }

    private fun observeAttendance() {
        viewModelScope.launch {
            repository.getAttendanceFlow().collect { attendance ->
                _uiState.value = _uiState.value.copy(attendanceRecords = attendance)
            }
        }
    }

    fun selectTab(index: Int) {
        _uiState.value = _uiState.value.copy(selectedTab = index)
    }

    fun switchRole(role: Role) {
        val user = if (role == Role.EMPLOYEE) {
            User(id = "emp_1", name = "Alex Rivera", email = "alex.rivera@workpulse.com", role = Role.EMPLOYEE)
        } else {
            User(id = "mgr_1", name = "Sarah Connor", email = "sarah.connor@workpulse.com", role = Role.MANAGER)
        }
        _uiState.value = _uiState.value.copy(currentUser = user, selectedTab = 0)
    }

    fun submitLeaveRequest(
        type: LeaveType,
        startDate: String,
        endDate: String,
        daysCount: Int,
        reason: String,
        onSuccess: () -> Unit
    ) {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true)
            val request = LeaveRequest(
                userId = _uiState.value.currentUser.id,
                userName = _uiState.value.currentUser.name,
                userRole = _uiState.value.currentUser.role.name,
                type = type,
                startDate = startDate,
                endDate = endDate,
                daysCount = daysCount,
                reason = reason,
                status = LeaveStatus.PENDING
            )
            val result = repository.submitRequest(request)
            _uiState.value = _uiState.value.copy(isLoading = false)
            if (result.isSuccess) {
                onSuccess()
            } else {
                _uiState.value = _uiState.value.copy(errorMessage = result.exceptionOrNull()?.localizedMessage)
            }
        }
    }

    fun reviewRequest(requestId: String, status: LeaveStatus, note: String = "") {
        viewModelScope.launch {
            repository.updateRequestStatus(
                requestId = requestId,
                newStatus = status,
                reviewerName = _uiState.value.currentUser.name,
                reviewNote = note
            )
        }
    }

    fun logout() {
        // Reset or navigate back to role login screen
        _uiState.value = _uiState.value.copy(
            currentUser = User(id = "", name = "", role = Role.EMPLOYEE)
        )
    }
}
