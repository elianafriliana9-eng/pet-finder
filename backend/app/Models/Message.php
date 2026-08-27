<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Message extends Model
{
    protected $fillable = [
        'report_id',
        'sender_id',
        'receiver_id',
        'message',
        'attachment_url',
        'latitude',
        'longitude',
        'location_name',
        'is_read',
    ];

    protected function casts(): array
    {
        return [
            'is_read' => 'boolean',
            'latitude' => 'float',
            'longitude' => 'float',
        ];
    }

    public function report(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(Report::class);
    }

    public function sender(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }

    public function receiver(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class, 'receiver_id');
    }
}
