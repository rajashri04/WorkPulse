# WorkPulse - 100% Native Android Project & Kotlin Jetpack Compose Architecture

This directory provides the complete pure native Android implementation built with **Kotlin**, **Jetpack Compose (Material 3)**, **Coroutines/Flow**, and **Firebase Cloud Firestore SDK (`firebase-firestore-ktx`)**.

---

## 🚀 Two Ways to Run on Android

### Method 1: The Generated Android Studio Project (Ready Immediately)
The root directory of this repository already contains the complete **`/android`** folder configured via Capacitor.
1. Open **Android Studio**.
2. Click **Open** and select the `/android` folder inside this repository root.
3. Android Studio will automatically index the Gradle files.
4. Click **Run > Run 'app'** on an emulator or connected physical Android device.
5. To build a standalone APK without Android Studio:
   ```bash
   cd android
   ./gradlew assembleDebug
   # Output APK is in: android/app/build/outputs/apk/debug/app-debug.apk
   ```

---

### Method 2: Pure Native Kotlin + Jetpack Compose
If you prefer a 100% native Android codebase with zero web runtime:
This directory (`/android-native-kotlin`) contains the full native architecture:
- `app/src/main/java/com/workpulse/app/data/Models.kt` - Kotlin data classes (`User`, `LeaveRequest`, `AttendanceRecord`, `LeaveType`, `LeaveStatus`).
- `app/src/main/java/com/workpulse/app/data/WorkPulseRepository.kt` - Realtime Firestore snapshots using Kotlin Flow and Coroutines.
- `app/src/main/java/com/workpulse/app/viewmodel/WorkPulseViewModel.kt` - Jetpack ViewModel managing state, role switching, and request approvals/submissions.
- `app/src/main/java/com/workpulse/app/ui/screens/EmployeeScreen.kt` - Jetpack Compose UI for employees (quota card carousel, apply leave/WFH modal, and requests list).
- `app/src/main/java/com/workpulse/app/ui/screens/ManagerScreen.kt` - Jetpack Compose UI for managers (pending approvals card deck, team attendance dashboard, past request history).
- `app/src/main/java/com/workpulse/app/ui/MainActivity.kt` - Main Activity with Material 3 Navigation Bar and Single Sign-Out button.
