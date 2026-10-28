import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  Apple, 
  Terminal, 
  Copy, 
  Check, 
  QrCode, 
  ExternalLink, 
  Layers, 
  Cpu,
  Code2,
  FolderCheck,
  CheckCircle2,
  Play
} from 'lucide-react';

interface NativePackagingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NativePackagingModal: React.FC<NativePackagingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'ANDROID' | 'KOTLIN' | 'CAPACITOR' | 'IOS' | 'PWA'>('ANDROID');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [selectedKotlinFile, setSelectedKotlinFile] = useState<string>('MainActivity');

  if (!isOpen) return null;

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://workpulse.app';

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const kotlinSnippets: Record<string, { path: string; language: string; code: string }> = {
    MainActivity: {
      path: 'android-native-kotlin/app/src/main/java/com/workpulse/app/ui/MainActivity.kt',
      language: 'kotlin',
      code: `package com.workpulse.app.ui

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
            NavigationBar(containerColor = Color.White, tonalElevation = 8.dp) {
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
}`
    },
    EmployeeScreen: {
      path: 'android-native-kotlin/app/src/main/java/com/workpulse/app/ui/screens/EmployeeScreen.kt',
      language: 'kotlin',
      code: `package com.workpulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
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
            item {
                Column {
                    Text("Hello, \${uiState.currentUser.name} 👋", fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    Text("Employee Portal • Remaining Quota", fontSize = 12.sp, color = Color(0xFF64748B))
                }
            }
            item {
                LazyRow(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    item { QuotaCard("Casual Leave", "\${uiState.currentUser.remainingCasual} Days", Color(0xFF4F46E5), Color(0xFFEEF2FF)) }
                    item { QuotaCard("Sick Leave", "\${uiState.currentUser.remainingSick} Days", Color(0xFFDC2626), Color(0xFFFEF2F2)) }
                    item { QuotaCard("Paid Leave", "\${uiState.currentUser.remainingPaid} Days", Color(0xFF059669), Color(0xFFECFDF5)) }
                    item { QuotaCard("Work From Home", "\${uiState.currentUser.remainingWfh} Days", Color(0xFFD97706), Color(0xFFFFFBEB)) }
                }
            }
            item {
                Text("My Requests (\${myRequests.size})", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
            items(myRequests) { req ->
                RequestCard(req)
            }
        }
    }
}`
    },
    ManagerScreen: {
      path: 'android-native-kotlin/app/src/main/java/com/workpulse/app/ui/screens/ManagerScreen.kt',
      language: 'kotlin',
      code: `package com.workpulse.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.workpulse.app.data.LeaveStatus
import com.workpulse.app.viewmodel.WorkPulseViewModel

@Composable
fun ManagerScreen(viewModel: WorkPulseViewModel) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTab by remember { mutableStateOf(0) }

    val pending = uiState.allRequests.filter { it.status == LeaveStatus.PENDING }
    val past = uiState.allRequests.filter { it.status != LeaveStatus.PENDING }

    Column(modifier = Modifier.fillMaxSize().background(Color(0xFFF8FAFC))) {
        TabRow(selectedTabIndex = selectedTab, containerColor = Color.White) {
            Tab(selected = selectedTab == 0, onClick = { selectedTab = 0 }, text = { Text("Approvals (\${pending.size})") })
            Tab(selected = selectedTab == 1, onClick = { selectedTab = 1 }, text = { Text("Attendance") })
            Tab(selected = selectedTab == 2, onClick = { selectedTab = 2 }, text = { Text("Past Requests") })
        }
        when (selectedTab) {
            0 -> PendingApprovalsList(pending, onApprove = { viewModel.reviewRequest(it, LeaveStatus.APPROVED) }, onReject = { viewModel.reviewRequest(it, LeaveStatus.REJECTED) })
            1 -> AttendanceDashboardList(uiState.attendanceRecords)
            2 -> PastRequestsList(past)
        }
    }
}`
    },
    Repository: {
      path: 'android-native-kotlin/app/src/main/java/com/workpulse/app/data/WorkPulseRepository.kt',
      language: 'kotlin',
      code: `package com.workpulse.app.data

import com.google.firebase.Timestamp
import com.google.firebase.firestore.FirebaseFirestore
import com.google.firebase.firestore.Query
import kotlinx.coroutines.channels.awaitClose
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.callbackFlow
import kotlinx.coroutines.tasks.await

class WorkPulseRepository(
    private val firestore: FirebaseFirestore = FirebaseFirestore.getInstance()
) {
    private val requestsCollection = firestore.collection("requests")
    private val attendanceCollection = firestore.collection("attendance")

    fun getRequestsFlow(): Flow<List<LeaveRequest>> = callbackFlow {
        val sub = requestsCollection.orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) { close(error); return@addSnapshotListener }
                val items = snapshot?.documents?.mapNotNull { it.toObject(LeaveRequest::class.java)?.copy(id = it.id) } ?: emptyList()
                trySend(items)
            }
        awaitClose { sub.remove() }
    }

    suspend fun submitRequest(request: LeaveRequest): Result<String> {
        return try {
            val doc = requestsCollection.add(request.copy(createdAt = Timestamp.now(), status = LeaveStatus.PENDING)).await()
            Result.success(doc.id)
        } catch (e: Exception) { Result.failure(e) }
    }

    suspend fun updateRequestStatus(requestId: String, newStatus: LeaveStatus, reviewerName: String, reviewNote: String = ""): Result<Unit> {
        return try {
            requestsCollection.document(requestId).update(
                mapOf("status" to newStatus.name, "reviewedBy" to reviewerName, "reviewNote" to reviewNote)
            ).await()
            Result.success(Unit)
        } catch (e: Exception) { Result.failure(e) }
    }
}`
    },
    Models: {
      path: 'android-native-kotlin/app/src/main/java/com/workpulse/app/data/Models.kt',
      language: 'kotlin',
      code: `package com.workpulse.app.data

import com.google.firebase.Timestamp
import com.google.firebase.firestore.DocumentId

enum class Role { EMPLOYEE, MANAGER }
enum class LeaveType(val label: String) { CASUAL("Casual Leave"), SICK("Sick Leave"), PAID("Paid Leave"), WFH("Work From Home") }
enum class LeaveStatus { PENDING, APPROVED, REJECTED }

data class User(
    @DocumentId val id: String = "",
    val name: String = "",
    val email: String = "",
    val role: Role = Role.EMPLOYEE,
    val department: String = "Engineering",
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
    val reviewedBy: String? = null
)

data class AttendanceRecord(
    @DocumentId val id: String = "",
    val userId: String = "",
    val userName: String = "",
    val date: String = "",
    val checkInTime: String? = null,
    val checkOutTime: String? = null,
    val status: String = "PRESENT"
)`
    },
    BuildGradle: {
      path: 'android-native-kotlin/app/build.gradle.kts',
      language: 'kotlin',
      code: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    id("com.google.gms.google-services")
}

android {
    namespace = "com.workpulse.app"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.workpulse.app"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        compose = true
    }
}

dependencies {
    implementation(platform("androidx.compose:compose-bom:2024.10.01"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")
    implementation("androidx.activity:activity-compose:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.7")

    // Firebase Firestore SDK
    implementation(platform("com.google.firebase:firebase-bom:33.5.1"))
    implementation("com.google.firebase:firebase-firestore-ktx")
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-play-services:1.8.1")
}`
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="native-packaging-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-600 rounded-xl text-white">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="native-packaging-title" className="text-base font-bold">
                  WorkPulse Native Android App
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold border border-emerald-500/30">
                  Android Studio Ready
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Complete Android Studio project (`/android`) & pure Kotlin Jetpack Compose code (`/android-native-kotlin`).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1 px-6 pt-3 pb-2 border-b border-slate-100 bg-slate-50 text-xs shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ANDROID')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'ANDROID'
                ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>Android Studio Project (Generated)</span>
          </button>

          <button
            onClick={() => setActiveTab('KOTLIN')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'KOTLIN'
                ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Pure Kotlin Jetpack Compose Code</span>
          </button>

          <button
            onClick={() => setActiveTab('PWA')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'PWA'
                ? 'bg-white text-amber-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-3.5 h-3.5 text-amber-600" />
            <span>Install on Real Phone (APK / PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('IOS')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center gap-1.5 shrink-0 ${
              activeTab === 'IOS'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Apple className="w-3.5 h-3.5" />
            <span>iOS / Xcode Guide</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {activeTab === 'ANDROID' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-emerald-950 text-sm">
                    The Native Android Studio Project is Already Generated!
                  </h3>
                  <p className="text-emerald-900 mt-1 leading-relaxed">
                    The root directory of this codebase now contains the official native <strong>`/android`</strong> project folder with <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">AndroidManifest.xml</code>, <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">build.gradle</code>, <code className="font-mono bg-emerald-100 px-1 py-0.5 rounded">MainActivity.java</code>, and all assets already synced with Cloud Firestore.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3.5 bg-white border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    1
                  </div>
                  <div className="flex-1">
                    <strong className="text-slate-900 block font-semibold text-xs">Open in Android Studio</strong>
                    <p className="text-slate-600 mt-0.5">
                      Launch <strong>Android Studio</strong>, click <strong>File &gt; Open...</strong>, and select the <code className="font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">android/</code> directory of this repository.
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        npx cap open android
                      </code>
                      <button
                        onClick={() => copyToClipboard('npx cap open android', 11)}
                        className="text-[11px] text-indigo-600 font-semibold hover:text-indigo-800"
                      >
                        {copiedIndex === 11 ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-white border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    2
                  </div>
                  <div className="flex-1">
                    <strong className="text-slate-900 block font-semibold text-xs">Run on Android Device or Emulator</strong>
                    <p className="text-slate-600 mt-0.5">
                      Android Studio will automatically run Gradle sync. Simply press the green <Play className="w-3 h-3 inline text-emerald-600 fill-emerald-600" /> <strong>Run</strong> button to launch on an Android phone or Virtual Device (AVD).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3.5 bg-white border border-slate-200 rounded-xl">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center shrink-0 text-xs">
                    3
                  </div>
                  <div className="flex-1">
                    <strong className="text-slate-900 block font-semibold text-xs">Generate Standalone .APK or .AAB File</strong>
                    <p className="text-slate-600 mt-0.5">
                      In Android Studio, click <strong className="text-slate-900">Build &gt; Build Bundle(s) / APK(s) &gt; Build APK(s)</strong>. Or build directly from your command line:
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <code className="text-[11px] font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">
                        cd android && ./gradlew assembleDebug
                      </code>
                      <button
                        onClick={() => copyToClipboard('cd android && ./gradlew assembleDebug', 12)}
                        className="text-[11px] text-indigo-600 font-semibold hover:text-indigo-800"
                      >
                        {copiedIndex === 12 ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'KOTLIN' && (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <span className="font-bold text-indigo-950 text-xs block">
                  Pure Native Kotlin + Jetpack Compose Codebase
                </span>
                <p className="text-indigo-900 text-[11px] mt-0.5">
                  Located in the repository under <code className="font-mono bg-indigo-100 px-1 py-0.5 rounded">/android-native-kotlin</code>. Select a file to inspect or copy:
                </p>
              </div>

              {/* Kotlin File Switcher */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {Object.keys(kotlinSnippets).map((key) => (
                  <button
                    key={key}
                    onClick={() => setSelectedKotlinFile(key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-mono transition-colors shrink-0 ${
                      selectedKotlinFile === key
                        ? 'bg-indigo-600 text-white font-bold shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {key}.kt
                  </button>
                ))}
              </div>

              {/* Code viewer */}
              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950 text-slate-200">
                <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
                  <span className="font-mono text-[10px] text-slate-400">
                    {kotlinSnippets[selectedKotlinFile].path}
                  </span>
                  <button
                    onClick={() => copyToClipboard(kotlinSnippets[selectedKotlinFile].code, 99)}
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    {copiedIndex === 99 ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedIndex === 99 ? 'Copied!' : 'Copy File'}</span>
                  </button>
                </div>
                <pre className="p-4 font-mono text-[11px] overflow-x-auto max-h-[320px] leading-relaxed text-slate-300">
                  {kotlinSnippets[selectedKotlinFile].code}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'PWA' && (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl">
                <h3 className="font-bold text-amber-950 text-sm">
                  Instant Installation on Your Actual Android Phone
                </h3>
                <p className="text-amber-900 mt-1 leading-relaxed">
                  You can open this link on your Android smartphone and install it as an official home-screen app right now:
                </p>
              </div>

              <div className="p-4 bg-white border border-slate-200 rounded-xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>On Google Android (Chrome)</span>
                </div>
                <ol className="list-decimal list-inside text-slate-600 space-y-1.5">
                  <li>Open the preview link in <strong>Chrome</strong> on your Android phone.</li>
                  <li>Tap the <strong>Add to Home Screen</strong> prompt or tap the 3 dots in the top right.</li>
                  <li>Tap <strong>Install App</strong>.</li>
                  <li>The app will install as an official Android app icon on your home screen and drawer!</li>
                </ol>
              </div>

              {/* Shareable Link Box */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-3">
                <div className="truncate min-w-0">
                  <span className="text-[11px] text-slate-500 font-medium block">Applet Preview Link:</span>
                  <span className="font-mono text-slate-800 text-xs truncate block">{currentUrl}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(currentUrl, 2)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
                >
                  {copiedIndex === 2 ? 'Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>
          )}

          {activeTab === 'IOS' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-100 border border-slate-300 rounded-xl">
                <h3 className="font-bold text-slate-950 text-sm flex items-center gap-2">
                  <Apple className="w-4 h-4" />
                  <span>Building iOS Native App with Xcode & Swift</span>
                </h3>
                <p className="text-slate-700 mt-1 leading-relaxed">
                  You can also add an iOS target using <code className="font-mono bg-slate-200 px-1 py-0.5 rounded">npx cap add ios</code> to produce an <code className="font-mono">.xcworkspace</code> project for Apple Xcode.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-t border-slate-100 shrink-0">
          <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Android Studio project in <code className="font-mono text-slate-700 font-bold">/android</code> & Kotlin in <code className="font-mono text-slate-700 font-bold">/android-native-kotlin</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
