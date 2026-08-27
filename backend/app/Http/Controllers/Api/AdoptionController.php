<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdoptionController extends Controller
{
    /**
     * Submit digital screening application (PRD 4.4)
     */
    public function submit(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'report_id' => 'required|exists:reports,id',
            'screening_answers' => 'required|array',
            'screening_answers.housing_type' => 'required|string', // e.g. Rumah Sendiri, Sewa/Kost, Apartemen
            'screening_answers.housing_permit' => 'required|boolean', // Izin keluarga / pemilik tempat
            'screening_answers.pet_history' => 'required|string', // Riwayat pemeliharaan
            'screening_answers.financial_readiness' => 'required|boolean', // Kesiapan finansial medis & makanan
            'screening_answers.sterilization_commitment' => 'required|boolean', // Komitmen sterilisasi
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();
        $report = \App\Models\Report::with('user')->findOrFail($validated['report_id']);

        // Adopsi hanya untuk hewan yang dari shelter / dikelola shelter
        $isShelterPet = ! empty($report->managed_by_shelter_id) || optional($report->user)->role === 'shelter';

        if (! $isShelterPet) {
            return response()->json([
                'status' => 'error',
                'message' => 'Skrining adopsi hanya berlaku untuk anabul asuhan shelter resmi. Untuk hewan jalanan, Anda dapat langsung melakukan penyelamatan (rescue) mandiri dan mencatat update status.',
            ], 422);
        }

        if ($report->status === 'adopted') {
            return response()->json([
                'status' => 'error',
                'message' => 'Hewan ini sudah berhasil diadopsi oleh pihak lain',
            ], 422);
        }

        // Prevent duplicate pending application from same user
        $existing = \App\Models\AdoptionApplication::where('report_id', $report->id)
            ->where('adopter_id', $user->id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda sudah mengajukan skrining adopsi untuk hewan ini dan masih dalam proses',
            ], 422);
        }

        $application = \App\Models\AdoptionApplication::create([
            'report_id' => $report->id,
            'adopter_id' => $user->id,
            'screening_answers' => $validated['screening_answers'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Formulir skrining adopsi berhasil dikirim',
            'application' => $application->load(['report.images', 'adopter:id,name']),
        ], 201);
    }

    /**
     * List user's submitted adoption applications (Adopter view)
     */
    public function myApplications(Request $request): \Illuminate\Http\JsonResponse
    {
        $applications = \App\Models\AdoptionApplication::with(['report.images', 'report.user:id,name'])
            ->where('adopter_id', $request->user()->id)
            ->latest()
            ->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $applications,
        ]);
    }

    /**
     * List applications for reports managed by user/shelter (Reporter/Shelter view)
     */
    public function reportApplications(Request $request, $reportId): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $report = \App\Models\Report::findOrFail($reportId);

        if ($report->user_id !== $user->id && ! $user->isAdmin() && $report->managed_by_shelter_id !== optional($user->shelterProfile)->id) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak'], 403);
        }

        $applications = \App\Models\AdoptionApplication::with(['adopter:id,name,phone,email,avatar'])
            ->where('report_id', $reportId)
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'report' => $report,
            'applications' => $applications,
        ]);
    }

    /**
     * Update application status (Approve / Reject)
     */
    public function updateStatus(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $application = \App\Models\AdoptionApplication::with('report')->findOrFail($id);
        $user = $request->user();
        $report = $application->report;

        if ($report->user_id !== $user->id && ! $user->isAdmin() && $report->managed_by_shelter_id !== optional($user->shelterProfile)->id) {
            return response()->json(['status' => 'error', 'message' => 'Akses ditolak'], 403);
        }

        $application->update([
            'status' => $validated['status'],
            'reviewed_at' => now(),
        ]);

        if ($validated['status'] === 'approved') {
            $report->update(['status' => 'screening']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Status pengajuan adopsi berhasil diperbarui',
            'application' => $application->fresh(['adopter:id,name,phone,email']),
        ]);
    }
}
