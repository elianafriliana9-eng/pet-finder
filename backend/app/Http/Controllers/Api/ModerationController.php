<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ModerationController extends Controller
{
    /**
     * Report / Flag a post (PRD 4.6 Anti-Abuse)
     */
    public function flagReport(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'report_id' => 'required|exists:reports,id',
            'reason' => 'required|string|max:255',
            'details' => 'nullable|string',
        ]);

        $user = $request->user();
        $report = \App\Models\Report::findOrFail($validated['report_id']);

        // Check if user already flagged this report
        $existing = \App\Models\ReportFlag::where('report_id', $report->id)
            ->where('user_id', $user->id)
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda sudah melaporkan postingan ini sebelumnya',
            ], 422);
        }

        \App\Models\ReportFlag::create([
            'report_id' => $report->id,
            'user_id' => $user->id,
            'reason' => $validated['reason'],
            'details' => $validated['details'] ?? null,
        ]);

        $report->increment('report_flags_count');

        // Auto-Hide System: If flags >= 3, automatically hide post from public map (PRD 4.6)
        if ($report->report_flags_count >= 3 && ! $report->is_hidden) {
            $report->update(['is_hidden' => true]);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan pelanggaran berhasil dikirim dan akan ditinjau oleh tim moderator.',
        ]);
    }

    /**
     * Admin: List pending shelter verification applications
     */
    public function adminPendingShelters(Request $request): \Illuminate\Http\JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Akses khusus administrator'], 403);
        }

        $shelters = \App\Models\ShelterProfile::with('user')
            ->latest()
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $shelters,
        ]);
    }

    /**
     * Admin: Approve / Reject Shelter Verification (PRD 4.1)
     */
    public function adminVerifyShelter(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Akses khusus administrator'], 403);
        }

        $validated = $request->validate([
            'is_verified' => 'required|boolean',
        ]);

        $shelter = \App\Models\ShelterProfile::findOrFail($id);
        $shelter->update(['is_verified' => $validated['is_verified']]);

        return response()->json([
            'status' => 'success',
            'message' => $validated['is_verified'] ? 'Shelter berhasil diverifikasi (Verified Shelter badge aktif)' : 'Status verifikasi shelter dibatalkan',
            'shelter' => $shelter->load('user'),
        ]);
    }

    /**
     * Admin: List flagged reports
     */
    public function adminFlaggedReports(Request $request): \Illuminate\Http\JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Akses khusus administrator'], 403);
        }

        $reports = \App\Models\Report::with(['user', 'images', 'flags.user:id,name,email'])
            ->where('report_flags_count', '>', 0)
            ->orderBy('report_flags_count', 'desc')
            ->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $reports,
        ]);
    }

    /**
     * Admin: Toggle visibility of a report (Moderate)
     */
    public function adminModerateReport(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Akses khusus administrator'], 403);
        }

        $validated = $request->validate([
            'is_hidden' => 'required|boolean',
        ]);

        $report = \App\Models\Report::findOrFail($id);
        $report->update(['is_hidden' => $validated['is_hidden']]);

        return response()->json([
            'status' => 'success',
            'message' => 'Status moderasi postingan berhasil diperbarui',
            'report' => $report,
        ]);
    }

    /**
     * Admin: Get System-wide Analytics & Health Stats
     */
    public function adminStats(Request $request): \Illuminate\Http\JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Akses khusus administrator'], 403);
        }

        $totalUsers = \App\Models\User::count();
        $totalShelters = \App\Models\ShelterProfile::count();
        $verifiedShelters = \App\Models\ShelterProfile::where('is_verified', true)->count();
        $pendingShelters = \App\Models\ShelterProfile::where('is_verified', false)->count();

        $totalReports = \App\Models\Report::count();
        $streetReports = \App\Models\Report::whereNull('managed_by_shelter_id')->count();
        $shelterReports = \App\Models\Report::whereNotNull('managed_by_shelter_id')->count();
        $rescuedCount = \App\Models\Report::whereIn('status', ['rescued', 'adopted'])->count();
        $adoptedCount = \App\Models\Report::where('status', 'adopted')->count();
        $flaggedCount = \App\Models\Report::where('report_flags_count', '>', 0)->count();
        $hiddenCount = \App\Models\Report::where('is_hidden', true)->count();

        return response()->json([
            'status' => 'success',
            'data' => [
                'total_users' => $totalUsers,
                'total_shelters' => $totalShelters,
                'verified_shelters' => $verifiedShelters,
                'pending_shelters' => $pendingShelters,
                'total_reports' => $totalReports,
                'street_reports' => $streetReports,
                'shelter_reports' => $shelterReports,
                'rescued_count' => $rescuedCount,
                'adopted_count' => $adoptedCount,
                'flagged_count' => $flaggedCount,
                'hidden_count' => $hiddenCount,
            ],
        ]);
    }

    /**
     * Admin: List All Reports (Street & Shelter) with filtering & pagination
     */
    public function adminAllReports(Request $request): \Illuminate\Http\JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Akses khusus administrator'], 403);
        }

        $query = \App\Models\Report::with(['user', 'images', 'managedByShelter']);

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('title', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('address_note', 'like', "%{$q}%");
            });
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('pet_type') && $request->input('pet_type') !== 'all') {
            $query->where('pet_type', $request->input('pet_type'));
        }

        if ($request->filled('type')) {
            if ($request->input('type') === 'shelter') {
                $query->whereNotNull('managed_by_shelter_id');
            } elseif ($request->input('type') === 'street') {
                $query->whereNull('managed_by_shelter_id');
            }
        }

        $reports = $query->latest()->paginate(25);

        return response()->json([
            'status' => 'success',
            'data' => $reports,
        ]);
    }

    /**
     * Admin: Delete Report Permanently (Spam / Illegal)
     */
    public function adminDeleteReport(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Akses khusus administrator'], 403);
        }

        $report = \App\Models\Report::findOrFail($id);
        $report->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan anabul berhasil dihapus secara permanen dari sistem.',
        ]);
    }

    /**
     * Admin: List All Users
     */
    public function adminAllUsers(Request $request): \Illuminate\Http\JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Akses khusus administrator'], 403);
        }

        $query = \App\Models\User::with('shelterProfile')->withCount(['reports', 'adoptionApplications']);

        if ($request->filled('q')) {
            $q = $request->input('q');
            $query->where(function ($sub) use ($q) {
                $sub->where('name', 'like', "%{$q}%")
                    ->orWhere('email', 'like', "%{$q}%")
                    ->orWhere('phone', 'like', "%{$q}%");
            });
        }

        if ($request->filled('role') && $request->input('role') !== 'all') {
            $query->where('role', $request->input('role'));
        }

        $users = $query->latest()->paginate(25);

        return response()->json([
            'status' => 'success',
            'data' => $users,
        ]);
    }

    /**
     * Admin: Update User Role
     */
    public function adminUpdateUserRole(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Akses khusus administrator'], 403);
        }

        $validated = $request->validate([
            'role' => 'required|in:admin,shelter,reporter',
        ]);

        $targetUser = \App\Models\User::findOrFail($id);
        $targetUser->update(['role' => $validated['role']]);

        return response()->json([
            'status' => 'success',
            'message' => "Role pengguna {$targetUser->name} berhasil diubah menjadi {$validated['role']}.",
            'user' => $targetUser->fresh('shelterProfile'),
        ]);
    }
}
