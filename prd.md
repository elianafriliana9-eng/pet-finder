# PRODUCT REQUIREMENT DOCUMENT (PRD)

---

## 1. Informasi & Kontrol Dokumen

- **Nama Proyek:** StreetPet Rescue & Adoption Web App
- **Status Produk:** Fase Desain & Arsitektur (MVP Roadmap)
- **Model Operasional:** 100% Non-Profit / Inisiatif Komunitas Sosial
- **Target Platform Utama:** Mobile-First Web Application (Support PWA)
- **Target Platform Sekunder:** Native Mobile App (Android/iOS) — Roadmap Fase 3
- **Tumpukan Teknologi (Tech Stack):** React (Vite) + Laravel REST API + PostgreSQL/PostGIS (atau MySQL 8 Spatial)

---

## 2. Latar Belakang & Visi Produk

### 2.1 Latar Belakang
Populasi kucing dan anjing terlantar di area perkotaan sering kali memicu masalah kesejahteraan hewan dan risiko zoonosis. Di sisi lain, proses penyelamatan (*rescue*) dan adopsi saat ini masih bergantung pada grup media sosial informal yang tidak terstruktur, tanpa fitur pencarian berbasis geolokasi, serta rawan disalahgunakan oleh oknum pembiak/jual-beli hewan ilegal.

### 2.2 Visi & Nilai Keunggulan (UVP)
Menyediakan platform web serba cepat, terbuka, dan ramah pengguna ponsel (*mobile-first*) untuk menghubungkan masyarakat yang menemukan hewan jalanan terlantar secara presisi berbasis lokasi dengan calon pengadopsi (*adopter*) serta shelter terverifikasi.

### 2.3 Kebijakan Bebas Komersial (Zero Commercial Policy)
Platform ini secara tegas melarang seluruh bentuk penjualan hewan, biaya penyerahan berkedok adopsi, maupun komersialisasi hewan terlantar.

---

## 3. Peran Pengguna (User Roles)

| Peran Pengguna | Deskripsi & Hak Akses |
| :--- | :--- |
| **Guest / Unauthenticated** | Dapat melihat peta sebaran hewan terlantar, mencari hewan berdasarkan lokasi, dan membaca profil adopsi hewan. |
| **Warga / Pengguna Komunitas (Citizen User)** | Pengguna terautentikasi (warga umum) dengan fleksibilitas penuh: dapat **membuat laporan penemuan hewan jalanan**, **mengajukan adopsi**, **mencatat aksi pemberian pakan (*street feeding*)/cek kondisi**, serta **berkomunikasi langsung melalui in-app chat**. |
| **Verified Shelter / Komunitas** | Badan/shelter/kelompok rescue resmi yang telah melewati verifikasi dokumen. Memiliki badge terverifikasi, fitur *claim report*, dan akses penyamaran lokasi (*location masking*). |
| **System Admin** | Pengelola internal untuk meninjau permohonan verifikasi shelter, memoderasi konten laporan spam/ilegal, dan mengelola pengguna. |

---

## 4. Spesifikasi Fitur Fungsional (Functional Requirements)

### 4.1 Modul 1: Autentikasi & Verifikasi Shelter
- **Auth Pengguna Umum:** Pendaftaran ringkas menggunakan Email/Password atau Google OAuth via Laravel Sanctum.
- **Pengajuan Verifikasi Shelter:** Form khusus bagi pengelola shelter untuk mengunggah dokumen pendukung (Foto KTP Pengelola, SK Komunitas/Yayasan, atau foto fasilitas fisik).
- **Verifikasi Admin:** Dasbor admin untuk menyetujui/menolak pengajuan verifikasi shelter beserta pemberian badge *Verified Shelter*.

### 4.2 Modul 2: Pelaporan Hewan Jalanan (Street Report)
- **Ambil Foto / Upload:** Integrasi HTML5 Camera API pada React untuk mengambil foto langsung di lokasi atau memilih dari galeri HP.
- **Geolokasi Otomatis:** Deteksi koordinat presisi ($Latitude, Longitude$) melalui HTML5 Geolocation API dengan batas *error* jarak. Pengguna dapat menggeser *pin location* pada peta jika posisi kurang akurat.
- **Metadata Hewan:** Pengisian data ringkas: jenis hewan (kucing/anjing), perkiraan usia (kitten/puppy, dewasa), kondisi fisik (sehat, terluka, butuh bantuan medis darurat), dan jumlah hewan.
- **Penyamaran Lokasi Shelter (Masked Radius):** Jika laporan diunggah oleh akun Verified Shelter, koordinat presisi alamat shelter secara otomatis disamarkan oleh API Laravel menjadi titik koordinat perkiraan radius area (tingkat kelurahan) demi keamanan fasilitas dari penelantaran hewan secara liar.

### 4.3 Modul 3: Pencarian & Peta Interaktif (Location-Based Discovery)
- **Tampilan Peta Interaktif (Map View):** Render peta responsif menggunakan `react-leaflet` (OpenStreetMap) dengan *cluster marker* untuk menampilkan kerapatan hewan terlantar.
- **Tampilan Daftar (List View):** Tampilan kartu (*card*) berbasis responsif dengan indikator jarak hewan dari posisi pengguna saat ini.
- **Filter Radius Spasial:** Slider filter jarak interaktif ($1\text{ km} - 50\text{ km}$) yang memanfaatkan kueri spasial backend Laravel (`ST_Distance_Sphere`).
- **Filter Kategori Multi-kriteria:** Filter berdasarkan jenis hewan, kondisi kesehatan, status adopsi, dan tipe pelapor (Warga vs Verified Shelter).

### 4.4 Modul 4: Alur Skrining & Manajemen Adopsi
- **Formulir Skrining Digital Dinamis:** Calon pengadopsi mengisi data kesiapan sebelum menghubungi pelapor/shelter (pertanyaan seputar izin hunian, riwayat pemeliharaan, kesiapan finansial medis, dan komitmen sterilisasi).
- **Sistem Chat Internal (In-App Direct Messaging):** Komunikasi dua arah antara pengadopsi dan pelapor/shelter tanpa mempublikasikan nomor telepon pribadi secara terbuka.
- **Pelacak Status Adopsi (Adoption Pipeline):** Pembaruan status postingan secara *real-time* yang dapat diubah oleh pelapor/shelter:
  - **Tersedia** (Masih di jalanan / butuh pengadopsi).
  - **Dalam Skrining** (Sedang dalam proses review calon adopter).
  - **Diamankan** (Sudah dievakuasi sementara ke rumah singgah/shelter).
  - **Berhasil Diadopsi** (Sudah resmi diadopsi).

### 4.5 Modul 5: Fitur Khusus Shelter (Shelter Portal)
- **Fitur Claim Report:** Shelter terverifikasi dapat mengambil alih postingan hewan jalanan yang dilaporkan oleh warga jika shelter memutuskan untuk menampung dan merawat hewan tersebut.
- **Manajemen Profil Shelter:** Halaman publik berisi profil shelter, daftar hewan yang siap diadopsi, kebijakan adopsi, dan tautan penggalangan donasi resmi milik shelter tersebut.

### 4.6 Modul 6: Moderasi & Pelaporan Komunitas (Anti-Abuse)
- **Lapor Postingan / User (Report Flagging):** Fitur untuk melaporkan postingan yang terindikasi transaksi jual-beli hewan, penyiksaan, atau konten penipuan.
- **Auto-Hide System:** Postingan yang menerima laporan pelanggaran dari minimal 3 pengguna berbeda akan disembunyikan secara otomatis dari peta publik hingga diperiksa oleh Admin.

---

## 5. Prioritas Pengembangan Fitur (Matriks MoSCoW / MVP Scope)

| Prioritas | Komponen Fitur | Target MVP (Fase 1) |
| :--- | :--- | :---: |
| **Must Have (P0)** | Auth Sanctum, Street Report (Kamera & GPS), Peta Interaktif (React-Leaflet), Filter Radius Spasial, Pendaftaran & Verifikasi Shelter, Anti-Commercial Moderation. | Ya |
| **Should Have (P1)** | Formulir Skrining Adopsi, Chat Internal, Pipeline Status Adopsi, Penyamaran Lokasi Shelter (Masked Radius), Kompresi Gambar Client-Side. | Ya |
| **Could Have (P2)** | PWA Support (Install to Home Screen & Offline caching dasar), Fitur Claim Report oleh Shelter, Share link to Instagram Story with preview card. | Dalam Fase 1.5 |
| **Won't Have (P3)** | Push Notification browser (Fase 2), Native Mobile Apps Android/iOS (Fase 3), Integrasi payment gateway donasi. | Ditunda |

---

## 6. Spesifikasi Arsitektur Teknis

### 6.1 Architecture Diagram Overview (Prose Description)
- **Client Layer:** Browser Handphone pengguna menjalankan React SPA (Vite) yang mengakses HTML5 Camera dan Geolocation API.
- **API Gateway / Service Layer:** Frontend berkomunikasi dengan Laravel REST API via HTTPS JSON Protocol. Autentikasi dikelola oleh Laravel Sanctum Token/Cookies.
- **Data & Storage Layer:** Backend Laravel berhubungan dengan Database Spasial (PostgreSQL + PostGIS / MySQL 8 Spatial) untuk mengeksekusi kueri radius geografis, serta mengunggah media gambar terkompresi ke Cloud Storage.

### 6.2 Frontend Architecture (React)
- **Framework & Tooling:** React 18+ disetup menggunakan Vite.
- **Styling Framework:** Tailwind CSS + Shadcn UI (Component primitives berbasis Radix UI) untuk antarmuka mobile-first.
- **State & Data Fetching:** `@tanstack/react-query` (React Query) untuk menangani caching, optimis pembaruan UI, dan state fetching API Laravel.
- **Pemetaan:** `react-leaflet` terintegrasi dengan tileset OpenStreetMap.
- **Kompresi Gambar:** Pustaka `browser-image-compression` untuk memproses resample dan kompresi foto hewan di browser HP (maksimal $800\text{ KB}$) sebelum dikirim ke API Backend.
- **PWA Engine:** `vite-plugin-pwa` untuk manifest aplikasi web, ikon home screen, dan service worker.

### 6.3 Backend Architecture (Laravel REST API)
- **Framework Version:** Laravel 10 / 11 disetup murni sebagai Stateless REST API.
- **Autentikasi API:** Laravel Sanctum.
- **Pemrosesan Gambar:** Pustaka `intervention/image` pada Laravel untuk pembuatan thumbnail otomatis dan konversi format ke WebP.
- **Background Tasks:** Laravel Queues (Database/Redis driver) untuk menangani pengiriman email notifikasi dan optimasi pemrosesan media tanpa mengganggu kecepatan response time API.

### 6.4 Skema Database Spasial (Spatial Data Schema)
Kueri jarak lokasi mengandalkan tipe data spasial `POINT` dan indeks spasial.

- **Tabel `users`:** `id`, `name`, `email`, `password`, `role` (admin, reporter/warga, shelter), `created_at`.
- **Tabel `shelter_profiles`:** `id`, `user_id`, `shelter_name`, `verification_doc_path`, `is_verified` (boolean), `masked_lat`, `masked_lng`, `created_at`.
- **Tabel `reports`:**
  - `id`, `user_id` (FK to users)
  - `pet_type` (cat, dog)
  - `condition` (healthy, injured, critical)
  - `location` (Tipe Data Spasial POINT / GEOMETRY: $Latitude, Longitude$)
  - `address_note` (Deskripsi patokan tempat)
  - `is_masked` (boolean, penyamaran lokasi shelter)
  - `status` (available, screening, rescued, adopted)
  - `created_at`, `updated_at`
- **Tabel `report_images`:** `id`, `report_id`, `image_path`, `is_primary`.
- **Tabel `adoption_applications`:** `id`, `report_id`, `adopter_id`, `screening_answers` (JSON), `status` (pending, approved, rejected).

---

## 7. Persyaratan Non-Fungsional (Non-Functional Requirements)

### 7.1 Performa & Aksesibilitas Web
- **Waktu Muat (Load Time):** First Contentful Paint (FCP) di bawah 1.5 detik pada jaringan seluler 4G standar.
- **Waktu Tanggap API (API Latency):** Ekseksi kueri spasial radius jarak harus mengembalikan respons JSON di bawah 500 ms.
- **Ukuran Bundel Frontend:** Ukuran JavaScript awal terkompresi (gzipped) di bawah $250\text{ KB}$ menggunakan teknik code splitting (lazy loading komponen peta).

### 7.2 Keamanan & Proteksi Privasi
- **Perlindungan Lokasi Sensitif:** Koordinat lokasi presisi milik Verified Shelter dan rumah singgah pribadi tidak boleh dikirimkan secara mentah (raw) ke endpoint API publik untuk mencegah kasus penelantaran hewan secara beruntun.
- **Keamanan Data Pribadi (PII):** Nomor telepon, lampiran dokumen identitas verifikasi, dan isi formulir skrining hanya dapat diakses oleh pemilik data dan penerima permohonan yang sah.
- **Proteksi Injection & CORS:** Proteksi SQL Injection bawaan Laravel Eloquent ORM, sanitasi input XSS pada React, dan konfigurasi CORS terbatas khusus pada domain frontend Web App.

### 7.3 Efisiensi Operasional Non-Profit
- **Bebas Biaya Pemetaan:** Menggunakan OpenStreetMap tanpa batas panggilan API komersial.
- **Efisiensi Penyimpanan Storage:** Pengurangan ukuran berkas gambar hingga 70–80% melalui kompresi client-side dan konversi WebP server-side, menekan biaya cloud storage.

---

## 8. Indikator Keberhasilan Produk (KPIs & Success Metrics)

- **Laporan Teratasi (Resolution Rate):** Persentase laporan hewan jalanan yang statusnya berubah menjadi Diamankan atau Berhasil Diadopsi mencapai minimal 40% dalam 3 bulan pertama.
- **Kecepatan Adopsi Respon:** Rata-rata waktu tanggap pertama dari pelapor/shelter terhadap pengajuan skrining calon pengadopsi kurang dari 24 jam.
- **Adopsi Shelter Terverifikasi:** Bergabungnya minimal 15–20 shelter/komunitas rescue lokal yang aktif menggunakan portal dashboard dalam fase awal peluncuran.
- **Efisiensi Server:** Penggunaan kapasitas penyimpanan media (storage) tetap terkendali di bawah batas kuota gratis/layanan murah pada skala 1.000 laporan pertama.