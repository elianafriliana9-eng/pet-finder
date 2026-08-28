<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\ShelterController;
use App\Http\Controllers\Api\AdoptionController;
use App\Http\Controllers\Api\ModerationController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\AdvertisementController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Health Check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'timestamp' => now()->toIso8601String(),
    ]);
});

// Auth Routes (Public)
Route::prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
});

// Public Discovery, Profiles & Sponsored Ads
Route::get('/reports', [ReportController::class, 'index']);
Route::get('/reports/{id}', [ReportController::class, 'show']);
Route::get('/shelters', [ShelterController::class, 'index']);
Route::get('/shelters/{id}', [ShelterController::class, 'show']);
Route::get('/ads', [AdvertisementController::class, 'index']);
Route::post('/ads/{id}/click', [AdvertisementController::class, 'trackClick']);
Route::get('/leaderboard', [ReportController::class, 'leaderboard']);

// Authenticated Routes
Route::middleware('auth:sanctum')->group(function () {
    // Auth & Profile
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);

    // Street Pet Reports & P2P Community Check-in
    Route::post('/reports', [ReportController::class, 'store']);
    Route::patch('/reports/{id}/status', [ReportController::class, 'updateStatus']);
    Route::post('/reports/{id}/claim', [ReportController::class, 'claim']);
    Route::post('/reports/{id}/activity', [ReportController::class, 'recordActivity']);

    // Shelter Portal, Admin & Verification
    Route::get('/shelters/dashboard', [ShelterController::class, 'dashboard']);
    Route::post('/shelters/open-adopt', [ShelterController::class, 'openAdopt']);
    Route::post('/shelters/verification', [ShelterController::class, 'applyVerification']);
    Route::put('/shelters/profile', [ShelterController::class, 'updateProfile']);

    // Adoption Pipeline & Screening
    Route::post('/adoptions/submit', [AdoptionController::class, 'submit']);
    Route::get('/adoptions/my', [AdoptionController::class, 'myApplications']);
    Route::get('/reports/{id}/adoptions', [AdoptionController::class, 'reportApplications']);
    Route::patch('/adoptions/{id}/status', [AdoptionController::class, 'updateStatus']);

    // In-App Direct Messaging
    Route::get('/messages/unread-count', [MessageController::class, 'unreadCount']);
    Route::get('/messages/conversations', [MessageController::class, 'conversations']);
    Route::get('/messages/thread/{userId}', [MessageController::class, 'thread']);
    Route::post('/messages', [MessageController::class, 'send']);

    // Community Moderation (Anti-Abuse)
    Route::post('/moderation/flag', [ModerationController::class, 'flagReport']);

    // Admin Dashboard & System Control
    Route::prefix('admin')->group(function () {
        Route::get('/stats', [ModerationController::class, 'adminStats']);
        Route::get('/shelters/pending', [ModerationController::class, 'adminPendingShelters']);
        Route::post('/shelters/{id}/verify', [ModerationController::class, 'adminVerifyShelter']);
        Route::get('/reports/flagged', [ModerationController::class, 'adminFlaggedReports']);
        Route::patch('/reports/{id}/moderate', [ModerationController::class, 'adminModerateReport']);
        Route::get('/reports', [ModerationController::class, 'adminAllReports']);
        Route::delete('/reports/{id}', [ModerationController::class, 'adminDeleteReport']);
        Route::get('/users', [ModerationController::class, 'adminAllUsers']);
        Route::patch('/users/{id}/role', [ModerationController::class, 'adminUpdateUserRole']);

        // Advertisements & Brand Campaigns Management
        Route::get('/ads', [AdvertisementController::class, 'adminList']);
        Route::post('/ads', [AdvertisementController::class, 'adminStore']);
        Route::patch('/ads/{id}', [AdvertisementController::class, 'adminUpdate']);
        Route::delete('/ads/{id}', [AdvertisementController::class, 'adminDelete']);
    });
});

