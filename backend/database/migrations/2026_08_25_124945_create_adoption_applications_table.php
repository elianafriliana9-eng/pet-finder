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
        Schema::create('adoption_applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('report_id')->constrained('reports')->cascadeOnDelete();
            $table->foreignId('adopter_id')->constrained('users')->cascadeOnDelete();
            $table->json('screening_answers');
            $table->text('notes')->nullable();
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->index(['report_id', 'status']);
            $table->index(['adopter_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('adoption_applications');
    }
};
