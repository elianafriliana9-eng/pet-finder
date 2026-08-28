<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['name', 'email', 'password', 'phone', 'role', 'avatar'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, \Laravel\Sanctum\HasApiTokens;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function shelterProfile(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(ShelterProfile::class);
    }

    public function reports(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function adoptionApplications(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(AdoptionApplication::class, 'adopter_id');
    }

    public function activities(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(ReportActivity::class);
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isShelter(): bool
    {
        return $this->role === 'shelter';
    }

    public function isReporter(): bool
    {
        return $this->role === 'reporter';
    }
}

