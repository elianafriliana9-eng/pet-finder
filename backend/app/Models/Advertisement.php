<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Advertisement extends Model
{
    protected $fillable = [
        'brand_name',
        'title',
        'description',
        'banner_url',
        'target_url',
        'placement',
        'cta_text',
        'is_active',
        'impression_count',
        'click_count',
        'starts_at',
        'ends_at',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'impression_count' => 'integer',
            'click_count' => 'integer',
        ];
    }
}
