<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function register(Request $request): \Illuminate\Http\JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'phone' => 'nullable|string|max:20',
            'role' => 'nullable|in:reporter,shelter',
            'shelter_name' => 'required_if:role,shelter|nullable|string|max:255',
        ]);

        $role = $validated['role'] ?? 'reporter';

        $user = \App\Models\User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'phone' => $validated['phone'] ?? null,
            'role' => $role,
        ]);

        if ($role === 'shelter') {
            \App\Models\ShelterProfile::create([
                'user_id' => $user->id,
                'shelter_name' => $validated['shelter_name'] ?? $validated['name'],
                'is_verified' => false,
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Registrasi berhasil',
            'token' => $token,
            'user' => $user->load('shelterProfile'),
        ], 201);
    }

    public function login(Request $request): \Illuminate\Http\JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = \App\Models\User::where('email', $credentials['email'])->first();

        if (! $user || ! \Illuminate\Support\Facades\Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email atau password salah',
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'status' => 'success',
            'message' => 'Login berhasil',
            'token' => $token,
            'user' => $user->load('shelterProfile'),
        ]);
    }

    public function logout(Request $request): \Illuminate\Http\JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout berhasil',
        ]);
    }

    public function me(Request $request): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'status' => 'success',
            'user' => $request->user()->load('shelterProfile'),
        ]);
    }
}
