<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportImage extends Model
{
    protected $fillable = [
        'report_id',
        'image_path',
        'thumbnail_path',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'is_primary' => 'boolean',
        ];
    }

    protected $appends = ['image_url', 'thumbnail_url'];

    public function report(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function getImageUrlAttribute(): string
    {
        if (! $this->image_path) {
            return '';
        }
        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }
        return asset('storage/' . $this->image_path);
    }

    public function getThumbnailUrlAttribute(): string
    {
        if (! $this->thumbnail_path) {
            return $this->image_url;
        }
        if (str_starts_with($this->thumbnail_path, 'http://') || str_starts_with($this->thumbnail_path, 'https://')) {
            return $this->thumbnail_path;
        }
        return asset('storage/' . $this->thumbnail_path);
    }
}
