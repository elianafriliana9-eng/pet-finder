<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ShelterController extends Controller
{
    /**
     * List verified shelters (Public)
     */
    public function index(): \Illuminate\Http\JsonResponse
    {
        $shelters = \App\Models\ShelterProfile::with('user:id,name,avatar')
            ->where('is_verified', true)
            ->latest()
            ->paginate(15);

        return response()->json([
            'status' => 'success',
            'data' => $shelters,
        ]);
    }

    /**
     * Show shelter profile & ready pets (Public)
     */
    public function show($id): \Illuminate\Http\JsonResponse
    {
        $shelter = \App\Models\ShelterProfile::with('user:id,name,avatar')
            ->findOrFail($id);

        $readyPets = \App\Models\Report::with(['images'])
            ->where(function ($q) use ($shelter) {
                $q->where('managed_by_shelter_id', $shelter->id)
                    ->orWhere(function ($sub) use ($shelter) {
                        $sub->where('user_id', $shelter->user_id);
                    });
            })
            ->where('status', '!=', 'adopted')
            ->visible()
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'shelter' => $shelter,
            'pets' => $readyPets,
        ]);
    }

    /**
     * Apply for shelter verification (PRD 4.1)
     */
    public function applyVerification(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'shelter_name' => 'required|string|max:255',
            'address' => 'required|string',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'document' => 'required|file|mimes:jpeg,png,jpg,pdf|max:10240',
            'description' => 'nullable|string',
            'donation_link' => 'nullable|url|max:255',
            'adoption_policy' => 'nullable|string',
        ]);

        $docPath = $request->file('document')->store('verification_docs', 'local');

        $rawLat = (float) $validated['latitude'];
        $rawLng = (float) $validated['longitude'];

        // Masked coordinates at kelurahan/district level (~1km offset)
        $maskedLat = $rawLat + (mt_rand(-100, 100) / 10000);
        $maskedLng = $rawLng + (mt_rand(-100, 100) / 10000);

        $profile = \App\Models\ShelterProfile::updateOrCreate(
            ['user_id' => $user->id],
            [
                'shelter_name' => $validated['shelter_name'],
                'address' => $validated['address'],
                'raw_lat' => $rawLat,
                'raw_lng' => $rawLng,
                'masked_lat' => $maskedLat,
                'masked_lng' => $maskedLng,
                'verification_doc_path' => $docPath,
                'description' => $validated['description'] ?? null,
                'donation_link' => $validated['donation_link'] ?? null,
                'adoption_policy' => $validated['adoption_policy'] ?? null,
                'is_verified' => false,
            ]
        );

        $user->update(['role' => 'shelter']);

        return response()->json([
            'status' => 'success',
            'message' => 'Pengajuan verifikasi shelter berhasil dikirim. Menunggu peninjauan admin.',
            'profile' => $profile,
        ]);
    }

    /**
     * Update shelter profile settings
     */
    public function updateProfile(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $profile = $user->shelterProfile;

        if (! $profile) {
            return response()->json(['status' => 'error', 'message' => 'Profil shelter belum ditemukan'], 404);
        }

        $validated = $request->validate([
            'shelter_name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'donation_link' => 'nullable|url|max:255',
            'adoption_policy' => 'nullable|string',
        ]);

        $profile->update($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'Profil shelter berhasil diperbarui',
            'profile' => $profile,
        ]);
    }

    /**
     * Shelter Admin Dashboard (Overview, Managed Pets, Inbound Adoption Applications)
     */
    public function dashboard(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $shelter = $user->shelterProfile;

        if (! $shelter) {
            return response()->json([
                'status' => 'error',
                'message' => 'Anda belum memiliki profil shelter terdaftar.',
            ], 404);
        }

        $pets = \App\Models\Report::with(['images', 'adoptionApplications.adopter:id,name,email,phone,avatar'])
            ->withCount('adoptionApplications')
            ->where(function ($q) use ($shelter, $user) {
                $q->where('managed_by_shelter_id', $shelter->id)
                    ->orWhere('user_id', $user->id);
            })
            ->latest()
            ->get();

        $stats = [
            'total_managed' => $pets->count(),
            'available_adopt' => $pets->where('status', 'available')->count(),
            'in_screening' => $pets->where('status', 'screening')->count(),
            'rescued' => $pets->where('status', 'rescued')->count(),
            'adopted' => $pets->where('status', 'adopted')->count(),
            'pending_applications' => \App\Models\AdoptionApplication::whereHas('report', function ($q) use ($shelter, $user) {
                $q->where('managed_by_shelter_id', $shelter->id)
                    ->orWhere('user_id', $user->id);
            })->where('status', 'pending')->count(),
        ];

        $applications = \App\Models\AdoptionApplication::with(['report.images', 'adopter:id,name,email,phone,avatar'])
            ->whereHas('report', function ($q) use ($shelter, $user) {
                $q->where('managed_by_shelter_id', $shelter->id)
                    ->orWhere('user_id', $user->id);
            })
            ->latest()
            ->get();

        return response()->json([
            'status' => 'success',
            'shelter' => $shelter,
            'stats' => $stats,
            'pets' => $pets,
            'applications' => $applications,
        ]);
    }

    /**
     * Shelter Open Adopt (Strictly 100% Non-Profit Adoption, Zero Sales)
     */
    public function openAdopt(Request $request): \Illuminate\Http\JsonResponse
    {
        $user = $request->user();
        $shelter = $user->shelterProfile;

        if (! $shelter) {
            return response()->json([
                'status' => 'error',
                'message' => 'Hanya akun shelter terdaftar yang dapat mempublikasikan anabul siap adopsi.',
            ], 403);
        }

        $validated = $request->validate([
            'pet_type' => 'required|in:cat,dog',
            'age_group' => 'required|in:kitten_puppy,adult,senior',
            'condition' => 'required|in:healthy,injured,critical',
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'pet_count' => 'nullable|integer|min:1',
            'address_note' => 'nullable|string',
            'images' => 'required|array|min:1|max:5',
            'images.*' => 'required|image|mimes:jpeg,png,jpg,webp|max:8192',
            'non_commercial_pledge' => 'required|accepted', // Komitmen anti jual-beli
        ]);

        $lat = $shelter->masked_lat ?? $shelter->raw_lat ?? -6.2088;
        $lng = $shelter->masked_lng ?? $shelter->raw_lng ?? 106.8456;

        $report = \App\Models\Report::create([
            'user_id' => $user->id,
            'managed_by_shelter_id' => $shelter->id,
            'pet_type' => $validated['pet_type'],
            'age_group' => $validated['age_group'],
            'condition' => $validated['condition'],
            'pet_count' => $validated['pet_count'] ?? 1,
            'title' => $validated['title'],
            'description' => $validated['description'],
            'latitude' => $lat,
            'longitude' => $lng,
            'address_note' => $validated['address_note'] ?? $shelter->address ?? 'Area Shelter',
            'is_masked' => true,
            'status' => 'available',
        ]);

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $index => $imageFile) {
                $filename = \Illuminate\Support\Str::uuid() . '.webp';
                $destinationPath = storage_path('app/public/reports');
                if (! file_exists($destinationPath)) {
                    mkdir($destinationPath, 0755, true);
                }

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
            'message' => 'Anabul berhasil dipublikasikan untuk program adopsi non-profit!',
            'report' => $report->fresh(['images', 'managedByShelter']),
        ], 201);
    }
}
