<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Advertisement;
use Illuminate\Http\Request;

class AdvertisementController extends Controller
{
    /**
     * Public: Get active advertisements for a specific placement
     */
    public function index(Request $request): \Illuminate\Http\JsonResponse
    {
        $placement = $request->input('placement', 'explore_sidebar');

        $ads = Advertisement::where('is_active', true)
            ->where('placement', $placement)
            ->where(function ($q) {
                $q->whereNull('starts_at')->orWhere('starts_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('ends_at')->orWhere('ends_at', '>=', now());
            })
            ->inRandomOrder()
            ->limit(3)
            ->get();

        // Increment impression count
        foreach ($ads as $ad) {
            $ad->increment('impression_count');
        }

        return response()->json([
            'status' => 'success',
            'data' => $ads,
        ]);
    }

    /**
     * Public: Track click count on an advertisement
     */
    public function trackClick($id): \Illuminate\Http\JsonResponse
    {
        $ad = Advertisement::findOrFail($id);
        $ad->increment('click_count');

        return response()->json([
            'status' => 'success',
            'message' => 'Click tracked',
            'target_url' => $ad->target_url,
        ]);
    }

    /**
     * Admin: List all advertisement campaigns
     */
    public function adminList(Request $request): \Illuminate\Http\JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Akses khusus administrator'], 403);
        }

        $query = Advertisement::query();

        if ($request->filled('placement') && $request->input('placement') !== 'all') {
            $query->where('placement', $request->input('placement'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $isActive = $request->input('status') === 'active';
            $query->where('is_active', $isActive);
        }

        $ads = $query->latest()->paginate(20);

        return response()->json([
            'status' => 'success',
            'data' => $ads,
        ]);
    }

    /**
     * Admin: Create new advertisement campaign
     */
    public function adminStore(Request $request): \Illuminate\Http\JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Akses khusus administrator'], 403);
        }

        $validated = $request->validate([
            'brand_name' => 'required|string|max:255',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:500',
            'banner_url' => 'required|url|max:1000',
            'target_url' => 'required|url|max:1000',
            'placement' => 'required|string|max:100',
            'cta_text' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $ad = Advertisement::create([
            'brand_name' => $validated['brand_name'],
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'banner_url' => $validated['banner_url'],
            'target_url' => $validated['target_url'],
            'placement' => $validated['placement'],
            'cta_text' => $validated['cta_text'] ?? 'Kunjungi Partner',
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Kampanye iklan brand berhasil dipasang.',
            'data' => $ad,
        ], 201);
    }

    /**
     * Admin: Update or Toggle Active Status
     */
    public function adminUpdate(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Akses khusus administrator'], 403);
        }

        $ad = Advertisement::findOrFail($id);

        $validated = $request->validate([
            'brand_name' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:500',
            'banner_url' => 'nullable|url|max:1000',
            'target_url' => 'nullable|url|max:1000',
            'placement' => 'nullable|string|max:100',
            'cta_text' => 'nullable|string|max:50',
            'is_active' => 'nullable|boolean',
        ]);

        $ad->update(array_filter($validated, fn ($val) => $val !== null));

        return response()->json([
            'status' => 'success',
            'message' => 'Iklan berhasil diperbarui.',
            'data' => $ad,
        ]);
    }

    /**
     * Admin: Delete advertisement
     */
    public function adminDelete(Request $request, $id): \Illuminate\Http\JsonResponse
    {
        if (! $request->user()->isAdmin()) {
            return response()->json(['status' => 'error', 'message' => 'Akses khusus administrator'], 403);
        }

        $ad = Advertisement::findOrFail($id);
        $ad->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Iklan berhasil dihapus.',
        ]);
    }
}
