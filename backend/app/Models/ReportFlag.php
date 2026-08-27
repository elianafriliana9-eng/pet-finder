<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ReportFlag extends Model
{
    protected $fillable = [
        'report_id',
        'user_id',
        'reason',
        'details',
        'status',
    ];

    public function report(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
