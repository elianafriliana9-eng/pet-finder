<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class ReportActivity extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_id',
        'user_id',
        'activity_type',
        'notes',
        'photo_path',
        'last_latitude',
        'last_longitude',
    ];

    protected $appends = [
        'photo_url',
    ];

    public function getPhotoUrlAttribute(): ?string
    {
        if ($this->photo_path) {
            return str_starts_with($this->photo_path, 'http')
                ? $this->photo_path
                : Storage::disk('public')->url($this->photo_path);
        }
        return null;
    }

    public function report(): BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
