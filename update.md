# Log Pembaruan Proyek (update.md)

Dokumen ini mencatat seluruh riwayat pengerjaan, implementasi modul, perubahan arsitektur, dan status pengembangan pada proyek **StreetPet Rescue & Adoption Web App** (People-to-People Street Animal Care & Rescue Network).

---

## Status Terkini Proyek
- **Fase Saat Ini:** Full-Stack Functional Web App + Claymorphism Design System v2 (Sky–Lilac, flat color) + YouTube-style Map Explorer + Shelter Admin Portal + P2P Rescue Network Selesai.
- **Database:** MySQL (`pet_finder` port 3306) — 11 Tabel Termigrasi & 13 Laporan Anabul Ter-seed.
- **Backend Service:** Laravel 13 REST API + Laravel Sanctum — Teruji & Siap Digunakan.
- **Frontend Service:** React 19 + Vite + TypeScript + Tailwind CSS v4 + PWA — Clean Production Build (0 Errors).
- **Identitas Visual:** Background `#ffffff`, Primary `#47acd7`, Secondary `#c4adf5` — flat color, tanpa gradasi. Tipografi Fraunces + Plus Jakarta Sans.

---

## Riwayat Aktivitas & Pembaruan

### [2026-08-25] Inisiasi Database & Backend REST API
- **Perapian Dokumen PRD:**
  - Menata struktur, hirarki heading, tabel MoSCoW & User Roles, serta format Markdown pada [prd.md](file:///Users/itsrtcorp/pet-finder/prd.md).
- **Setup & Konfigurasi Backend:**
  - Menginisiasi framework Laravel pada direktori [backend/](file:///Users/itsrtcorp/pet-finder/backend).
  - Mengonfigurasi environment [.env](file:///Users/itsrtcorp/pet-finder/backend/.env) (koneksi MySQL `pet_finder`, app key, locale ID).
  - Mengonfigurasi [bootstrap/app.php](file:///Users/itsrtcorp/pet-finder/backend/bootstrap/app.php) untuk routing API dan stateful Sanctum middleware.
  - Menghubungkan storage symlink (`php artisan storage:link`) untuk akses media publik.
- **Skema Database & Migrasi (11 Tabel):**
  - `users`: Autentikasi, nomor kontak (PII terproteksi), serta role (`admin`, `reporter`, `shelter`).
  - `shelter_profiles`: Manajemen shelter, status verifikasi, koordinat presisi vs penyamaran lokasi (`raw_lat/lng` vs `masked_lat/lng`), profil, dan donasi.
  - `reports`: Pelaporan hewan jalanan, koordinat spasial GPS, status pipeline adopsi, dan flag counter.
  - `report_images`: Multi-foto hewan dengan path thumbnail & konversi WebP.
  - `report_activities`: Catatan aktivitas warga P2P (*street feeding*, *sighting*, tindakan medis, update koordinat, evakuasi).
  - `adoption_applications`: Formulir skrining digital dinamis berbasis JSON (izin hunian, riwayat, finansial, komitmen steril).
  - `report_flags`: Moderasi komunitas anti jual-beli/ilegal.
  - `messages`: Fitur In-App Direct Messaging antar pengguna/shelter.
  - `personal_access_tokens`, `cache`, `jobs`.
- **Implementasi Eloquent Models:**
  - [User.php](file:///Users/itsrtcorp/pet-finder/backend/app/Models/User.php)
  - [ShelterProfile.php](file:///Users/itsrtcorp/pet-finder/backend/app/Models/ShelterProfile.php)
  - [Report.php](file:///Users/itsrtcorp/pet-finder/backend/app/Models/Report.php) (Scope `withinDistance` berbasis `ST_Distance_Sphere` & scope `visible`).
  - [ReportImage.php](file:///Users/itsrtcorp/pet-finder/backend/app/Models/ReportImage.php)
  - [ReportActivity.php](file:///Users/itsrtcorp/pet-finder/backend/app/Models/ReportActivity.php)
  - [AdoptionApplication.php](file:///Users/itsrtcorp/pet-finder/backend/app/Models/AdoptionApplication.php)
  - [ReportFlag.php](file:///Users/itsrtcorp/pet-finder/backend/app/Models/ReportFlag.php)
  - [Message.php](file:///Users/itsrtcorp/pet-finder/backend/app/Models/Message.php)
- **Implementasi API Controllers & Routing ([routes/api.php](file:///Users/itsrtcorp/pet-finder/backend/routes/api.php)):**
  - [AuthController.php](file:///Users/itsrtcorp/pet-finder/backend/app/Http/Controllers/Api/AuthController.php): Registrasi warga/shelter, login Sanctum, logout, profil `me`.
  - [ReportController.php](file:///Users/itsrtcorp/pet-finder/backend/app/Http/Controllers/Api/ReportController.php): Discovery spasial GPS, filter multi-kriteria, upload foto WebP, check-in aktivitas warga, update status, dan shelter claim.
  - [ShelterController.php](file:///Users/itsrtcorp/pet-finder/backend/app/Http/Controllers/Api/ShelterController.php): Pengajuan verifikasi dokumen shelter, list shelter terverifikasi, dan profil publik.
  - [AdoptionController.php](file:///Users/itsrtcorp/pet-finder/backend/app/Http/Controllers/Api/AdoptionController.php): Pengajuan skrining adopsi, riwayat aplikasi adopter, dan dashboard review reporter/shelter.
  - [ModerationController.php](file:///Users/itsrtcorp/pet-finder/backend/app/Http/Controllers/Api/ModerationController.php): Flagging postingan pelanggaran, auto-hide threshold (>= 3 flags), admin approval shelter, dan admin moderasi.
  - [MessageController.php](file:///Users/itsrtcorp/pet-finder/backend/app/Http/Controllers/Api/MessageController.php): Thread chat & direct messaging in-app.
- **Seeder Data Uji Coba ([DatabaseSeeder.php](file:///Users/itsrtcorp/pet-finder/backend/database/seeders/DatabaseSeeder.php)):**
  - Membuat akun Admin, Verified Shelter, Pelapor Warga, Calon Adopter, contoh laporan anabul dengan koordinat GPS aktual di Jakarta, check-in pakan, serta formulir adopsi.

---

### [2026-08-25] Inisiasi Frontend Web Application (React + Vite + Tailwind + PWA)
- **Scaffolding & Tooling:**
  - Setup React 18+ dengan Vite dan TypeScript pada direktori [frontend/](file:///Users/itsrtcorp/pet-finder/frontend).
  - Konfigurasi styling framework dengan Tailwind CSS & Lucide Icons.
  - Integrasi [vite-plugin-pwa](file:///Users/itsrtcorp/pet-finder/frontend/vite.config.ts) (Web App Manifest, Service Worker caching, tema mobile-first).
- **State & Data Fetching:**
  - Integrasi `@tanstack/react-query` untuk caching data, server state syncing, dan mutasi optimis.
  - Setup Axios interceptor [client.ts](file:///Users/itsrtcorp/pet-finder/frontend/src/api/client.ts) dengan bearer token Sanctum & auto-logout saat 401.
  - Implementasi state management autentikasi [AuthContext.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/context/AuthContext.tsx).
- **Komponen Inti (Mobile-First):**
  - [Navbar.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/Navbar.tsx): Header responsif melayang, status Verified Shelter, link Admin, dan user avatar.
  - [BottomNav.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/BottomNav.tsx): Navigasi bawah khusus tampilan mobile (Jelajah, Lapor, Shelter, Adopsi, Pesan, Admin).
  - [PetCard.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/PetCard.tsx): Kartu anabul dengan badge kondisi, status adopsi, indikator check-in terakhir (*street feeding*), dan kalkulator jarak GPS.
  - [MapView.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/MapView.tsx): Pemetaan interaktif OpenStreetMap + Leaflet dengan custom pin markers (kucing / anjing) dan popup preview.
  - [CommunityCheckInModal.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/CommunityCheckInModal.tsx): Modal aksi warga untuk mencatat pemberian pakan (*street feeding*), pemantauan lokasi, catatan kondisi, dan perbarui GPS.
  - [AdoptionModal.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/AdoptionModal.tsx): Modal formulir skrining digital dinamis (pertanyaan izin tinggal, kesiapan finansial, komitmen steril).
  - [ReportFlagModal.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/ReportFlagModal.tsx): Modal pelaporan indikasi pelanggaran / jual-beli ilegal (Zero Commercial Policy).
- **Halaman Aplikasi ([src/pages/](file:///Users/itsrtcorp/pet-finder/frontend/src/pages)):**
  - [ExplorePage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ExplorePage.tsx): Tampilan pencarian berbasis peta & kartu, slider radius spasial (1-50 km), filter multi-kriteria (hewan, kondisi, status, warga vs shelter), dan tombol GPS.
  - [ReportPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ReportPage.tsx): Modul pelaporan dengan HTML5 Camera/Galeri, deteksi GPS otomatis, serta kompresi gambar client-side (`browser-image-compression` $\le 800\text{ KB}$).
  - [ReportDetailPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ReportDetailPage.tsx): Detail anabul, galeri foto, tahapan pipeline adopsi, linimasa kepedulian warga (P2P Care Timeline), tombol check-in pakan, tombol klaim shelter, dan chat pelapor.
  - [SheltersPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/SheltersPage.tsx) & [ShelterDetailPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ShelterDetailPage.tsx): Direktori shelter terverifikasi, tautan donasi resmi, kebijakan adopsi, dan daftar anabul binaan.
  - [ShelterApplyPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ShelterApplyPage.tsx): Formulir pengajuan verifikasi shelter resmi & upload dokumen identitas.
  - [AdoptionPipelinePage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/AdoptionPipelinePage.tsx): Pelacak status pengajuan permohonan skrining adopsi secara real-time.
  - [ChatPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ChatPage.tsx): Fitur chat langsung dua arah (In-App Direct Messaging) tanpa membuka nomor telepon pribadi.
  - [AdminPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/AdminPage.tsx): Dashboard admin untuk verifikasi shelter & penanganan laporan pelanggaran.
  - [LoginPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/LoginPage.tsx) & [RegisterPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/RegisterPage.tsx): Autentikasi warga & shelter dengan *quick test account buttons*.

---

### [2026-08-25] Redesain Antarmuka: Penerapan Style Claymorphism (3D Soft Tactile)
- **Konsep & Desain Visual:**
  - Menerapkan tema visual **Claymorphism** 3D yang lembut, *fluffy*, bersahabat, dan taktil di seluruh antarmuka aplikasi.
  - Mengonfigurasi utilitas dual-shadow (outer soft shadow + inner highlight/inset shadow), sudut membulat tebal (*rounded-2xl* & *rounded-3xl*), serta interaksi tombol empuk (*active bounce/press*).
- **Implementasi Komponen Clay:**
  - `.clay-card`: Kartu timbul lembut dengan efek kontur clay 3D untuk kartu hewan, panel filter, dan kontainer detail.
  - `.clay-card-emerald`: Banner 3D bernuansa emerald cerah untuk kampanye anti-komersialisasi & P2P network.
  - `.clay-btn-primary` & `.clay-btn-secondary`: Tombol interaktif dengan efek *press* taktil.
  - `.clay-input`: Input form bergaya recessed/inset clay yang ramah sentuhan.
  - `.clay-badge`: Badge status dan kategori berbentuk pil 3D timbul.
- **Pembaruan Modul & TypeScript:**
  - Mengonfigurasi `import type` di seluruh berkas komponen TypeScript dan menambahkan modul ekspor pada [src/types/index.ts](file:///Users/itsrtcorp/pet-finder/frontend/src/types/index.ts) untuk kompatibilitas ES Module bundling & Vite HMR.

---

### [2026-08-25] Modul People-to-People (P2P): Street Feeding & Community Check-In
- **Konsep People-to-People:**
  - Platform didesain sebagai wadah kepedulian warga akar rumput (*grassroots community care*).
  - Siapa pun warga terdekat dapat berpartisipasi tanpa harus mengadopsi secara permanen: cukup datang mengecek lokasi, memberi makan (*street feeding*), merawat luka ringan, atau mengupdate titik koordinat anabul.
- **Fitur P2P:**
  - Tombol aksi *"Saya Sedang Kasih Makan / Cek Kondisi"* di detail laporan.
  - Linimasa Kepedulian Warga (*Community Care Timeline*) dengan foto & catatan makanan yang diberikan.
  - Kartu anabul menampilkan indikator pemberian makan terakhir.

### [2026-08-26] Pembaruan Fitur, Keamanan Form, dan Landing Page
- **Peleburan Role Pengguna (Unified Citizen Role):**
  - Menghilangkan pemisahan kaku antara akun "Pelapor" dan "Adopter".
  - Pengguna umum kini terdaftar sebagai **Warga / Pengguna Komunitas (Citizen User)** dengan kebebasan penuh memilih aksi:
    1. Melaporkan hewan terlantar di jalan (Street Report).
    2. Mengajukan adopsi anabul dan mengisi form skrining (Adoption Application).
    3. Melakukan check-in kepedulian (*street feeding*, pantau kondisi) tanpa harus adopsi.
    4. Mengirim pesan internal via in-app chat.
  - Memperbarui [prd.md](file:///Users/itsrtcorp/pet-finder/prd.md), [RegisterPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/RegisterPage.tsx), dan [LoginPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/LoginPage.tsx).

- **Perbaikan Formulir Pendaftaran & Validasi Password:**
  - Menambahkan kolom input *Konfirmasi Password* (`password_confirmation`) pada form registrasi [RegisterPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/RegisterPage.tsx).
  - Menerapkan validasi kecocokan password sisi klien serta aturan `'required|string|min:8|confirmed'` di [AuthController.php](file:///Users/itsrtcorp/pet-finder/backend/app/Http/Controllers/Api/AuthController.php).
  - Meningkatkan tampilan error HTTP 422 agar seluruh pesan kesalahan dari backend diekstraksi secara transparan ke antarmuka.

- **Pembersihan Seluruh Emotikon Dekoratif:**
  - Membersihkan seluruh emotikon di seluruh basis kode (`0 emoji policy`), digantikan dengan ikon vektor SVG bersih ([MapView.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/MapView.tsx)) dan ikon Lucide resmi.

- **Implementasi Landing Page Utama ([LandingPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/LandingPage.tsx)):**
  - Membuat halaman beranda pembuka yang informatif dan ramah sebelum pengguna masuk ke peta/daftar penjelajahan.
  - Mencakup Hero Section, Tombol CTA ke Jelajah Peta (`/explore`) & Lapor Temuan (`/report`), 3 Pilar Alur Penyelamatan, penegasan kebijakan Zero-Commercial, dan Footer.
  - Memperbarui routing di [App.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/App.tsx) (`/` untuk Landing Page, `/explore` untuk Jelajah Peta & List Card).
  - Menyelaraskan navigasi desktop pada [Navbar.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/Navbar.tsx) dan mobile pada [BottomNav.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/BottomNav.tsx).

- **Konfigurasi Proxy Port Backend (Port 8001):**
  - Mengonfigurasi target proxy di [vite.config.ts](file:///Users/itsrtcorp/pet-finder/frontend/vite.config.ts) ke `http://127.0.0.1:8001` guna menghindari konflik dengan aplikasi lokal lain di port 8000.

### [2026-08-26] Redesain UI: Sistem Warna Sky–Lilac & Landing Page Baru

**1. Palet Warna Baru (menggantikan emerald/teal)**
- Background utama `#ffffff`, Primary `#47acd7` (sky), Secondary `#c4adf5` (lilac).
- Menambahkan skala warna `brand-*` dan `lilac-*` (50–950) pada blok `@theme` Tailwind v4 di [index.css](file:///Users/itsrtcorp/pet-finder/frontend/src/index.css).
- Menyapu seluruh kelas `emerald-*` → `brand-*` dan `teal-*` → `lilac-*` di 19 berkas komponen & halaman. Tidak ada warna hijau tersisa di produk.
- Memperbarui `theme_color` PWA di [vite.config.ts](file:///Users/itsrtcorp/pet-finder/frontend/vite.config.ts) serta `meta[theme-color]`, `lang="id"`, judul, dan deskripsi di [index.html](file:///Users/itsrtcorp/pet-finder/frontend/index.html).

**2. Sistem Desain Claymorphism v2 — Flat Color**
- **Tanpa gradasi warna.** Seluruh permukaan memakai warna solid; kedalaman 3D sepenuhnya dihasilkan bayangan clay (outer + inset), bukan gradien.
  - `.clay-btn-primary` → `#47acd7` (hover `#3b9ec9`), `.clay-btn-lilac` → `#9260e3` (hover `#7f42d2`).
  - `.clay-card-emerald` → `#47acd7`, `.clay-card-lilac` → `#c4adf5`, `.clay-card-soft` → `#f2f9fd`.
  - Satu-satunya `linear-gradient` tersisa adalah mask transparansi untuk fade tepi ticker (bukan gradasi warna).
- Bayangan clay kini bernuansa biru langit, bukan abu-abu netral, agar menyatu dengan palet baru.
- Kelas baru: `.clay-card-soft`, `.clay-card-lilac`, `.clay-btn-lilac`, `.clay-lift` (hover angkat), `.clay-blob`, `.grain-overlay`, `.dot-grid`, `.text-accent-brand`, `.ticker-track`, `.ticker-mask`.
- `.clay-card-emerald` sengaja dipertahankan namanya karena masih dipakai 4 halaman lain (Explore, ShelterDetail, ReportDetail, Landing), hanya isinya yang berubah jadi sky solid.
- Menambahkan keyframes `float`, `rise`, `pop`, `drift`, `ticker` beserta guard `prefers-reduced-motion`.

**3. Tipografi**
- Display: **Fraunces** (soft-serif berkarakter) untuk seluruh headline, via kelas `.font-display`.
- Body: **Plus Jakarta Sans** (typeface yang dirancang untuk DKI Jakarta) menggantikan font sistem.
- Dimuat lewat Google Fonts di [index.html](file:///Users/itsrtcorp/pet-finder/frontend/index.html) dan didaftarkan sebagai `--font-sans` / `--font-display` di `@theme`.

**4. Landing Page Baru ([LandingPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/LandingPage.tsx))**
- Hero asimetris 12 kolom: kolom kiri berisi badge live berdenyut, headline besar dengan underline SVG lilac, dua CTA clay, dan baris avatar warga; kolom kanan berisi kolase clay melayang.
- Foto utama hero: clay-render kucing jalanan di bangku trotoar ([hero-cat.webp](file:///Users/itsrtcorp/pet-finder/frontend/src/assets/hero-cat.webp)) — gaya claymation-nya sebahasa dengan sistem desain aplikasi.
  - Dioptimasi dari PNG 2,1 MB → WebP 74 KB (lebar 1400px, q82) demi performa mobile-first; `hero.png` lama dihapus.
  - Ditampilkan `object-cover` dengan fokus `54% 62%` agar wajah kucing tetap terbingkai di semua ukuran layar, plus `width`/`height` dan `fetchPriority="high"` untuk mencegah layout shift.
  - Overlay di atas foto: badge jarak GPS, status "Butuh bantuan", dan strip "Laporan warga · 12 menit lalu" dengan titik lilac berdenyut.
- Chip melayang di sekitar kartu: check-in warga dan badge shelter terverifikasi, masing-masing dengan ritme `float` berbeda.
- Atmosfer latar: blob organik warna solid yang bergerak pelan (`drift`) dan dot-grid bermasker radial.
- Animasi masuk halaman bertahap (`rise`/`pop` berjeda ±80 ms) serta ticker aktivitas komunitas berjalan.
- Bagian baru: band statistik, tiga pilar dengan ikon clay miring dan angka raksasa, grid fitur, panel "Anabul bukan barang dagangan", serta footer ringkas.

**5. Shell Aplikasi**
- Latar aplikasi ([App.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/App.tsx)) dan header ([Navbar.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/Navbar.tsx)) kini putih bersih dengan blur transparan.
- Tombol amber bergradasi di [ReportDetailPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ReportDetailPage.tsx) ikut diratakan jadi warna solid.

**6. Dokumentasi**
- Membuat [CLAUDE.md](file:///Users/itsrtcorp/pet-finder/CLAUDE.md) sebagai panduan arsitektur & konvensi repo (perintah build, aturan masking lokasi, PII, pipeline gambar, dan sistem desain).

---

### [2026-08-26] Pembaruan Modul: Layout YouTube Jelajah Peta, Panel Shelter, Fitur Pesan & Integrasi Rescue

**1. Redesain Halaman Jelajah Peta (YouTube Watch Style Layout)**
- Mengubah [ExplorePage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ExplorePage.tsx) menjadi layout 2 kolom responsif:
  - **Sisi Kiri (Video Player Area)**: Peta Leaflet interaktif langsung tampil penuh tanpa tab switch, dilengkapi kartu ringkas detail anabul yang sedang aktif dipilih beserta tombol rute navigasi.
  - **Sisi Kanan (Up-Next / Recommendation Playlist)**: Daftar kartu mini anabul horizontal dengan foto thumbnail, badge jarak real-time dari posisi pengguna, kondisi medis, dan status.
- Menambahkan animasi kamera halus `flyTo` pada [MapView.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/MapView.tsx) saat kartu anabul diklik.
- Menghapus seluruh emotikon dekoratif di filter pills dan badge demi tampilan bersih dan profesional.

**2. Penguatan Desktop Navbar & Mandatory Login**
- Memperbaiki keterlihatan [Navbar.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/Navbar.tsx) pada layar desktop (mengatur `z-index: 50` agar tidak tertutup Leaflet map, kontainer `max-w-7xl`, dan menu navigasi lengkap).
- Menetapkan **login wajib** untuk pelaporan anabul baru ([ReportPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ReportPage.tsx)), update status penyelamatan, dan check-in pemberian makan di [ReportDetailPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ReportDetailPage.tsx).
- Pengguna yang belum login otomatis diarahkan ke [LoginPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/LoginPage.tsx) dan dikembalikan ke halaman tujuan semula melalui state redirect (`location.state.from`).

**3. Pemisahan Domain: Adopsi Shelter Resmi vs Penyelamatan Mandiri (Rescue)**
- **Skrining Adopsi Resmi**: Formulir skrining digital adopsi ([AdoptionModal.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/AdoptionModal.tsx)) dikunci **hanya untuk anabul binaan shelter resmi** (100% bebas biaya).
- **Validasi Backend ([AdoptionController.php](file:///Users/itsrtcorp/pet-finder/backend/app/Http/Controllers/Api/AdoptionController.php))**: Memvalidasi bahwa pengajuan skrining adopsi ditolak jika anabul adalah hewan jalanan liar biasa.
- **Penyelamatan Mandiri (*Rescue*) Hewan Jalanan**: Hewan jalanan dapat langsung diselamatkan secara mandiri oleh warga/rescuer via tombol *"Saya Mau Rescue / Amankan Anabul Ini"* yang otomatis memperbarui status menjadi **Diamankan (*Rescued*)** serta mencatat rescuer di linimasa warga.

**4. Panel Admin Shelter & Program Open Adopt ([ShelterDashboardPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ShelterDashboardPage.tsx))**
- Membangun portal manajemen lengkap untuk akun shelter resmi di rute `/shelter/dashboard`:
  - **Scoreboard Statistik**: Menampilkan total anabul asuhan, status Open Adopt, tahap skrining, sukses diadopsi, dan formulir permohonan masuk.
  - **Manajemen Anabul Asuhan**: Pengaturan status anabul (*Tersedia, Skrining, Diamankan, Diadopsi*) secara cepat.
  - **Peninjauan Formulir Calon Adopter**: Meninjau kuesioner kelayakan adopter (tipe hunian, izin keluarga, finansial, komitmen steril) dengan tombol aksi *Setujui*, *Tolak*, dan *Direct Chat*.
  - **Modal Buka Adopsi Baru (*Open Adopt*)**: Upload multi-foto dengan kompresi otomatis, info karakter/medis, koordinat tersamar, dan kewajiban menyetujui pakta integritas 100% non-profit (anti jual-beli hewan).
  - **Profil & Tautan Donasi Resmi**: Kelola info penampungan dan tautan donasi terverifikasi (Kitabisa/Saweria).
- Mendaftarkan endpoint backend di [ShelterController.php](file:///Users/itsrtcorp/pet-finder/backend/app/Http/Controllers/Api/ShelterController.php) (`GET /api/shelters/dashboard`, `POST /api/shelters/open-adopt`, `PUT /api/shelters/profile`).

**5. Fitur Pesan Langsung & Meneruskan Kartu Anabul ke Shelter (Share to Shelter)**
- Mengaktifkan fitur chat dua arah terproteksi pada [ChatPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ChatPage.tsx) tanpa mengekspos nomor HP pribadi.
- Menambahkan komponen modal baru [ForwardToShelterModal.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/ForwardToShelterModal.tsx) di halaman detail anabul jalanan: warga dapat memilih shelter terdekat dan meneruskan kartu anabul jalanan beserta catatan koordinasi.
- Menyematkan kartu anabul interaktif (*pinned card*) di dalam ruang obrolan chat thread lengkap dengan thumbnail foto, badge kondisi, patokan alamat, dan tombol navigasi langsung ke peta.
- Memperbarui [MessageController.php](file:///Users/itsrtcorp/pet-finder/backend/app/Http/Controllers/Api/MessageController.php) untuk menyertakan metadata user lawan bicara, status shelter, serta relasi laporan anabul.

**6. Penyemaian Data 10 Anabul Jalanan ([StreetPetSeeder.php](file:///Users/itsrtcorp/pet-finder/backend/database/seeders/StreetPetSeeder.php))**
- Membuat seeder 10 anabul jalanan realistis di area strategis Jakarta (Menteng, Tebet Barat, Gandaria, Pasar Santa, Blok M Square, Kuningan, Cikini, Danau Sunter, Kota Kasablanka, Fatmawati).
- Dilengkapi foto Unsplash resolusi tinggi, data kondisi kesehatan (*Sehat, Terluka, Darurat*), koordinat GPS valid, dan riwayat aktivitas pemberian pakan (*street feeding*).
- Menyesuaikan [ReportImage.php](file:///Users/itsrtcorp/pet-finder/backend/app/Models/ReportImage.php) untuk mendukung URL eksternal (CDN/Unsplash) dan penyimpanan storage lokal.

**7. Pembangunan Admin System Panel & Pusat Moderasi ([AdminPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/AdminPage.tsx))**
- Membangun dashboard kendali sistem lengkap khusus Administrator internal di rute `/admin`:
  - **Scoreboard Analitik Real-Time**: Statistik total pengguna, shelter resmi vs menunggu verifikasi, total laporan anabul (jalanan vs shelter), angka sukses adopsi/rescue, dan jumlah flag pelanggaran.
  - **Tab Verifikasi Shelter**: Meninjau berkas pendaftaran shelter, info kontak, tautan donasi, dan tombol aksi *Setujui & Beri Badge Resmi* atau *Cabut Verifikasi*.
  - **Tab Moderasi Pelanggaran (Zero Commercial Enforcement)**: Meninjau laporan indikasi komersialisasi hewan dari warga, dengan aksi *Sembunyikan/Take-down*, *Buka Kembali*, dan *Hapus Permanen*.
  - **Tab Manajemen Seluruh Laporan Anabul**: Pencarian instan (search query), filter tipe (jalanan vs shelter) & status pipeline, kontrol visibilitas, dan penghapusan postingan spam.
  - **Tab Manajemen Pengguna & Hak Akses**: Daftar seluruh pengguna terdaftar (Warga, Shelter, Admin) dengan fitur pengubahan role pengguna secara dinamis.
- Mendaftarkan endpoint backend di [ModerationController.php](file:///Users/itsrtcorp/pet-finder/backend/app/Http/Controllers/Api/ModerationController.php) (`GET /api/admin/stats`, `GET /api/admin/reports`, `DELETE /api/admin/reports/{id}`, `GET /api/admin/users`, `PATCH /api/admin/users/{id}/role`).

**8. Sistem Iklan & Sponsorship Brand Partner Peduli Anabul ([SponsoredBanner.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/SponsoredBanner.tsx))**
- Membangun modul kemitraan iklan etis multi-spot untuk brand ekosistem hewan peliharaan (nutrisi pakan, klinik dokter hewan 24 jam, vitamin/vaksinasi, perlengkapan rescue):
  - **Skema Database & Model ([Advertisement.php](file:///Users/itsrtcorp/pet-finder/backend/app/Models/Advertisement.php))**: Tabel `advertisements` dengan pelacakan impresi tayang (*impression count*), klik masuk (*click count*), penempatan slot fleksibel, status aktif, serta periode tayang.
  - **Spot Penempatan Multi-Slot**:
    1. **Highlight Utama di Bawah Hero ([LandingPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/LandingPage.tsx))**: Slot `landing_highlight` dengan tampilan banner premium `variant="highlight"`, badge emas berdenyut, dan layout horizontal luas tepat di bawah hero live ticker.
    2. **Mitra & Brand Partner Beranda ([LandingPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/LandingPage.tsx))**: Slot `landing_sponsor` sebelum bagian komitmen komunitas.
    3. **Sidebar Jelajah Peta ([ExplorePage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ExplorePage.tsx))**: Slot `explore_sidebar` di bawah rekomendasi video-style playlist.
    4. **Detail Anabul ([ReportDetailPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ReportDetailPage.tsx))**: Slot `report_detail` di bawah linimasa aktivitas kepedulian warga.
  - **Manajemen Iklan di Admin Panel ([AdminPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/AdminPage.tsx))**: Tab khusus admin untuk memantau performa impresi & CTR klik, memasang kampanye baru ke slot penempatan yang diinginkan, jeda tayang, serta hapus iklan.
  - **Penyemaian Data Awal ([AdvertisementSeeder.php](file:///Users/itsrtcorp/pet-finder/backend/database/seeders/AdvertisementSeeder.php))**: Kampanye sponsor dari brand nutrisi (*Royal Canin Foundation & Care Network*), klinik vet (*Halodoc Pet Care*), dan perlengkapan rescue (*Peduli Anabul Store*).

**9. Penyesuaian Copywriting & Penghalusan Label Non-Profit**
- Menghapus label dan penonjolan frasa *"100% Non-Profit"* dari antarmuka publik (Navbar, Hero, Landing Page, Login, Register, Panel Shelter, dan Admin Panel).
- Menggantikannya dengan istilah yang lebih natural, profesional, dan fokus pada aksi kepedulian bersama warga seperti: *"Rescue & Adopsi Terbuka"*, *"Gerakan Peduli Warga"*, *"Bebas Biaya Adopsi"*, dan *"People-to-People Animal Care"*.

**10. Pengoptimalan Search Engine Optimization (SEO) & Metadata Sosial**
- **Meta Tag Komprehensif ([index.html](file:///Users/itsrtcorp/pet-finder/frontend/index.html))**: Menambahkan primary meta tags (title, description, keywords, author, robots max-image-preview), canonical URLs, dan tag geografis Indonesia.
- **Open Graph & Twitter Cards**: Preview visual kaya untuk sharing ke WhatsApp, Facebook, Telegram, dan Twitter/X.
- **Structured Data JSON-LD (Schema.org)**: Menyematkan skema `Organization`, `WebApplication`, `WebSite` dengan SearchAction, serta `IndividualProduct/Animal` pada halaman detail anabul untuk rich snippets Google Search.
- **Dynamic SEO Hook ([useSEO.ts](file:///Users/itsrtcorp/pet-finder/frontend/src/hooks/useSEO.ts))**: Mengelola judul dokumen (*document title*), deskripsi meta, dan structured data dinamis pada halaman [LandingPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/LandingPage.tsx), [ExplorePage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ExplorePage.tsx), [ReportDetailPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ReportDetailPage.tsx), [SheltersPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/SheltersPage.tsx), dan [ReportPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ReportPage.tsx).
- **Crawling Files**: Menambahkan [robots.txt](file:///Users/itsrtcorp/pet-finder/frontend/public/robots.txt) dan [sitemap.xml](file:///Users/itsrtcorp/pet-finder/frontend/public/sitemap.xml).

**11. Progressive Web App (PWA) & Offline-Ready Architecture**
- **Web App Manifest Lengkap ([vite.config.ts](file:///Users/itsrtcorp/pet-finder/frontend/vite.config.ts))**:
  - `name`: *StreetPet — Rescue & Adopsi Hewan Jalanan*
  - `display`: *standalone* (tampilan layar penuh seperti aplikasi native Android/iOS).
  - `theme_color`: `#47acd7` & `background_color`: `#ffffff`.
  - Icon SVG adaptif (*any & maskable*) beresolusi tinggi ([pwa-icon.svg](file:///Users/itsrtcorp/pet-finder/frontend/public/pwa-icon.svg)).
  - **App Shortcuts**: Pintasan cepat di ikon beranda HP untuk *Jelajah Peta Anabul*, *Laporkan Temuan Hewan*, dan *Direktori Shelter*.
- **Service Worker & Workbox Smart Caching**:
  - Cache peta spasial (*CartoDB / OpenStreetMap tiles*) dengan strategi *CacheFirst* (7 hari) agar peta bisa dibuka secara offline di lapangan.
  - Cache gambar Unsplash (*StaleWhileRevalidate*).
  - Cache API laporan anabul & shelter (*NetworkFirst* dengan fallback instan).
- **Komponen Install Prompt ([PwaInstallPrompt.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/PwaInstallPrompt.tsx))**:
  - Banner interaktif ramah pengguna yang menangkap event `beforeinstallprompt` untuk pemasangan instan ke Home Screen (Add to Home Screen - A2HS) pada browser mobile dan desktop.

**12. Pembaruan Identitas Visual & Logo Resmi ([logo.png](file:///Users/itsrtcorp/pet-finder/frontend/src/assets/logo.png))**
- Menerapkan logo resmi baru (ikon pin peta biru berilustrasi kucing & anjing) pada:
  - **Bilah Navigasi Utama ([Navbar.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/Navbar.tsx))**
  - **Halaman Masuk & Pendaftaran ([LoginPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/LoginPage.tsx), [RegisterPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/RegisterPage.tsx))**
  - **Footer Beranda ([LandingPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/LandingPage.tsx))**
  - **Banner Instalasi PWA ([PwaInstallPrompt.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/PwaInstallPrompt.tsx))**
  - **Favicon & Web App Manifest ([index.html](file:///Users/itsrtcorp/pet-finder/frontend/index.html), [vite.config.ts](file:///Users/itsrtcorp/pet-finder/frontend/vite.config.ts))**

**13. Sistem Navigasi Rute Langsung (*In-App*), Live Turn-by-Turn GPS Navigation & Pilihan Moda Transportasi ([routing.ts](file:///Users/itsrtcorp/pet-finder/frontend/src/utils/routing.ts), [liveNavigation.ts](file:///Users/itsrtcorp/pet-finder/frontend/src/utils/liveNavigation.ts))**
- **Optimasi Tampilan Rute di Mobile (*Mobile-First Responsive Route UI*) ([MapView.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/MapView.tsx))**:
  - Mengubah kartu rute besar yang sebelumnya menutupi peta di layar HP menjadi **Compact Bottom Bar / Drawer**:
    - Mode ringkas menampilkan badge jarak, durasi, dan tombol aksi tanpa menghalangi visualisasi peta dan garis rute jalan raya.
    - **Pemilihan Moda Transportasi & Opsi Jalan Tol yang Akurat ([routing.ts](file:///Users/itsrtcorp/pet-finder/frontend/src/utils/routing.ts))**:
  - Memperbaiki kegagalan pergantian rute tol/non-tol dengan mengintegrasikan endpoint routing khusus:
    - **Mobil (Via Tol)**: Menggunakan profile *highway/toll driving engine* yang memprioritaskan jalan tol dan jalan bebas hambatan.
    - **Mobil (Tanpa Tol) & Sepeda Motor**: Menggunakan profile *arterial non-motorway engine* yang secara ketat menghindari seluruh ruas jalan tol di Indonesia dan mengarahkan kendaraan melalui jalan arteri/lokal.
    - Menyesuaikan kalkulasi estimasi durasi waktu secara realistis berdasarkan kondisi lalu lintas jalan tol vs jalan arteri. viewport peta pada layar mobile menjadi `450px` agar navigasi lebih nyaman dan lapang.
- **Navigasi Rute Langsung (*In-App Routing*)**: Menghitung rute mengemudi/berjalan via OSRM, menggambar lintasan Polyline jalan raya, dan menampilkan jarak serta estimasi durasi tanpa keluar dari web/aplikasi.
- **Live Turn-by-Turn Navigation HUD (Waze/Gmaps Style)**:
  - **Auto-Follow Mode**: Peta Leaflet secara dinamis mengikuti pergerakan GPS pengguna (`watchPosition`) dengan zoom level 17x.
  - **Header HUD Interaktif ([MapView.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/MapView.tsx))**: Ikon belokan dinamis (belok kiri/kanan, putar balik, jalur cabang, lurus), sisa jarak ke belokan berikutnya, dan nama jalan.
  - **Panduan Suara Bahasa Indonesia (*Voice Guidance*)**: Menggunakan Web Speech API (*Text-to-Speech*) untuk membacakan instruksi belokan secara otomatis (dengan tombol toggle Mute/Unmute).
  - **Deteksi Kedatangan (*Arrival Detection*)**: Mendeteksi saat pengguna berada dalam radius < 20 meter dari target anabul, membunyikan konfirmasi kedatangan dan menampilkan dialog perayaan.
  - **Mode Simulasi Rute (*Test Drive Simulation*)**: Menguji pergerakan marker rute, pembaruan langkah belokan, dan panduan suara secara otomatis di desktop/mobile tanpa perlu berjalan di jalan raya.

**14. Perombakan Total UX & Tata Letak Halaman Detail Anabul ([ReportDetailPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ReportDetailPage.tsx))**
- **Mengeliminasi *Vertical Scroll Fatigue***:
  - Mengubah layout tumpuk vertikal yang panjang menjadi **Dua Kolom Ergonomis (*Compact Command Center*)**:
    - **Kolom Kiri**: Galeri foto anabul yang proporsional (*aspect-square*) dengan floating badge kondisi dan jenis hewan, thumbnail selector, serta kartu mini lokasi langsung dengan tombol pintas *"Buka di Peta"*.
    - **Kolom Kanan (Informasi & Smart Action Hub)**: Header rapi, stepper status penyelamatan horizontal ramping, kartu deskripsi terpadu, dan **Grid Aksi Cerdas** (Tombol Utama Rescue/Adopsi, didukung tombol ringkas 3 kolom untuk Street Feeding, Chat Pelapor, dan Teruskan ke Shelter).
  - **Sistem Tab Navigasi (*Segmented Tabs*)**:
    - Memindahkan linimasa aktivitas check-in, form update status penyelamatan, dan info shelter ke dalam sistem Tab terorganisir (*Linimasa Warga*, *Update Status*, *Info Shelter*) sehingga pengguna tidak perlu men-scroll ke bawah.
- **Optimasi Khusus Mobile (*Mobile-First Ergonomics*)**:
  - Tampilan *Above-the-fold* yang padat dan informatif.
  - **Sticky Bottom Action Bar di HP**: Tombol *"Rescue Anabul"* / *"Ajukan Adopsi"* bersama tombol cepat Chat dan Street Feeding selalu melayang di area jangkauan ibu jari (*thumb zone*), memungkinkan aksi instan tanpa perlu scrolling.
- **Perbaikan Celah & Logika Backend**:
  - Mencegah celah *self-messaging* (`receiver_id !== user_id`) agar data counter percakapan tidak kacau.
  - Memperbaiki pengelompokan query database percakapan (*SQL WHERE closure scoping*) agar pesan antar pengguna terisolasi secara ketat dan aman.
  - Menambahkan endpoint ringan `GET /api/messages/unread-count` untuk menghitung total pesan belum dibaca secara real-time.
- **Optimalisasi Antarmuka & Pengalaman Pengguna (UX Chat)**:
  - **Tanda Baca / Read Receipts (Centang Dua)**: Menampilkan status pesan (centang 1 putih saat terkirim, centang 2 biru muda saat sudah dibaca oleh lawan bicara).
  - **Badge Notifikasi Pesan Belum Dibaca**: Menampilkan pill merah dengan jumlah pesan belum dibaca pada daftar kontak chat, serta di bilah navigasi ([Navbar.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/Navbar.tsx)) dan ([BottomNav.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/components/BottomNav.tsx)).
  - **Template Pesan Cepat (*Quick Replies*)**: Tombol chip respon instan untuk menanyakan ketersediaan anabul di lokasi, koordinasi adopsi, patokan jalan, dan jadwal street feeding.
  - **Auto-Expanding Textarea & Send on Enter**: Mengetik lebih nyaman dengan auto-expand tinggi kotak input, kirim cepat dengan tombol Enter, dan baris baru dengan Shift+Enter.
  - **Pembaruan Instan (*Optimistic Updates*)**: Pesan langsung muncul di layar seketika saat tombol kirim ditekan dengan polling interval 3 detik.

**15. Perbaikan Tampilan Layar Roomchat Terpotong ([ChatPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ChatPage.tsx))**
- **Mengatasi *Viewport Clipping* & Input Terpotong**:
  - Mengganti kalkulasi statis dengan tinggi dinamis `h-[calc(100dvh-75px)] md:h-[calc(100dvh-85px)]` (*Dynamic Viewport Height*).
  - Menerapkan `min-h-0 flex-1` secara ketat pada seluruh hirarki Flexbox room chat sehingga area pesan dapat di-scroll (*overflow-y-auto*) tanpa mendorong bar input ke luar batas bawah layar.
  - Memperbaiki padding horizontal dan margin bubble chat (`overflow-x-hidden`) agar teks di sisi kanan tidak terpotong.
  - Memastikan *Quick Replies bar* dan *Input Footer* selalu menempel (*strictly docked*) dan terlihat 100% di layar mobile maupun desktop.

**16. Fitur Berbagi Gambar/Foto & Pin Lokasi GPS Langsung di Chat ([ChatPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ChatPage.tsx), [MessageController.php](file:///Users/itsrtcorp/pet-finder/backend/app/Http/Controllers/Api/MessageController.php))**
- 📷 **Berbagi Gambar & Foto Lapangan**:
  - Tombol picker foto langsung dari kamera HP atau galeri file komputer (maksimal 10 MB).
  - Dilengkapi bilah *preview* thumbnail foto sebelum dikirim dengan opsi pembatalan.
  - Bubble chat menampilkan foto terlampir secara elegan dengan dukungan modal *Lightbox Fullscreen* saat gambar diklik.
- 📍 **Berbagi Pin Lokasi GPS Terkini (*Live / Current GPS Coordinates*)**:
  - Tombol deteksi koordinat GPS instan via `navigator.geolocation.getCurrentPosition`.
  - Bubble chat merender kartu lokasi interaktif lengkap dengan koordinat *Latitude/Longitude*.
  - Dilengkapi tombol aksi langsung: **"🗺️ Buka di Peta"** (terhubung ke peta Leaflet aplikasi) dan tautan eksternal ke Google Maps.
- 💬 **Pengiriman Fleksibel**: Mendukung pengiriman teks saja, foto saja, lokasi GPS saja, atau kombinasi ketiganya secara serentak.
**17. Standarisasi Ikon PWA Persegi (*Square 1:1*) & Dukungan Maskable Icon ([vite.config.ts](file:///Users/itsrtcorp/pet-finder/frontend/vite.config.ts), [index.html](file:///Users/itsrtcorp/pet-finder/frontend/index.html))**
- **Mengatasi Ikon Fallback Huruf "S" pada Menu/Launchpad OS**:
  - Memperbaiki ketidaksesuaian resolusi (*non-square aspect ratio* `1186x1326`) yang sebelumnya menyebabkan sistem operasi desktop (macOS/Windows) menolak ikon dan menampilkan huruf fallback default.
  - Menghasilkan berkas ikon persegi presisi 1:1 menggunakan algoritma *LANCZOS centering*:
    - `pwa-192x192.png` (`192x192`, `purpose: any`)
    - `pwa-512x512.png` (`512x512`, `purpose: any`)
    - `pwa-maskable-512x512.png` (`512x512`, `purpose: maskable` dengan *15% safe-zone margin* untuk launcher Android & macOS)
    - `apple-touch-icon.png` (`180x180` untuk iOS Safari Home Screen)
    - `favicon.png` (`64x64`)
- **Aktivasi PWA Dev Mode & Tombol Pintas**: Mengaktifkan `devOptions: { enabled: true }` pada `vite-plugin-pwa` dan menambahkan tombol pintas *Install App* di header navigasi.

**18. Perbaikan Tampilan & Kontras Tombol Aksi ([ReportDetailPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ReportDetailPage.tsx))**
- Memperbaiki konflik CSS di mana class `.clay-card` menimpa warna background tombol aksi rescue (`bg-emerald-600`) dan feeding (`bg-amber-500`), yang sebelumnya menyebabkan warna tombol menjadi putih dengan teks putih.
- Mengembalikan warna latar kontras tinggi: **Hijau Emerald** (Rescue), **Kuning Amber** (Street Feeding), dan **Sky Blue** (Skrining Adopsi) dengan efek bayangan dan feedback tekan (*active state*).

**16. Perbaikan Bug Stabilitas**
- Memperbaiki pelanggaran React Rules of Hooks pada [ReportDetailPage.tsx](file:///Users/itsrtcorp/pet-finder/frontend/src/pages/ReportDetailPage.tsx) dengan merelokasi `useState` ke baris teratas komponen.
- Menjamin kelulusan build Vite + TypeScript 100% (0 errors).

> **Catatan:** Halaman selain Landing Page sudah otomatis mengikuti palet baru lewat penyapuan kelas, namun tata letaknya belum diredesain dengan bahasa visual hero yang baru.

---



---

## Data Akun Pengujian (Seeder)
- **Admin**: `admin@streetpet.org` / `admin12345` (Akses moderasi konten & verifikasi shelter)
- **Verified Shelter**: `shelter@pedulianabul.org` / `shelter12345` (Kelola shelter & claim report)
- **Warga Akun 1**: `warga@gmail.com` / `password123` (Serbaguna: Lapor, Adopsi, Feeding)
- **Warga Akun 2**: `adopter@gmail.com` / `password123` (Serbaguna: Lapor, Adopsi, Feeding)

---

## Panduan Menjalankan Layanan

### 1. Menjalankan Backend (Laravel API di Port 8001):
```bash
cd /Users/itsrtcorp/pet-finder/backend
php artisan serve --port=8001
# Endpoint API: http://127.0.0.1:8001/api
```

### 2. Menjalankan Frontend (React Vite PWA):
```bash
cd /Users/itsrtcorp/pet-finder/frontend
npm run dev
# URL Aplikasi: http://localhost:5173
```
