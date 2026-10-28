package com.workpulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.HomeWork
import androidx.compose.material.icons.filled.LocalHospital
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.workpulse.app.data.LeaveRequest
import com.workpulse.app.data.LeaveStatus
import com.workpulse.app.data.LeaveType
import com.workpulse.app.viewmodel.WorkPulseViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EmployeeScreen(viewModel: WorkPulseViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    var showApplySheet by remember { mutableStateOf(false) }

    val myRequests = uiState.allRequests.filter { it.userId == uiState.currentUser.id }

    Scaffold(
        floatingActionButton = {
            ExtendedFloatingActionButton(
                onClick = { showApplySheet = true },
                containerColor = Color(0xFF0F172A),
                contentColor = Color.White,
                icon = { Icon(Icons.Default.Add, contentDescription = "Apply") },
                text = { Text("Apply Leave / WFH", fontWeight = FontWeight.Bold) }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(Color(0xFFF8FAFC))
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Welcome Header
            item {
                Column {
                    Text(
                        text = "Hello, ${uiState.currentUser.name} 👋",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0F172A)
                    )
                    Text(
                        text = "Employee Portal • Remaining Quota",
                        fontSize = 12.sp,
                        color = Color(0xFF64748B)
                    )
                }
            }

            // Swipable / Scrollable Quota Deck
            item {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(12.dp),
                    contentPadding = PaddingValues(vertical = 4.dp)
                ) {
                    item {
                        QuotaCard("Casual Leave", "${uiState.currentUser.remainingCasual} Days", Color(0xFF4F46E5), Color(0xFFEEF2FF))
                    }
                    item {
                        QuotaCard("Sick Leave", "${uiState.currentUser.remainingSick} Days", Color(0xFFDC2626), Color(0xFFFEF2F2))
                    }
                    item {
                        QuotaCard("Paid Leave", "${uiState.currentUser.remainingPaid} Days", Color(0xFF059669), Color(0xFFECFDF5))
                    }
                    item {
                        QuotaCard("Work From Home", "${uiState.currentUser.remainingWfh} Days", Color(0xFFD97706), Color(0xFFFFFBEB))
                    }
                }
            }

            // Section Title: My Requests
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "My Requests",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0F172A)
                    )
                    Text(
                        text = "${myRequests.size} Total",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color(0xFF64748B)
                    )
                }
            }

            if (myRequests.isEmpty()) {
                item {
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(32.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text("No leave or WFH requests yet.", color = Color(0xFF64748B), fontSize = 13.sp)
                            Spacer(Modifier.height(8.dp))
                            Text(
                                "Tap the button below to apply for your first leave or WFH.",
                                color = Color(0xFF94A3B8),
                                fontSize = 11.sp
                            )
                        }
                    }
                }
            } else {
                items(myRequests) { req ->
                    RequestCard(req)
                }
            }
        }
    }

    if (showApplySheet) {
        ModalBottomSheet(
            onDismissRequest = { showApplySheet = false },
            containerColor = Color.White
        ) {
            ApplyLeaveBottomSheet(
                onDismiss = { showApplySheet = false },
                onSubmit = { type, start, end, days, reason ->
                    viewModel.submitLeaveRequest(type, start, end, days, reason) {
                        showApplySheet = false
                    }
                }
            )
        }
    }
}

@Composable
fun QuotaCard(title: String, remaining: String, accentColor: Color, bgColor: Color) {
    Card(
        modifier = Modifier
            .width(150.dp)
            .height(110.dp),
        colors = CardDefaults.cardColors(containerColor = bgColor),
        shape = RoundedCornerShape(16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Box(
                modifier = Modifier
                    .size(28.dp)
                    .clip(CircleShape)
                    .background(accentColor.copy(alpha = 0.2f)),
                contentAlignment = Alignment.Center
            ) {
                Box(Modifier.size(8.dp).clip(CircleShape).background(accentColor))
            }
            Column {
                Text(remaining, fontWeight = FontWeight.ExtraBold, fontSize = 18.sp, color = accentColor)
                Text(title, fontSize = 11.sp, fontWeight = FontWeight.Medium, color = Color(0xFF475569))
            }
        }
    }
}

@Composable
fun RequestCard(request: LeaveRequest) {
    val (statusColor, statusBg) = when (request.status) {
        LeaveStatus.PENDING -> Pair(Color(0xFFD97706), Color(0xFFFEF3C7))
        LeaveStatus.APPROVED -> Pair(Color(0xFF16A34A), Color(0xFFDCFCE7))
        LeaveStatus.REJECTED -> Pair(Color(0xFFDC2626), Color(0xFFFEE2E2))
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        shape = RoundedCornerShape(14.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Column(modifier = Modifier.padding(14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = request.type.label,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = Color(0xFF0F172A)
                )
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(6.dp))
                        .background(statusBg)
                        .padding(horizontal = 8.dp, vertical = 3.dp)
                ) {
                    Text(
                        text = request.status.name,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        color = statusColor
                    )
                }
            }

            Spacer(Modifier.height(6.dp))
            Text(
                text = "${request.startDate} to ${request.endDate} (${request.daysCount} days)",
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium,
                color = Color(0xFF64748B)
            )

            if (request.reason.isNotBlank()) {
                Spacer(Modifier.height(4.dp))
                Text(
                    text = "\"${request.reason}\"",
                    fontSize = 11.sp,
                    color = Color(0xFF94A3B8)
                )
            }
        }
    }
}

@Composable
fun ApplyLeaveBottomSheet(
    onDismiss: () -> Unit,
    onSubmit: (type: LeaveType, start: String, end: String, days: Int, reason: String) -> Unit
) {
    var selectedType by remember { mutableStateOf(LeaveType.CASUAL) }
    var startDate by remember { mutableStateOf("2026-11-01") }
    var endDate by remember { mutableStateOf("2026-11-02") }
    var reason by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(24.dp)
            .padding(bottom = 32.dp)
    ) {
        Text("Apply Leave or WFH", fontWeight = FontWeight.Bold, fontSize = 18.sp, color = Color(0xFF0F172A))
        Spacer(Modifier.height(16.dp))

        // Type selector
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            LeaveType.values().forEach { type ->
                FilterChip(
                    selected = selectedType == type,
                    onClick = { selectedType = type },
                    label = { Text(type.label, fontSize = 11.sp) }
                )
            }
        }

        Spacer(Modifier.height(16.dp))
        OutlinedTextField(
            value = startDate,
            onValueChange = { startDate = it },
            label = { Text("Start Date (YYYY-MM-DD)") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            value = endDate,
            onValueChange = { endDate = it },
            label = { Text("End Date (YYYY-MM-DD)") },
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(8.dp))
        OutlinedTextField(
            value = reason,
            onValueChange = { reason = it },
            label = { Text("Reason for request") },
            modifier = Modifier.fillMaxWidth(),
            minLines = 2
        )

        Spacer(Modifier.height(20.dp))
        Button(
            onClick = { onSubmit(selectedType, startDate, endDate, 2, reason) },
            modifier = Modifier.fillMaxWidth(),
            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0F172A)),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text("Submit Request", fontWeight = FontWeight.Bold)
        }
    }
}
