<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Advertisement;

class AdvertisementSeeder extends Seeder
{
    public function run(): void
    {
        $ads = [
            [
                'brand_name' => 'Royal Canin Foundation',
                'title' => 'Program Nutrisi & Vaksinasi Street Pet Bersama Dokter Vet',
                'description' => 'Konsultasikan formula nutrisi pemulihan dan dapatkan voucher pakan steril gratis untuk penyelamatan anabul terlantar.',
                'banner_url' => 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=1000&auto=format&fit=crop&q=80',
                'target_url' => 'https://www.royalcanin.com/id',
                'placement' => 'landing_highlight',
                'cta_text' => 'Klaim Voucher Pakan & Nutrisi',
                'is_active' => true,
            ],
            [
                'brand_name' => 'Royal Canin Care Network',
                'title' => 'Nutrisi Tepat untuk Anabul Masa Pemulihan',
                'description' => 'Dukung kekebalan tubuh anabul terlantar dengan formula nutrisi klinis terpercaya dokter hewan.',
                'banner_url' => 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80',
                'target_url' => 'https://www.royalcanin.com/id',
                'placement' => 'explore_sidebar',
                'cta_text' => 'Pelajari Nutrisi Anabul',
                'is_active' => true,
            ],
            [
                'brand_name' => 'Halodoc Pet & Vet Care',
                'title' => 'Tanya Dokter Hewan 24 Jam Tanpa Antre',
                'description' => 'Konsultasi gejala luka, vitamin, dan resep obat anabul jalanan langsung dari HP Anda.',
                'banner_url' => 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?w=600&auto=format&fit=crop&q=80',
                'target_url' => 'https://www.halodoc.com',
                'placement' => 'report_detail',
                'cta_text' => 'Konsultasi Dokter Vet',
                'is_active' => true,
            ],
            [
                'brand_name' => 'Peduli Anabul Store',
                'title' => 'Paket Street Feeding & Carrier Box Murah',
                'description' => 'Belanja pakan karungan & kandang pet cargo untuk kebutuhan rescue jalanan.',
                'banner_url' => 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=600&auto=format&fit=crop&q=80',
                'target_url' => 'https://tokopedia.com',
                'placement' => 'explore_sidebar',
                'cta_text' => 'Lihat Paket Pakan',
                'is_active' => true,
            ],
            [
                'brand_name' => 'Whiskas & Purina Care',
                'title' => 'Gerakan Street Feeding Sehat Nasional',
                'description' => 'Mendukung ribuan relawan rescue di seluruh Indonesia dengan donasi pakan bernutrisi lengkap.',
                'banner_url' => 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80',
                'target_url' => 'https://whiskasindonesia.com',
                'placement' => 'landing_sponsor',
                'cta_text' => 'Dukung Program Pakan',
                'is_active' => true,
            ],
        ];

        foreach ($ads as $ad) {
            Advertisement::create($ad);
        }
    }
}
