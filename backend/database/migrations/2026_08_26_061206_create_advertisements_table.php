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
        Schema::create('advertisements', function (Blueprint $table) {
            $table->id();
            $table->string('brand_name');
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('banner_url');
            $table->string('target_url');
            $table->enum('placement', ['explore_sidebar', 'report_detail', 'landing_sponsor', 'global_popup'])->default('explore_sidebar');
            $table->string('cta_text')->default('Kunjungi Partner');
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('impression_count')->default(0);
            $table->unsignedInteger('click_count')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('advertisements');
    }
};
