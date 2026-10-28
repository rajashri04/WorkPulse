package com.workpulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.workpulse.app.data.AttendanceRecord
import com.workpulse.app.data.LeaveRequest
import com.workpulse.app.data.LeaveStatus
import com.workpulse.app.viewmodel.WorkPulseViewModel

@Composable
fun ManagerScreen(viewModel: WorkPulseViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedManagerTab by remember { mutableStateOf(0) } // 0: Approvals, 1: Attendance, 2: Past Requests

    val pendingRequests = uiState.allRequests.filter { it.status == LeaveStatus.PENDING }
    val pastRequests = uiState.allRequests.filter { it.status != LeaveStatus.PENDING }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Color(0xFFF8FAFC))
    ) {
        // Manager Tab Header
        TabRow(
            selectedTabIndex = selectedManagerTab,
            containerColor = Color.White,
            contentColor = Color(0xFF0F172A)
        ) {
            Tab(
                selected = selectedManagerTab == 0,
                onClick = { selectedManagerTab = 0 },
                text = {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        Text("Approvals", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                        if (pendingRequests.isNotEmpty()) {
                            Badge(containerColor = Color(0xFFDC2626)) {
                                Text("${pendingRequests.size}")
                            }
                        }
                    }
                }
            )
            Tab(
                selected = selectedManagerTab == 1,
                onClick = { selectedManagerTab = 1 },
                text = { Text("Attendance", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
            )
            Tab(
                selected = selectedManagerTab == 2,
                onClick = { selectedManagerTab = 2 },
                text = { Text("Past Requests", fontWeight = FontWeight.Bold, fontSize = 12.sp) }
            )
        }

        when (selectedManagerTab) {
            0 -> PendingApprovalsList(pendingRequests, onApprove = {
                viewModel.reviewRequest(it, LeaveStatus.APPROVED)
            }, onReject = {
                viewModel.reviewRequest(it, LeaveStatus.REJECTED)
            })
            1 -> AttendanceDashboardList(uiState.attendanceRecords)
            2 -> PastRequestsList(pastRequests)
        }
    }
}

@Composable
fun PendingApprovalsList(
    requests: List<LeaveRequest>,
    onApprove: (String) -> Unit,
    onReject: (String) -> Unit
) {
    if (requests.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(32.dp),
            contentAlignment = Alignment.Center
        ) {
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Text("All caught up! 🎉", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color(0xFF0F172A))
                Spacer(Modifier.height(4.dp))
                Text("No pending leave or WFH approvals.", fontSize = 12.sp, color = Color(0xFF64748B))
            }
        }
    } else {
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            items(requests) { req ->
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    shape = RoundedCornerShape(16.dp),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(req.userName, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Color(0xFF0F172A))
                                Text("${req.type.label} • ${req.daysCount} days", fontSize = 12.sp, color = Color(0xFF64748B))
                            }
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(Color(0xFFFEF3C7))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text("PENDING", fontSize = 10.sp, fontWeight = FontWeight.Bold, color = Color(0xFFB45309))
                            }
                        }

                        Spacer(Modifier.height(8.dp))
                        Text(
                            text = "Dates: ${req.startDate} to ${req.endDate}",
                            fontSize = 12.sp,
                            color = Color(0xFF334155),
                            fontWeight = FontWeight.Medium
                        )

                        if (req.reason.isNotBlank()) {
                            Spacer(Modifier.height(4.dp))
                            Text(
                                text = "Reason: ${req.reason}",
                                fontSize = 11.sp,
                                color = Color(0xFF64748B)
                            )
                        }

                        Spacer(Modifier.height(14.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = { onReject(req.id) },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = Color(0xFFDC2626)),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Default.Close, contentDescription = "Reject", modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Reject", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                            Button(
                                onClick = { onApprove(req.id) },
                                modifier = Modifier.weight(1f),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF16A34A)),
                                shape = RoundedCornerShape(10.dp)
                            ) {
                                Icon(Icons.Default.Check, contentDescription = "Approve", modifier = Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text("Approve", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun AttendanceDashboardList(attendanceList: List<AttendanceRecord>) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        items(attendanceList) { record ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                shape = RoundedCornerShape(12.dp)
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(14.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(record.userName, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF0F172A))
                        Text(
                            "In: ${record.checkInTime ?: "--:--"} • Out: ${record.checkOutTime ?: "--:--"}",
                            fontSize = 11.sp,
                            color = Color(0xFF64748B)
                        )
                    }

                    val (chipColor, chipBg) = when (record.status) {
                        "PRESENT" -> Pair(Color(0xFF16A34A), Color(0xFFDCFCE7))
                        "WFH" -> Pair(Color(0xFF4F46E5), Color(0xFFEEF2FF))
                        "ON_LEAVE" -> Pair(Color(0xFFD97706), Color(0xFFFEF3C7))
                        else -> Pair(Color(0xFFDC2626), Color(0xFFFEE2E2))
                    }

                    Box(
                        modifier = Modifier
                            .clip(RoundedCornerShape(6.dp))
                            .background(chipBg)
                            .padding(horizontal = 8.dp, vertical = 3.dp)
                    ) {
                        Text(record.status, fontSize = 10.sp, fontWeight = FontWeight.Bold, color = chipColor)
                    }
                }
            }
        }
    }
}

@Composable
fun PastRequestsList(requests: List<LeaveRequest>) {
    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp)
    ) {
        items(requests) { req ->
            RequestCard(req)
        }
    }
}
