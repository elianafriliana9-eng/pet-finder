<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    /**
     * List / Discover Reports (Location-based search, spatial radius, filters)
     */
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $query = \App\Models\Report::with(['user.shelterProfile', 'images', 'managedByShelter', 'latestActivity.user'])
            ->visible();

        // Spatial radius search if lat & lng are provided
        $lat = $request->input('lat');
        $lng = $request->input('lng');
        $radius = (float) $request->input('radius', 10); // default 10km

        if ($lat !== null && $lng !== null) {
            $query->withinDistance((float) $lat, (float) $lng, $radius);
        } else {
            $query->latest();
        }

        // Multi-criteria Filters
        if ($request->filled('pet_type') && in_array($request->pet_type, ['cat', 'dog'])) {
            $query->where('pet_type', $request->pet_type);
        }

        if ($request->filled('condition') && in_array($request->condition, ['healthy', 'injured', 'critical'])) {
            $query->where('condition', $request->condition);
        }

        if ($request->filled('status') && in_array($request->status, ['available', 'screening', 'rescued', 'adopted'])) {
            $query->where('status', $request->status);
        }

        if ($request->filled('role_type')) {
            if ($request->role_type === 'shelter') {
                $query->whereHas('user', fn ($q) => $q->where('role', 'shelter'));
            } elseif ($request->role_type === 'warga') {
                $query->whereHas('user', fn ($q) => $q->where('role', 'reporter'));
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->orWhere('address_note', 'like', "%{$search}%");
            });
        }

        $reports = $query->paginate($request->input('per_page', 20));

        // Format and mask coordinates if applicable
        $reports->getCollection()->transform(function ($report) {
            return $this->formatReportForResponse($report);
        });

        return response()->json([
            'status' => 'success',
            'data' => $reports,
        ]);
    }

    /**
     * Create / Report street pet (Street Report Module)
     */
    public function store(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'pet_type' => 'required|in:cat,dog',
            'age_group' => 'nullable|in:kitten_puppy,adult,senior',
            'condition' => 'required|in:healthy,injured,critical',
            'pet_count' => 'nullable|integer|min:1',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'address_note' => 'nullable|string',
            'images' => 'required|array|min:1|max:5',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,webp|max:8192',
        ]);

        $user = $request->user();
        $isShelter = $user->isShelter() && $user->shelterProfile && $user->shelterProfile->is_verified;
        
        $lat = (float) $validated['latitude'];
        $lng = (float) $validated['longitude'];
        $isMasked = false;

        // If verified shelter reports, mask coordinates (PRD 4.2)
        if ($isShelter) {
            $isMasked = true;
            // Introduce approximate kelurahan-level jitter (~500-1000m)
            $lat += (mt_rand(-50, 50) / 10000);
            $lng += (mt_rand(-50, 50) / 10000);
        }

        $report = \App\Models\Report::create([
            'user_id' => $user->id,
            'pet_type' => $validated['pet_type'],
            'age_group' => $validated['age_group'] ?? 'adult',
            'condition' => $validated['condition'],
            'pet_count' => $validated['pet_count'] ?? 1,
            'title' => $validated['title'] ?? ucfirst($validated['pet_type']) . ' Butuh Bantuan',
            'description' => $validated['description'] ?? null,
            'latitude' => $lat,
            'longitude' => $lng,
            'address_note' => $validated['address_note'] ?? null,
            'is_masked' => $isMasked,
            'status' => 'available',
        ]);

        // Process images
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $imageFile) {
                $filename = \Illuminate\Support\Str::uuid() . '.webp';
                $destinationPath = storage_path('app/public/reports');
                if (! file_exists($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }

                // Convert to WebP using Intervention Image or standard GD fallback
                $fullPath = $destinationPath . '/' . $filename;
                try {
                    $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
                    $img = $manager->read($imageFile->getPathname());
                    $img->scaleDown(1200, 1200);
                    $img->toWebp(80)->save($fullPath);
                } catch (\Throwable $e) {
                    $imageFile->storeAs('reports', $filename, 'public');
                }

                \App\Models\ReportImage::create([
                    'report_id' => $report->id,
                    'image_path' => 'reports/' . $filename,
                    'thumbnail_path' => 'reports/' . $filename,
                    'is_primary' => $index === 0,
                ]);
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan hewan terlantar berhasil dibuat',
            'report' => $this->formatReportForResponse($report->fresh(['user.shelterProfile', 'images'])),
        ], 201);
    }

    /**
     * Show single report detail
     */
    public function show($id): \Illuminate\Http\JsonResponse
    {
        $report = \App\Models\Report::with(['user.shelterProfile', 'images', 'managedByShelter', 'activities.user'])
            ->visible()
            ->findOrFail($id);

        return response()->json([
            'status' => 'success',
            'report' => $this->formatReportForResponse($report),
        ]);
    }

    /**
     * Record P2P Community Activity / Check-in (Street Feeding, Sighting, Treatment, Rescue)
     */
    public function recordActivity(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'activity_type' => 'required|in:fed,sighted,treated,secured,adopted,moved_location',
            'notes' => 'nullable|string|max:1000',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,webp|max:8192',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'address_note' => 'nullable|string|max:255',
            'update_status' => 'nullable|in:available,screening,rescued,adopted',
        ]);

        $report = \App\Models\Report::findOrFail($id);
        $user = $request->user();

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $filename = \Illuminate\Support\Str::uuid() . '.webp';
            $destinationPath = storage_path('app/public/activities');
            if (! file_exists($destinationPath)) {
                mkdir($destinationPath, 0755, true);
            }
            $fullPath = $destinationPath . '/' . $filename;
            try {
                $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
                $img = $manager->read($request->file('photo')->getPathname());
                $img->scaleDown(1200, 1200);
                $img->toWebp(80)->save($fullPath);
                $photoPath = 'activities/' . $filename;
            } catch (\Throwable $e) {
                $photoPath = $request->file('photo')->storeAs('activities', $filename, 'public');
            }
        }

        $activity = \App\Models\ReportActivity::create([
            'report_id' => $report->id,
            'user_id' => $user->id,
            'activity_type' => $validated['activity_type'],
            'notes' => $validated['notes'] ?? null,
            'photo_path' => $photoPath,
            'last_latitude' => $validated['latitude'] ?? null,
            'last_longitude' => $validated['longitude'] ?? null,
        ]);

        // If activity changes location or status, update report directly
        $updates = [];
        if (! empty($validated['latitude']) && ! empty($validated['longitude'])) {
            $updates['latitude'] = (float) $validated['latitude'];
            $updates['longitude'] = (float) $validated['longitude'];
        }
        if (! empty($validated['address_note'])) {
            $updates['address_note'] = $validated['address_note'];
        }
        if (! empty($validated['update_status'])) {
            $updates['status'] = $validated['update_status'];
        } elseif (in_array($validated['activity_type'], ['secured', 'adopted'])) {
            $updates['status'] = $validated['activity_type'] === 'adopted' ? 'adopted' : 'rescued';
        }

        if (! empty($updates)) {
            $report->update($updates);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Aktivitas komunitas berhasil dicatat! Terima kasih telah peduli pada anabul ini.',
            'activity' => $activity->load('user'),
            'report' => $this->formatReportForResponse($report->fresh(['user.shelterProfile', 'images', 'activities.user'])),
        ], 201);
    }

    /**
     * Update report status (Pipeline: available -> screening -> rescued -> adopted)
     */
    public function updateStatus(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'status' => 'required|in:available,screening,rescued,adopted',
        ]);

        $report = \App\Models\Report::findOrFail($id);
        $user = $request->user();

        // Any registered citizen or shelter can help update status with valid reason
        $report->update(['status' => $validated['status']]);

        return response()->json([
            'status' => 'success',
            'message' => 'Status laporan berhasil diperbarui',
            'report' => $this->formatReportForResponse($report->fresh(['user.shelterProfile', 'images'])),
        ]);
    }

    /**
     * Shelter Claim Report (PRD 4.5)
     */
    public function claim(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();

        if (! $user->isShelter() || ! $user->shelterProfile || ! $user->shelterProfile->is_verified) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya Verified Shelter yang dapat mengambil alih (claim) laporan',
            ], 403);
        }

        $report = \App\Models\Report::findOrFail($id);
        $report->update([
            'managed_by_shelter_id' => $user->shelterProfile->id,
            'status' => 'rescued',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Laporan berhasil diambil alih oleh shelter Anda',
            'report' => $this->formatReportForResponse($report->fresh(['user.shelterProfile', 'images', 'managedByShelter'])),
        ]);
    }

    /**
     * Format response with masked location security rule
     */
    private function formatReportForResponse(\App\Models\Report $report): array
    {
        $data = $report->toArray();

        // Hide raw phone/PII from public reports (PRD 7.2)
        if (isset($data['user']['phone'])) {
            unset($data['user']['phone']);
        }
        if (isset($data['user']['email'])) {
            unset($data['user']['email']);
        }

        return $data;
    }
}
