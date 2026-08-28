# Panduan & Strategi Pencegahan Penyalahgunaan Adopsi (Anti-Snake Feeder & Animal Exploitation)

---

## 1. Latar Belakang & Definisi Masalah

### 1.1 Apa itu "Snake Feeder" dalam Konteks Adopsi?
Dalam komunitas perlindungan hewan, istilah **Snake Feeder** merujuk pada oknum pemelihara reptil karnivora (seperti ular ukuran sedang/besar) yang berpura-pura menjadi calon pengadopsi (*adopter*) yang penyayang hewan. Motif sebenarnya adalah memperoleh hewan kecil (terutama anak kucing/kitten, anak anjing/puppy, kelinci, marmut, hamster, atau tikus) secara gratis untuk dijadikan **pakan hidup (*live prey / live feeder*)**.

Selain *snake feeder*, bentuk penyalahgunaan lain yang sering terjadi pada platform adopsi terbuka meliputi:
1. **Pengepul / Penjual Liar (*Pet Trafficking*):** Mengambil hewan ras/lucu gratis lalu menjualnya kembali.
2. **Kolektor Hoarder / Tidak Layak:** Mengumpulkan banyak hewan tanpa kemampuan finansial atau ruang hidup yang layak, berujung pada penelantaran massal.
3. **Pemanfaatan untuk Eksploitasi / Konten Negatif:** Penganiayaan hewan untuk konten media sosial atau eksperimen yang tidak bertanggung jawab.

### 1.2 Mengapa Platform Adopsi Terbuka Rentan?
- Adanya listing adopsi 100% gratis (*zero cost*) tanpa syarat rumit.
- Akses komunikasi langsung tanpa sistem penyaringan (*screening*).
- Ketiadaan pencatatan riwayat adopsi pengguna (satu akun bisa mengambil puluhan hewan dari pelapor berbeda dalam waktu singkat).
- Kurangnya edukasi bagi pelapor jalanan (*citizen rescuer*) pemula tentang pentingnya seleksi adopter.

---

## 2. Pilar Strategi Pencegahan (Protection Framework)

Untuk memitigasi risiko tersebut, aplikasi StreetPet menerapkan pendekatan 4 Pilar Keamanan:

```
+-----------------------------------------------------------------------------------+
|                        STREETPET ADOPTION SAFETY FRAMEWORK                        |
+---------------------+---------------------+-------------------+-------------------+
| 1. Screening &      | 2. Product & Rate   | 3. Community &    | 4. Post-Adoption  |
|    Verification     |    Limiting         |    Moderation     |    Follow-up      |
+---------------------+---------------------+-------------------+-------------------+
| - Digital KYC       | - Adopter Quota     | - Flagging System | - Photo/Video Log |
| - Critical Q&A      | - Phone Masking     | - Blacklist DB    | - Check-in Status |
| - Adoption Contract | - No Instant Handout| - Admin Reviews   | - Community Trail |
+---------------------+---------------------+-------------------+-------------------+
```

---

## 3. Spesifikasi Fitur Pencegahan

### 3.1 Pilar 1: Skrining & Verifikasi Calon Adopter
1. **Formulir Kuesioner Adopsi Wajib (*Adoption Questionnaire*):**
   - Riwayat dan pengalaman memelihara hewan.
   - Status tempat tinggal (rumah pribadi/sewa, izin pemilik hunian).
   - Kesediaan menanggung biaya pakan berkualitas, vaksin, dan sterilisasi.
   - Penolakan tegas terhadap segala bentuk pengalihan hewan menjadi pakan/komoditas.
2. **Verifikasi Identitas Dasar (Lightweight KYC):**
   - Calon adopter wajib memverifikasi akun (Nomor WhatsApp / Email terkonfirmasi).
   - Opsi upload kartu identitas (KTP/identitas resmi) yang hanya dapat diakses saat proses kesepakatan adopsi resmi dan disimpan terenkripsi.
3. **Perjanjian Adopsi Digital (*Digital Adoption Agreement*):**
   - Lembar komitmen digital dengan klausul hukum:
     - Larangan menjual kembali, menyiksa, atau menjadikan hewan sebagai pakan.
     - Kesediaan memberikan kabar kondisi hewan secara berkala.
     - Hak pelapor/shelter untuk menarik kembali hewan jika terbukti ditelantarkan/disalahgunakan.

### 3.2 Pilar 2: Pembatasan Sistem & Perlindungan Data Pribadi
1. **Proteksi Kontak Langsung (*Zero Direct PII Exposure*):**
   - Nomor telepon dan alamat email pelapor tidak ditampilkan di publik.
   - Seluruh interaksi awal wajib melalui fitur **In-App Direct Chat**.
2. **Pembatasan Frekuensi Adopsi (*Adopter Rate Limiting & Cooldown*):**
   - Membatasi jumlah pengajuan adopsi per akun (misalnya: maksimal 2 pengajuan adopsi aktif dalam kurun waktu 30 hari untuk pengguna umum non-shelter).
   - Mencegah oknum yang berniat memborong banyak anak kucing/hewan dalam rentang hari yang sama.
3. **Opsi Biaya Rehoming / Syarat Medis Simbolis (*Rehoming Requirement*):**
   - Memberi fasilitas bagi pelapor/shelter untuk menetapkan syarat penggantian biaya vaksin/steril atau biaya adopsi simbolis. Oknum *snake feeder* umumnya hanya mengincar adopsi yang 100% gratis.

### 3.3 Pilar 3: Moderasi & Deteksi Dini Komunitas
1. **Sistem Blacklist & Fraud Database:**
   - Basis data nomor telepon, identitas, atau akun yang terbukti melakukan penyalahgunaan atau dilaporkan oleh komunitas rescue.
   - Sistem mendeteksi nomor atau akun yang masuk daftar hitam dan otomatis memblokir pengajuan adopsi.
2. **Lapor Akun / Percakapan Mencurigakan (*Flagging & Reporting*):**
   - Menu pelaporan khusus pada chat adopsi: *"Terindikasi Pengepul / Snake Feeder / Penipuan"*.
   - Laporan disertai bukti screenshot chat untuk ditinjau oleh Admin/Moderator.
3. **Pemberitahuan Peringatan Dini (*Safety Banner*):**
   - Banner edukasi otomatis di setiap halaman detail adopsi & ruang chat adopsi:
     > *"Tips Aman: Waspadai oknum snake feeder & pengepul! Lakukan verifikasi identitas, jangan serahkan hewan secara terburu-buru, dan minta video kondisi rumah calon adopter."*

### 3.4 Pilar 4: Pemantauan Pasca-Adopsi (*Post-Adoption Tracking*)
1. **Jurnal Pembaruan Kondisi Hewan (*Post-Adoption Update Log*):**
   - Adopter memiliki modul untuk mengunggah update kondisi hewan (foto terkini & catatan kesehatan) pada milestone:
     - Minggu ke-1
     - Bulan ke-1
     - Bulan ke-3
2. **Peringatan Otomatis Jika Adopter Tidak Memberi Kabar:**
   - Notifikasi otomatis kepada adopter untuk mengirimkan update.
   - Status badge "Adopter Terpercaya" (*Trusted Adopter*) diberikan kepada pengguna yang konsisten menyelesaikan pemantauan pasca-adopsi.

---

## 4. Panduan Red Flags untuk Rescuer & Pemilik Hewan

Aplikasi menyediakan panduan visual bagi pelapor untuk mengidentifikasi calon adopter yang mencurigakan:

| Indikator (Red Flags) | Karakteristik Oknum Tidak Bertanggung Jawab | Karakteristik Calon Adopter Sejati |
| :--- | :--- | :--- |
| **Kriteria Hewan yang Diminta** | Meminta banyak kitten/anak hewan sekaligus, jenis apa saja, tidak peduli kondisi atau warna. | Tertarik pada hewan tertentu, menanyakan sifat, kebiasaan, dan riwayat kesehatan. |
| **Kecepatan & Urgensi** | Sangat terburu-buru, mendesak serah terima hari itu juga (sering meminta dikirim lewat ojek online tanpa tatap muka). | Bersedia mengikuti tahapan screening, survei, atau perjanjian adopsi. |
| **Kesiapan & Komunikasi** | Menolak menjawab pertanyaan seputar kandang, pakan, atau foto lingkungan rumah. Menolak video call. | Antusias memperlihatkan ruangan/kandang yang disiapkan dan mendiskusikan rencana perawatan. |
| **Reaksi terhadap Biaya/Syarat** | Langsung membatalkan niat ketika diminta biaya steril/vaksin pengganti atau syarat surat adopsi. | Memahami bahwa merawat hewan memerlukan biaya medis dan komitmen legal. |
| **Komitmen Pasca-Adopsi** | Menolak atau menghindar ketika diminta kesediaan memberi update berkala di kemudian hari. | Bersedia menjalin komunikasi dan membagikan perkembangan hewan secara berkala. |

---

## 5. Rencana Arsitektur & Perubahan Teknis (Roadmap)

### 5.1 Perubahan Skema Basis Data (Database)
- **Tabel `adoption_applications`**: Menyimpan kuesioner, status verifikasi, dan status persetujuan.
- **Tabel `adoption_agreements`**: Menyimpan tanda tangan digital / bukti persetujuan klausul anti-eksploitasi.
- **Tabel `adoption_follow_ups`**: Menyimpan unggahan berkala foto & status kesehatan hewan pasca adopsi.
- **Tabel `blacklist_records`**: Menyimpan identitas, nomor telepon, dan pola akun yang diblokir oleh admin/komunitas.

### 5.2 Fitur Frontend (React)
- Komponen `AdoptionSafetyBanner` di halaman `ReportDetailPage` dan `ChatPage`.
- Modal `AdoptionScreeningModal` sebelum tombol ajukan adopsi aktif.
- Panduan interaktif *"Anti-Snake Feeder & Safe Adoption Checklist"* di tab Informasi / Pusat Edukasi.

---

## 6. Kesimpulan

Dengan mengintegrasikan kuesioner terstruktur, pembatasan kuota adopsi, transparansi komunikasi melalui in-app chat, serta sistem pemantauan pasca-adopsi, StreetPet dapat meminimalisir ruang gerak oknum *snake feeder* dan memastikan hewan jalanan yang diselamatkan mendapatkan keluarga yang aman, bertanggung jawab, dan penuh kasih sayang.
