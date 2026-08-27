<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShelterProfile extends Model
{
    protected $fillable = [
        'user_id',
        'shelter_name',
        'description',
        'address',
        'verification_doc_path',
        'is_verified',
        'raw_lat',
        'raw_lng',
        'masked_lat',
        'masked_lng',
        'donation_link',
        'adoption_policy',
    ];

    protected function casts(): array
    {
        return [
            'is_verified' => 'boolean',
            'raw_lat' => 'float',
            'raw_lng' => 'float',
            'masked_lat' => 'float',
            'masked_lng' => 'float',
        ];
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function managedReports(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Report::class, 'managed_by_shelter_id');
    }

    /**
     * Get public coordinates (masked if shelter is verified)
     */
    public function getPublicCoordinatesAttribute(): array
    {
        return [
            'latitude' => $this->masked_lat ?? $this->raw_lat,
            'longitude' => $this->masked_lng ?? $this->raw_lng,
            'is_masked' => (bool) $this->masked_lat,
        ];
    }
}

