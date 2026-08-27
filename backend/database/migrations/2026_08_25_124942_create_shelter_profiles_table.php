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
        Schema::create('shelter_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->string('shelter_name');
            $table->text('description')->nullable();
            $table->text('address')->nullable();
            $table->string('verification_doc_path')->nullable();
            $table->boolean('is_verified')->default(false);
            $table->decimal('raw_lat', 10, 7)->nullable();
            $table->decimal('raw_lng', 10, 7)->nullable();
            $table->decimal('masked_lat', 10, 7)->nullable();
            $table->decimal('masked_lng', 10, 7)->nullable();
            $table->string('donation_link')->nullable();
            $table->text('adoption_policy')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shelter_profiles');
    }
};
