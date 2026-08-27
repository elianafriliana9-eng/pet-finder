<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Report;
use App\Models\ReportImage;
use App\Models\ReportActivity;

class StreetPetSeeder extends Seeder
{
    public function run(): void
    {
        $reporter = User::where('email', 'warga@gmail.com')->first();
        if (! $reporter) {
            $reporter = User::create([
                'name' => 'Budi Santoso',
                'email' => 'warga@gmail.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'reporter',
                'phone' => '081311223344',
            ]);
        }

        $adopter = User::where('email', 'adopter@gmail.com')->first();
        if (! $adopter) {
            $adopter = User::create([
                'name' => 'Siti Rahma',
                'email' => 'adopter@gmail.com',
                'password' => \Illuminate\Support\Facades\Hash::make('password123'),
                'role' => 'reporter',
                'phone' => '081555667788',
            ]);
        }

        $streetPets = [
            [
                'title' => 'Kucing Oyen Jinak Suka Duduk Dekat Bangku Taman Suropati',
                'pet_type' => 'cat',
                'age_group' => 'adult',
                'condition' => 'healthy',
                'pet_count' => 1,
                'description' => 'Kucing oranye ramah banget, suka nyamperin warga yang lagi jogging. Kondisi bersih dan sehat, butuh adopter yang mau merawat atau warga yang rutin street feeding.',
                'latitude' => -6.1994,
                'longitude' => 106.8326,
                'address_note' => 'Di samping bangku taman barat, dekat air mancur Taman Suropati Menteng',
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
                'activity' => [
                    'type' => 'fed',
                    'notes' => 'Sudah diberi dry food dan semangkuk air bersih. Makannya sangat lahap!',
                ],
            ],
            [
                'title' => 'Anak Kucing Calico Terjebak di Ruko Kosong Gandaria',
                'pet_type' => 'cat',
                'age_group' => 'kitten_puppy',
                'condition' => 'injured',
                'pet_count' => 1,
                'description' => 'Anak kucing belang 3 mengeong terus dari pagi di sela ruko kosong. Kaki depan kanan tampak pincang seperti terkilir. Butuh bantuan rescue segera.',
                'latitude' => -6.2429,
                'longitude' => 106.7835,
                'address_note' => 'Depan deretan ruko Gandaria 1, belakang plang laundry kiloan',
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&auto=format&fit=crop&q=80',
                'activity' => [
                    'type' => 'sighted',
                    'notes' => 'Kucing masih berada di celah ruko, sempat dikasih sosis tapi masih takut keluar.',
                ],
            ],
            [
                'title' => 'Anjing Kampung Jinak Ramah Dekat Area Pasar Santa',
                'pet_type' => 'dog',
                'age_group' => 'adult',
                'condition' => 'healthy',
                'pet_count' => 1,
                'description' => 'Anjing lokal warna cokelat krem sangat jinak dan tidak menggonggong. Sering nongkrong dekat parkiran dan butuh tempat tinggal tetap yang aman.',
                'latitude' => -6.2392,
                'longitude' => 106.8142,
                'address_note' => 'Pojok luar parkiran motor Pasar Santa, Jl. Cisanggiri Senopati',
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop&q=80',
                'activity' => [
                    'type' => 'fed',
                    'notes' => 'Dikasih nasi campur daging ayam tanpa bumbu oleh warga sekitar.',
                ],
            ],
            [
                'title' => 'Kucing Putih Abu-Abu Kedinginan di Depan Indomaret Tebet Barat',
                'pet_type' => 'cat',
                'age_group' => 'adult',
                'condition' => 'healthy',
                'pet_count' => 1,
                'description' => 'Kucing warna putih corak abu bertubuh gemuk tapi tampak lapar. Suka berteduh di bawah emperan minimarket saat hujan.',
                'latitude' => -6.2341,
                'longitude' => 106.8524,
                'address_note' => 'Teras samping Indomaret Jl. Tebet Barat Dalam Raya No. 24',
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop&q=80',
                'activity' => [
                    'type' => 'fed',
                    'notes' => 'Diberikan pakan basah whiskas oleh kasir dan warga sekitar.',
                ],
            ],
            [
                'title' => 'Induk Kucing & 3 Kitten Kedinginan di Basement Blok M Square',
                'pet_type' => 'cat',
                'age_group' => 'kitten_puppy',
                'condition' => 'critical',
                'pet_count' => 4,
                'description' => 'Ada satu induk kurus beserta 3 anak kucing yang baru berumur sekitar 3 minggu di pojok area loading dock parkir B2. Udara sangat pengap dan rawan terlindas mobil.',
                'latitude' => -6.2443,
                'longitude' => 106.7992,
                'address_note' => 'Basement B2 Blok M Square, pilar H-12 dekat pintu tangga darurat',
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1561948955-570b270e7c36?w=600&auto=format&fit=crop&q=80',
                'activity' => [
                    'type' => 'sighted',
                    'notes' => 'Induk menjaga ketat anaknya. Sudah ditaruh kardus beralaskan kain kering.',
                ],
            ],
            [
                'title' => 'Puppy Hitam Terlantar di Bawah Kolong Flyover Kuningan',
                'pet_type' => 'dog',
                'age_group' => 'kitten_puppy',
                'condition' => 'injured',
                'pet_count' => 1,
                'description' => 'Anak anjing hitam manis sendirian di taman bawah flyover, bulu kotor dan ada bekas luka gores di leher. Butuh rescuer yang bisa jemput dan bawa ke klinik.',
                'latitude' => -6.2297,
                'longitude' => 106.8294,
                'address_note' => 'Bawah flyover Jl. Gatot Subroto arah Mampang Kuningan',
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&auto=format&fit=crop&q=80',
                'activity' => [
                    'type' => 'treated',
                    'notes' => 'Luka dibersihkan dengan antiseptik dan sudah diberi makanan lembut.',
                ],
            ],
            [
                'title' => 'Kucing Tabby Belang Abu Manja di Halte Transjakarta Cikini',
                'pet_type' => 'cat',
                'age_group' => 'adult',
                'condition' => 'healthy',
                'pet_count' => 1,
                'description' => 'Kucing corak bulu harimau (tabby) abu-abu, selalu menyambut penumpang busway yang turun. Sangat bersih dan sudah terbiasa dielus orang.',
                'latitude' => -6.1925,
                'longitude' => 106.8398,
                'address_note' => 'Bawah tangga penyeberangan Halte Cikini, Jl. Pegangsaan Timur',
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&auto=format&fit=crop&q=80',
                'activity' => [
                    'type' => 'fed',
                    'notes' => 'Rutin diberi makan oleh petugas Transjakarta setiap sore.',
                ],
            ],
            [
                'title' => 'Anjing Putih Cokelat Mix Terlepas di Jalur Jogging Danau Sunter',
                'pet_type' => 'dog',
                'age_group' => 'adult',
                'condition' => 'healthy',
                'pet_count' => 1,
                'description' => 'Anjing berkalung merah tanpa identitas nomor telepon, tampak bingung mencari pemiliknya di sekitar jogging track danau. Sangat terlatih dan menurut saat dipanggil.',
                'latitude' => -6.1415,
                'longitude' => 106.8687,
                'address_note' => 'Samping dermaga perahu Danau Sunter Barat, Jakarta Utara',
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&auto=format&fit=crop&q=80',
                'activity' => [
                    'type' => 'sighted',
                    'notes' => 'Anjing masih diam di sekitar pos satpam danau.',
                ],
            ],
            [
                'title' => 'Kucing Hitam Buta Sebelah Butuh Pengobatan di Belakang Mall Kokas',
                'pet_type' => 'cat',
                'age_group' => 'senior',
                'condition' => 'injured',
                'pet_count' => 1,
                'description' => 'Kucing hitam pekat dengan mata kiri katarak/tertutup infeksi. Tubuh agak lemas dan butuh obat tetes mata serta pakan bernutrisi.',
                'latitude' => -6.2244,
                'longitude' => 106.8431,
                'address_note' => 'Gang belakang loading dock Mall Kota Kasablanka, Tebet',
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600&auto=format&fit=crop&q=80',
                'activity' => [
                    'type' => 'treated',
                    'notes' => 'Sudah ditetesi obat mata sementara, anabul tampak lebih nyaman.',
                ],
            ],
            [
                'title' => 'Kucing Tortie Cantik & Jinak di Pintu Masuk Stasiun MRT Fatmawati',
                'pet_type' => 'cat',
                'age_group' => 'adult',
                'condition' => 'healthy',
                'pet_count' => 1,
                'description' => 'Kucing betina corak kura-kura (tortoiseshell) cantik, suka tidur di atas pot bunga stasiun. Siap diadopsi oleh warga yang mencari teman setia di rumah.',
                'latitude' => -6.2925,
                'longitude' => 106.7972,
                'address_note' => 'Pintu B Stasiun MRT Fatmawati Indomaret Point',
                'status' => 'available',
                'image' => 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?w=600&auto=format&fit=crop&q=80',
                'activity' => [
                    'type' => 'fed',
                    'notes' => 'Diberi makan biskuit kucing oleh warga komuter MRT.',
                ],
            ],
        ];

        foreach ($streetPets as $data) {
            $report = Report::create([
                'user_id' => $reporter->id,
                'pet_type' => $data['pet_type'],
                'age_group' => $data['age_group'],
                'condition' => $data['condition'],
                'pet_count' => $data['pet_count'],
                'title' => $data['title'],
                'description' => $data['description'],
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'address_note' => $data['address_note'],
                'status' => $data['status'],
                'is_masked' => false,
                'managed_by_shelter_id' => null, // 100% Anabul Jalanan (bukan shelter)
            ]);

            ReportImage::create([
                'report_id' => $report->id,
                'image_path' => $data['image'],
                'thumbnail_path' => $data['image'],
                'is_primary' => true,
            ]);

            if (isset($data['activity'])) {
                ReportActivity::create([
                    'report_id' => $report->id,
                    'user_id' => $adopter->id,
                    'activity_type' => $data['activity']['type'],
                    'notes' => $data['activity']['notes'],
                ]);
            }
        }
    }
}
