<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Admin
        $admin = \App\Models\User::create([
            'name' => 'System Admin',
            'email' => 'admin@streetpet.org',
            'password' => \Illuminate\Support\Facades\Hash::make('admin12345'),
            'role' => 'admin',
            'phone' => '081200000001',
        ]);

        // 2. Shelter Account
        $shelterUser = \App\Models\User::create([
            'name' => 'Sahabat Anabul Jakarta',
            'email' => 'shelter@pedulianabul.org',
            'password' => \Illuminate\Support\Facades\Hash::make('shelter12345'),
            'role' => 'shelter',
            'phone' => '081299998888',
        ]);

        $shelterProfile = \App\Models\ShelterProfile::create([
            'user_id' => $shelterUser->id,
            'shelter_name' => 'Sahabat Anabul Jakarta Rescue Center',
            'description' => 'Pusat penyelamatan, perawatan, dan rehabilitasi kucing dan anjing terlantar di area Jakarta Selatan & sekitarnya.',
            'address' => 'Jl. Kemang Raya No. 45, Jakarta Selatan',
            'is_verified' => true,
            'raw_lat' => -6.2731,
            'raw_lng' => 106.8155,
            'masked_lat' => -6.2710,
            'masked_lng' => 106.8180,
            'donation_link' => 'https://kitabisa.com/sahabatanabul',
            'adoption_policy' => 'Wajib sterilisasi hewan jika sudah cukup umur, pengadopsi tidak boleh melepasliarkan hewan, dan bersedia dikunjungi berkala.',
        ]);

        // 3. Regular Reporter (Warga)
        $reporter = \App\Models\User::create([
            'name' => 'Budi Santoso',
            'email' => 'warga@gmail.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => 'reporter',
            'phone' => '081311223344',
        ]);

        // 4. Adopter
        $adopter = \App\Models\User::create([
            'name' => 'Siti Rahma',
            'email' => 'adopter@gmail.com',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => 'reporter',
            'phone' => '081555667788',
        ]);

        // 5. Sample Reports
        $report1 = \App\Models\Report::create([
            'user_id' => $reporter->id,
            'pet_type' => 'cat',
            'age_group' => 'kitten_puppy',
            'condition' => 'injured',
            'pet_count' => 2,
            'title' => 'Anak Kucing Terjebak di Selokan Dekat Stasiun Tebet',
            'description' => 'Ada 2 ekor anak kucing kedinginan dan salah satunya tampak ada luka di kaki kanan belakang. Butuh bantuan rescue segera.',
            'latitude' => -6.2268,
            'longitude' => 106.8582,
            'address_note' => 'Di samping pintu timur Stasiun Tebet, belakang warung kopi.',
            'status' => 'available',
            'is_masked' => false,
        ]);

        $report2 = \App\Models\Report::create([
            'user_id' => $reporter->id,
            'pet_type' => 'dog',
            'age_group' => 'adult',
            'condition' => 'healthy',
            'pet_count' => 1,
            'title' => 'Anjing Kampung Jinak Butuh Rumah Adopsi',
            'description' => 'Anjing sangat jinak dan bersahabat, sering diberi makan warga sekitar pasar tapi sering diusir pedagang.',
            'latitude' => -6.2115,
            'longitude' => 106.8439,
            'address_note' => 'Area parkiran Pasar Rumput, Manggarai.',
            'status' => 'screening',
            'is_masked' => false,
        ]);

        $report3 = \App\Models\Report::create([
            'user_id' => $shelterUser->id,
            'pet_type' => 'cat',
            'age_group' => 'adult',
            'condition' => 'healthy',
            'pet_count' => 1,
            'title' => 'Miko - Kucing Mix Domestik Siap Adopsi',
            'description' => 'Miko sudah divaksinasi lengkap dan sudah disteril. Sifatnya sangat manja dan suka dipangku.',
            'latitude' => -6.2710,
            'longitude' => 106.8180,
            'address_note' => 'Area Shelter Kemang (Lokasi disamarkan).',
            'status' => 'available',
            'is_masked' => true,
            'managed_by_shelter_id' => $shelterProfile->id,
        ]);

        // 6. Sample Community Activities (Street Feeding & Sighting)
        \App\Models\ReportActivity::create([
            'report_id' => $report1->id,
            'user_id' => $adopter->id,
            'activity_type' => 'fed',
            'notes' => 'Saya baru saja kasih wet food dan air bersih. Keduanya makan lahap tapi masih takut dipegang.',
        ]);

        \App\Models\ReportActivity::create([
            'report_id' => $report1->id,
            'user_id' => $reporter->id,
            'activity_type' => 'sighted',
            'notes' => 'Kucing masih terpantau di belakang warung kopi, luka di kakinya sudah agak kering.',
        ]);

        // 7. Sample Adoption Application
        \App\Models\AdoptionApplication::create([
            'report_id' => $report2->id,
            'adopter_id' => $adopter->id,
            'screening_answers' => [
                'housing_type' => 'Rumah Pribadi Sendiri',
                'housing_permit' => true,
                'pet_history' => 'Pernah memelihara anjing Golden Retriever selama 8 tahun.',
                'financial_readiness' => true,
                'sterilization_commitment' => true,
            ],
            'notes' => 'Rumah berpagar rapat dan halaman cukup luas.',
            'status' => 'pending',
        ]);
    }
}
