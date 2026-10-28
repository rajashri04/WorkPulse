package com.workpulse.app.ui

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ExitToApp
import androidx.compose.material.icons.filled.People
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.workpulse.app.data.Role
import com.workpulse.app.ui.screens.EmployeeScreen
import com.workpulse.app.ui.screens.ManagerScreen
import com.workpulse.app.viewmodel.WorkPulseViewModel

class MainActivity : ComponentActivity() {
    private val viewModel: WorkPulseViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            WorkPulseNativeApp(viewModel)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun WorkPulseNativeApp(viewModel: WorkPulseViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    val isManager = uiState.currentUser.role == Role.MANAGER

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Box(
                            modifier = Modifier
                                .size(28.dp)
                                .background(Color(0xFF0F172A), shape = androidx.compose.foundation.shape.RoundedCornerShape(6.dp)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("WP", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 11.sp)
                        }
                        Column {
                            Text("WorkPulse", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Color(0xFF0F172A))
                            Text(
                                if (isManager) "Manager Portal" else "Employee Portal",
                                fontSize = 10.sp,
                                color = Color(0xFF64748B)
                            )
                        }
                    }
                },
                actions = {
                    // Role Switcher chip for testing between Employee and Manager
                    AssistChip(
                        onClick = {
                            viewModel.switchRole(if (isManager) Role.EMPLOYEE else Role.MANAGER)
                        },
                        label = {
                            Text(
                                if (isManager) "Switch to Employee" else "Switch to Manager",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold
                            )
                        }
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = Color.White)
            )
        },
        bottomBar = {
            // Native Bottom Navigation Bar with single Sign Out
            NavigationBar(
                containerColor = Color.White,
                tonalElevation = 8.dp
            ) {
                NavigationBarItem(
                    selected = !isManager,
                    onClick = { viewModel.switchRole(Role.EMPLOYEE) },
                    icon = { Icon(Icons.Default.Person, contentDescription = "Employee") },
                    label = { Text("Employee", fontSize = 11.sp) }
                )
                NavigationBarItem(
                    selected = isManager,
                    onClick = { viewModel.switchRole(Role.MANAGER) },
                    icon = { Icon(Icons.Default.People, contentDescription = "Manager") },
                    label = { Text("Manager", fontSize = 11.sp) }
                )
                NavigationBarItem(
                    selected = false,
                    onClick = { viewModel.logout() },
                    icon = { Icon(Icons.Default.ExitToApp, contentDescription = "Sign Out", tint = Color(0xFFDC2626)) },
                    label = { Text("Sign Out", fontSize = 11.sp, color = Color(0xFFDC2626)) }
                )
            }
        }
    ) { padding ->
        Box(modifier = Modifier.padding(padding)) {
            if (isManager) {
                ManagerScreen(viewModel)
            } else {
                EmployeeScreen(viewModel)
            }
        }
    }
}
