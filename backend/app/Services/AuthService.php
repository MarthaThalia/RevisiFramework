<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function registerUser(array $data): array
    {
        // Enforce default role securely on the backend
        $data['role'] = 'user';
        
        $data['password'] = Hash::make($data['password']);
        $user = User::create($data);
        
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token
        ];
    }

    public function loginUser(array $credentials): array
    {
        if (!Auth::attempt($credentials)) {
            throw ValidationException::withMessages([
                'email' => ['Kredensial yang Anda berikan tidak valid.'],
            ]);
        }

        $user = User::where('email', $credentials['email'])->firstOrFail();
        $token = $user->createToken('auth_token')->plainTextToken;

        return [
            'user' => $user,
            'token' => $token
        ];
    }

    /**
     * Admin membuat operator baru dengan password yang ditentukan admin.
     */
    public function createOperator(array $data): User
    {
        return User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'operator',
        ]);
    }

    /**
     * Admin mengupdate data user (operator).
     */
    public function updateUser(int $id, array $data): User
    {
        $user = User::findOrFail($id);

        $updateData = [];
        if (isset($data['name'])) {
            $updateData['name'] = $data['name'];
        }
        if (isset($data['email'])) {
            $updateData['email'] = $data['email'];
        }
        if (!empty($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);
        return $user->fresh();
    }

    /**
     * Admin menghapus user.
     */
    public function deleteUser(int $id): void
    {
        $user = User::findOrFail($id);
        
        // Jangan izinkan menghapus admin
        if ($user->role === 'admin') {
            throw ValidationException::withMessages([
                'user' => ['Tidak dapat menghapus akun admin.'],
            ]);
        }

        // Revoke semua token user sebelum dihapus
        $user->tokens()->delete();
        $user->delete();
    }

    /**
     * Mendapatkan semua user (untuk admin).
     */
    public function getAllUsers()
    {
        return User::orderBy('created_at', 'desc')->get();
    }
}