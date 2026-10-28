package com.workpulse.app.data

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
    private val usersCollection = firestore.collection("users")

    /**
     * Realtime flow of all leave and WFH requests
     */
    fun getRequestsFlow(): Flow<List<LeaveRequest>> = callbackFlow {
        val subscription = requestsCollection
            .orderBy("createdAt", Query.Direction.DESCENDING)
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val requests = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(LeaveRequest::class.java)?.copy(id = doc.id)
                } ?: emptyList()
                trySend(requests)
            }
        awaitClose { subscription.remove() }
    }

    /**
     * Realtime flow of attendance records
     */
    fun getAttendanceFlow(): Flow<List<AttendanceRecord>> = callbackFlow {
        val subscription = attendanceCollection
            .addSnapshotListener { snapshot, error ->
                if (error != null) {
                    close(error)
                    return@addSnapshotListener
                }
                val records = snapshot?.documents?.mapNotNull { doc ->
                    doc.toObject(AttendanceRecord::class.java)?.copy(id = doc.id)
                } ?: emptyList()
                trySend(records)
            }
        awaitClose { subscription.remove() }
    }

    /**
     * Submit a new leave or WFH request
     */
    suspend fun submitRequest(request: LeaveRequest): Result<String> {
        return try {
            val docRef = requestsCollection.add(
                request.copy(createdAt = Timestamp.now(), status = LeaveStatus.PENDING)
            ).await()
            Result.success(docRef.id)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    /**
     * Approve or reject a request by manager
     */
    suspend fun updateRequestStatus(
        requestId: String,
        newStatus: LeaveStatus,
        reviewerName: String,
        reviewNote: String = ""
    ): Result<Unit> {
        return try {
            requestsCollection.document(requestId).update(
                mapOf(
                    "status" to newStatus.name,
                    "reviewedBy" to reviewerName,
                    "reviewNote" to reviewNote,
                    "reviewedAt" to Timestamp.now()
                )
            ).await()
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
