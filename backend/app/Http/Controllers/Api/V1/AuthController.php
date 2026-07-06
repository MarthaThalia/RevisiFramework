<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterRequest;
use App\Http\Requests\CreateOperatorRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Services\AuthService;
use App\Traits\ApiResponseTrait;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    use ApiResponseTrait;

    protected AuthService $authService;

    public function __construct(AuthService $authService)
    {
        $this->authService = $authService;
    }

    public function register(RegisterRequest $request): JsonResponse
    {
        $data = $this->authService->registerUser($request->validated());
        return $this->successResponse($data, 'Registrasi berhasil', 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $data = $this->authService->loginUser($request->validated());
        return $this->successResponse($data, 'Login berhasil');
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();
        return $this->successResponse(null, 'Logout berhasil');
    }

    public function me(Request $request): JsonResponse
    {
        return $this->successResponse($request->user(), 'Data profil berhasil diambil');
    }

    // ==========================================
    // USER MANAGEMENT (Admin Only)
    // ==========================================

    /**
     * Mendapatkan daftar semua user.
     */
    public function indexUsers(): JsonResponse
    {
        $users = $this->authService->getAllUsers();
        return $this->successResponse($users, 'Daftar pengguna berhasil diambil');
    }

    /**
     * Admin membuat operator baru.
     */
    public function storeUser(CreateOperatorRequest $request): JsonResponse
    {
        $user = $this->authService->createOperator($request->validated());
        return $this->successResponse($user, 'Operator berhasil dibuat', 201);
    }

    /**
     * Admin mengupdate data user.
     */
    public function updateUser(UpdateUserRequest $request, int $id): JsonResponse
    {
        $user = $this->authService->updateUser($id, $request->validated());
        return $this->successResponse($user, 'Data pengguna berhasil diperbarui');
    }

    /**
     * Admin menghapus user.
     */
    public function destroyUser(int $id): JsonResponse
    {
        $this->authService->deleteUser($id);
        return $this->successResponse(null, 'Pengguna berhasil dihapus');
    }
}