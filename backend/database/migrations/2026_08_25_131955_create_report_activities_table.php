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
        Schema::create('report_activities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('activity_type', ['fed', 'sighted', 'treated', 'secured', 'adopted', 'moved_location'])->default('sighted');
            $table->text('notes')->nullable();
            $table->string('photo_path')->nullable();
            $table->decimal('last_latitude', 10, 8)->nullable();
            $table->decimal('last_longitude', 11, 8)->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('report_activities');
    }
};
