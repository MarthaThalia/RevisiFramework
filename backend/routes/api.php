<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\PondController;
use App\Http\Controllers\Api\V1\FeedLogController;
use App\Http\Controllers\Api\V1\SensorReadingController;

Route::prefix('v1')->group(function () {
    
    // ==========================================
    // PUBLIC ROUTES (Tidak butuh token)
    // ==========================================
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // ==========================================
    // PROTECTED ROUTES (Wajib token Sanctum)
    // ==========================================
    Route::middleware('auth:sanctum')->group(function () {
        
        // Endpoint Auth — Semua role (user, operator, admin)
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);

        // CRUD Kolam (Pond) — Semua role
        Route::apiResource('ponds', PondController::class);

        // CRUD Catatan Pakan (FeedLog) — Semua role
        Route::apiResource('feed-logs', FeedLogController::class)->only(['index', 'store']);

        // ── Sensor Readings: READ — Semua role (untuk Dashboard & Klasifikasi) ──
        Route::get('/sensor-readings', [SensorReadingController::class, 'index']);
        Route::get('/sensor-status', [SensorReadingController::class, 'checkStatus']);

        // ── Sensor Readings: WRITE — Operator & Admin saja ──
        Route::middleware('role:operator,admin')->group(function () {
            Route::post('/sensor-readings', [SensorReadingController::class, 'store']);
            Route::put('/sensor-readings/{id}', [SensorReadingController::class, 'update']);
            Route::delete('/sensor-readings/{id}', [SensorReadingController::class, 'destroy']);
        });
        
        // ── Admin Only ──
        Route::middleware('role:admin')->group(function () {
            Route::get('/users', [AuthController::class, 'indexUsers']);
            Route::post('/users', [AuthController::class, 'storeUser']);
            Route::put('/users/{id}', [AuthController::class, 'updateUser']);
            Route::delete('/users/{id}', [AuthController::class, 'destroyUser']);
        });
    });
});