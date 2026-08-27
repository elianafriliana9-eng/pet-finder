<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AdoptionApplication extends Model
{
    protected $fillable = [
        'report_id',
        'adopter_id',
        'screening_answers',
        'notes',
        'status',
        'reviewed_at',
    ];

    protected function casts(): array
    {
        return [
            'screening_answers' => 'array',
            'reviewed_at' => 'datetime',
        ];
    }

    public function report(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function adopter(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'adopter_id');
    }
}
