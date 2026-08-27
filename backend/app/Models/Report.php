<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Report extends Model
{
    protected $fillable = [
        'user_id',
        'pet_type',
        'age_group',
        'condition',
        'pet_count',
        'title',
        'description',
        'latitude',
        'longitude',
        'address_note',
        'is_masked',
        'status',
        'managed_by_shelter_id',
        'report_flags_count',
        'is_hidden',
    ];

    protected function casts(): array
    {
        return [
            'latitude' => 'float',
            'longitude' => 'float',
            'pet_count' => 'integer',
            'is_masked' => 'boolean',
            'is_hidden' => 'boolean',
            'report_flags_count' => 'integer',
        ];
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function managedByShelter(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(ShelterProfile::class, 'managed_by_shelter_id');
    }

    public function images(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ReportImage::class);
    }

    public function primaryImage(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ReportImage::class)->ofMany([
            'is_primary' => 'max',
            'id' => 'min',
        ]);
    }

    public function adoptionApplications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AdoptionApplication::class);
    }

    public function flags(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ReportFlag::class);
    }

    public function activities(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ReportActivity::class)->orderBy('created_at', 'desc');
    }

    public function latestActivity(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ReportActivity::class)->latestOfMany();
    }

    /**
     * Scope for searching reports within spatial radius (km) using MySQL ST_Distance_Sphere.
     */
    public function scopeWithinDistance($query, float $userLat, float $userLng, float $radiusKm = 10)
    {
        $radiusMeters = $radiusKm * 1000;

        return $query
            ->select('reports.*')
            ->selectRaw(
                'ST_Distance_Sphere(POINT(longitude, latitude), POINT(?, ?)) as distance_meters',
                [$userLng, $userLat]
            )
            ->whereRaw(
                'ST_Distance_Sphere(POINT(longitude, latitude), POINT(?, ?)) <= ?',
                [$userLng, $userLat, $radiusMeters]
            )
            ->orderBy('distance_meters', 'asc');
    }

    /**
     * Scope for non-hidden reports.
     */
    public function scopeVisible($query)
    {
        return $query->where('is_hidden', false);
    }
}

