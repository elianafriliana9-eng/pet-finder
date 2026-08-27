<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\Report;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MessageController extends Controller
{
    /**
     * Get unread messages count for current user
     */
    public function unreadCount(Request $request): JsonResponse
    {
        $userId = $request->user()->id;
        $unreadCount = Message::where('receiver_id', $userId)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'status' => 'success',
            'unread_count' => $unreadCount,
        ]);
    }

    /**
     * Get recent conversations list for the current user
     */
    public function conversations(Request $request): JsonResponse
    {
        $userId = $request->user()->id;

        $messages = Message::with([
            'sender:id,name,avatar,role',
            'receiver:id,name,avatar,role',
            'report:id,title,pet_type,condition,status'
        ])
            ->where(function ($q) use ($userId) {
                $q->where('sender_id', $userId)
                  ->orWhere('receiver_id', $userId);
            })
            ->latest()
            ->get();

        // Group by conversation counterpart
        $conversations = [];
        foreach ($messages as $msg) {
            $otherUserId = ($msg->sender_id === $userId) ? $msg->receiver_id : $msg->sender_id;
            $otherUser = ($msg->sender_id === $userId) ? $msg->receiver : $msg->sender;
            
            if (!$otherUser) continue;

            $key = $otherUserId . '_' . ($msg->report_id ?? 'general');

            $previewText = $msg->message;
            if (!$previewText) {
                if ($msg->attachment_url) {
                    $previewText = '📷 [Foto / Gambar]';
                } elseif ($msg->latitude && $msg->longitude) {
                    $previewText = '📍 [Lokasi GPS] ' . ($msg->location_name ?: 'Pin Lokasi');
                } else {
                    $previewText = 'Pesan';
                }
            }

            if (!isset($conversations[$key])) {
                $conversations[$key] = [
                    'other_user' => $otherUser,
                    'report' => $msg->report,
                    'last_message' => $previewText,
                    'last_message_time' => $msg->created_at,
                    'unread_count' => ($msg->receiver_id === $userId && !$msg->is_read) ? 1 : 0,
                ];
            } elseif ($msg->receiver_id === $userId && !$msg->is_read) {
                $conversations[$key]['unread_count']++;
            }
        }

        return response()->json([
            'status' => 'success',
            'data' => array_values($conversations),
        ]);
    }

    /**
     * Get message thread with another user
     */
    public function thread(Request $request, $userId): JsonResponse
    {
        $myId = $request->user()->id;
        $reportId = $request->input('report_id');

        $query = Message::with(['sender:id,name,avatar,role', 'receiver:id,name,avatar,role'])
            ->where(function ($q) use ($myId, $userId) {
                $q->where(fn ($sub) => $sub->where('sender_id', $myId)->where('receiver_id', $userId))
                  ->orWhere(fn ($sub) => $sub->where('sender_id', $userId)->where('receiver_id', $myId));
            });

        if ($reportId) {
            $query->where('report_id', $reportId);
        }

        $messages = $query->orderBy('created_at', 'asc')->get();

        // Mark incoming messages as read
        Message::where('sender_id', $userId)
            ->where('receiver_id', $myId)
            ->where('is_read', false)
            ->update(['is_read' => true]);

        $otherUser = User::with('shelterProfile')->select('id', 'name', 'role', 'avatar')->find($userId);
        $report = $reportId ? Report::with('images')->find($reportId) : null;

        return response()->json([
            'status' => 'success',
            'data' => $messages,
            'other_user' => $otherUser,
            'report' => $report,
        ]);
    }

    /**
     * Send in-app message (supports text, photo attachment, and GPS location)
     */
    public function send(Request $request): JsonResponse
    {
        $myId = $request->user()->id;

        $validated = $request->validate([
            'receiver_id' => 'required|exists:users,id',
            'report_id' => 'nullable|exists:reports,id',
            'message' => 'nullable|string|max:2000',
            'attachment' => 'nullable|image|max:10240', // max 10MB
            'attachment_url' => 'nullable|string|max:1000',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'location_name' => 'nullable|string|max:255',
        ]);

        if ((int) $validated['receiver_id'] === (int) $myId) {
            return response()->json([
                'status' => 'error',
                'message' => 'Tidak dapat mengirim pesan ke akun sendiri.',
            ], 422);
        }

        $attachmentUrl = $validated['attachment_url'] ?? null;

        // Handle uploaded image file
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('chat_attachments', 'public');
            $attachmentUrl = Storage::url($path);
        }

        // Must provide at least text, attachment, or GPS location
        $rawMessage = $validated['message'] ?? $request->input('message');
        $hasText = !empty(trim($rawMessage ?? ''));
        $hasAttachment = !empty($attachmentUrl);
        $hasGps = isset($validated['latitude']) && isset($validated['longitude']);

        if (!$hasText && !$hasAttachment && !$hasGps) {
            return response()->json([
                'status' => 'error',
                'message' => 'Pesan, foto, atau lokasi tidak boleh kosong.',
            ], 422);
        }

        $message = Message::create([
            'sender_id' => $myId,
            'receiver_id' => $validated['receiver_id'],
            'report_id' => $validated['report_id'] ?? null,
            'message' => $hasText ? trim($rawMessage) : '',
            'attachment_url' => $attachmentUrl,
            'latitude' => $validated['latitude'] ?? null,
            'longitude' => $validated['longitude'] ?? null,
            'location_name' => $validated['location_name'] ?? null,
            'is_read' => false,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => $message->load(['sender:id,name,avatar,role', 'receiver:id,name,avatar,role', 'report']),
        ], 201);
    }
}
