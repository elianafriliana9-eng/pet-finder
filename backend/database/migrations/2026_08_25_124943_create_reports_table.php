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
        Schema::create('reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('pet_type', ['cat', 'dog']);
            $table->enum('age_group', ['kitten_puppy', 'adult', 'senior'])->default('adult');
            $table->enum('condition', ['healthy', 'injured', 'critical'])->default('healthy');
            $table->unsignedInteger('pet_count')->default(1);
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->decimal('latitude', 10, 7);
            $table->decimal('longitude', 10, 7);
            $table->text('address_note')->nullable();
            $table->boolean('is_masked')->default(false);
            $table->enum('status', ['available', 'screening', 'rescued', 'adopted'])->default('available');
            $table->foreignId('managed_by_shelter_id')->nullable()->constrained('shelter_profiles')->nullOnDelete();
            $table->unsignedInteger('report_flags_count')->default(0);
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();

            $table->index(['status', 'pet_type', 'is_hidden']);
            $table->index(['latitude', 'longitude']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reports');
    }
};
