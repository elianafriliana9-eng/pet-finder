<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->string('attachment_url')->nullable()->after('message');
            $table->decimal('latitude', 10, 8)->nullable()->after('attachment_url');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
            $table->string('location_name')->nullable()->after('longitude');
            $table->string('message')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table) {
            $table->dropColumn(['attachment_url', 'latitude', 'longitude', 'location_name']);
            $table->text('message')->nullable(false)->change();
        });
    }
};
