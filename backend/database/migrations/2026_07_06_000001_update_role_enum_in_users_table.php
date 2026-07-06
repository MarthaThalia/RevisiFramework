<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Mengubah enum role dari ('admin', 'petambak') ke ('admin', 'operator', 'user')
     */
    public function up(): void
    {
        // Untuk SQLite, kita perlu drop dan re-create kolom
        // Untuk MySQL, kita bisa ALTER langsung
        
        // Update existing 'petambak' values to 'user'
        DB::table('users')->where('role', 'petambak')->update(['role' => 'user']);
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'operator', 'user'])->default('user')->after('password');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('users')->where('role', 'operator')->update(['role' => 'petambak']);
        DB::table('users')->where('role', 'user')->update(['role' => 'petambak']);

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->enum('role', ['admin', 'petambak'])->default('petambak')->after('password');
        });
    }
};
