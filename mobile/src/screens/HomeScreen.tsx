import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  Modal,
} from 'react-native';
import api from '../api/client';
import { Contributor } from '../types';
import { Flaticon } from '../components/Flaticon';
import { COLORS, clayStyles } from '../theme/clay';

interface HomeScreenProps {
  onNavigateExplore: () => void;
  onNavigateReport: () => void;
  onNavigateChat: () => void;
}

interface Advertisement {
  id: number;
  brand_name: string;
  title: string;
  description: string;
  banner_url: string;
  target_url: string;
  cta_text: string;
}

interface Article {
  id: string;
  tag: string;
  title: string;
  readTime: string;
  image: string;
  summary: string;
  content: string;
}

const ARTICLES: Article[] = [
  {
    id: '1',
    tag: 'Keamanan Adopsi',
    title: 'Waspada Snake Feeder: Ciri Modus Penyamaran & Pencegahan',
    readTime: '3 mnt',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop&q=80',
    summary: 'Ketahui motif oknum pemburu pakan reptil gratis dan langkah skrining wajib sebelum menyerahkan anabul.',
    content: `Istilah Snake Feeder merujuk pada oknum pemelihara reptil karnivora yang berpura-pura mengadopsi anabul kecil (terutama kitten/puppy) untuk dijadikan pakan hidup (live prey).

Langkah pencegahan utama:
1. Wajibkan formulir komitmen adopsi dan verifikasi identitas resmi.
2. Hindari serah terima terburu-buru melalui kurir instan tanpa tatap muka/video call.
3. Terapkan pemantauan berkala (foto/video kondisi anabul di rumah baru).
4. Laporkan akun atau nomor telepon yang meminta banyak anak kucing sekaligus.`,
  },
  {
    id: '2',
    tag: 'Street Feeding',
    title: 'Etika Street Feeding: Beri Makan Tanpa Mengotori Lingkungan',
    readTime: '4 mnt',
    image: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80',
    summary: 'Tips memberi makan kucing & anjing jalanan dengan pakan tepat dan menjaga kebersihan fasilitas umum.',
    content: `Street feeding adalah aksi mulia, namun harus dilakukan secara higienis dan bertanggung jawab:
- Gunakan wadah pakan sekali pakai atau bersihkan sisa makanan basah setelah anabul selesai makan.
- Siapkan air bersih dalam wadah terpisah agar anabul terhindar dari dehidrasi.
- Jangan meletakkan pakan di jalan raya aktif atau area lalu lintas kendaraan.
- Catat aktivitas pemberian pakan di aplikasi StreetPet agar warga lain mengetahui anabul sudah tercukupi nutrisinya.`,
  },
  {
    id: '3',
    tag: 'Kesehatan Anabul',
    title: 'Program TNR (Trap-Neuter-Return) untuk Menekan Populasi',
    readTime: '5 mnt',
    image: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&auto=format&fit=crop&q=80',
    summary: 'Mengapa sterilisasi adalah solusi paling manusiawi dan efektif untuk kesejahteraan hewan jalanan.',
    content: `TNR (Tangkap-Steril-Lepas Liar) adalah metode teruji global untuk mengontrol populasi kucing liar secara etis.
Manfaat TNR:
- Mencegah ledakan populasi kitten yang berujung kematian karena malnutrisi.
- Mengurangi perkelahian teritorial antar jantan dan penularan penyakit virus.
- Membantu anabul jalanan hidup lebih sehat dan tenteram berdampingan dengan masyarakat.`,
  },
];

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateExplore,
  onNavigateReport,
}) => {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const adsRes = await api.get('/ads', { params: { placement: 'explore_sidebar' } });
        if (adsRes.data?.data && Array.isArray(adsRes.data.data)) {
          setAds(adsRes.data.data);
        }
      } catch {}

      try {
        const leadRes = await api.get('/leaderboard');
        if (leadRes.data?.data && Array.isArray(leadRes.data.data)) {
          setContributors(leadRes.data.data);
        }
      } catch {}
    })();
  }, []);

  const handleOpenAd = async (ad: Advertisement) => {
    try {
      await api.post(`/ads/${ad.id}/click`);
    } catch {}
    if (ad.target_url) {
      Linking.openURL(ad.target_url);
    }
  };

  const getBadgeStyle = (badgeKey: string) => {
    switch (badgeKey) {
      case 'rescue_hero':
        return { bg: COLORS.dangerLight, text: COLORS.danger, border: '#fecaca' };
      case 'top_feeder':
        return { bg: COLORS.warningLight, text: '#d97706', border: '#fde68a' };
      case 'scout':
        return { bg: COLORS.brandLight, text: COLORS.brandDark, border: '#bae6fd' };
      default:
        return { bg: COLORS.lilacLight, text: '#7c3aed', border: '#e9d5ff' };
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Hero Welcome Card */}
      <View style={[clayStyles.card, styles.heroCard]}>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroTag}>Peduli Anabul Jalanan</Text>
          <Text style={styles.heroTitle}>Selamatkan, Rawat, & Adopsi</Text>
          <Text style={styles.heroSubtitle}>
            Jaringan komunitas non-profit pelindung kucing dan anjing terlantar di Indonesia.
          </Text>
        </View>

        <View style={styles.quickActionRow}>
          <TouchableOpacity
            style={[clayStyles.btnPrimary, styles.quickBtn]}
            onPress={onNavigateReport}
          >
            <Flaticon name="plus" size={16} tintColor="#ffffff" />
            <Text style={styles.quickBtnText}>Lapor Hewan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickBtnSec}
            onPress={onNavigateExplore}
          >
            <Flaticon name="search" size={16} tintColor={COLORS.brandDark} />
            <Text style={styles.quickBtnSecText}>Buka Peta</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Top Active Contributors & Badges Leaderboard */}
      {contributors.length > 0 && (
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <Flaticon name="shield" size={18} tintColor={COLORS.brandDark} />
              <Text style={styles.sectionTitle}>Warga Paling Aktif</Text>
            </View>
            <Text style={styles.sectionSubTitle}>Peringkat & Badge</Text>
          </View>

          <View style={styles.contributorList}>
            {contributors.slice(0, 4).map((c, index) => {
              const bStyle = getBadgeStyle(c.badge_key);
              return (
                <View key={c.id} style={[clayStyles.cardSoft, styles.contributorCard]}>
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankText}>#{index + 1}</Text>
                  </View>

                  <View style={styles.contributorAvatar}>
                    <Text style={styles.avatarLetter}>{c.name.charAt(0).toUpperCase()}</Text>
                  </View>

                  <View style={styles.contributorInfo}>
                    <Text style={styles.contributorName} numberOfLines={1}>{c.name}</Text>
                    <View style={[styles.badgePill, { backgroundColor: bStyle.bg, borderColor: bStyle.border }]}>
                      <Text style={[styles.badgePillText, { color: bStyle.text }]}>{c.badge}</Text>
                    </View>
                    <Text style={styles.contributorStats}>
                      {c.reports_count > 0 ? `${c.reports_count} Laporan  ` : ''}
                      {c.fed_count > 0 ? `${c.fed_count} Feeding  ` : ''}
                      {c.rescue_count > 0 ? `${c.rescue_count} Rescue` : ''}
                    </Text>
                  </View>

                  <View style={styles.pointsWrap}>
                    <Text style={styles.pointsVal}>{c.points}</Text>
                    <Text style={styles.pointsLabel}>Poin</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      )}

      {/* Sponsored Ads Section */}
      {ads.length > 0 && (
        <View style={styles.sectionWrap}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Sponsor Komunitas</Text>
            <Text style={styles.adBadge}>MITRA RESMI</Text>
          </View>

          {ads.map((ad) => (
            <TouchableOpacity
              key={ad.id}
              style={[clayStyles.card, styles.adCard]}
              activeOpacity={0.9}
              onPress={() => handleOpenAd(ad)}
            >
              <Image source={{ uri: ad.banner_url }} style={styles.adImage} resizeMode="cover" />
              <View style={styles.adContent}>
                <Text style={styles.adBrand}>{ad.brand_name}</Text>
                <Text style={styles.adTitle}>{ad.title}</Text>
                <Text style={styles.adDesc} numberOfLines={2}>{ad.description}</Text>
                <View style={styles.adCtaWrap}>
                  <Text style={styles.adCtaText}>{ad.cta_text} →</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Articles & Guides Section */}
      <View style={styles.sectionWrap}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Artikel & Panduan Rescue</Text>
          <Text style={styles.sectionSubTitle}>Edukasi Perawatan</Text>
        </View>

        {ARTICLES.map((article) => (
          <TouchableOpacity
            key={article.id}
            style={[clayStyles.cardSoft, styles.articleCard]}
            activeOpacity={0.85}
            onPress={() => setSelectedArticle(article)}
          >
            <Image source={{ uri: article.image }} style={styles.articleImage} />
            <View style={styles.articleContent}>
              <View style={styles.articleMeta}>
                <Text style={styles.articleTag}>{article.tag}</Text>
                <Text style={styles.articleReadTime}>• {article.readTime}</Text>
              </View>
              <Text style={styles.articleTitle} numberOfLines={2}>{article.title}</Text>
              <Text style={styles.articleSummary} numberOfLines={2}>{article.summary}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Article Reader Modal */}
      <Modal visible={selectedArticle !== null} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[clayStyles.card, styles.modalCard]}>
            {selectedArticle && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <Image source={{ uri: selectedArticle.image }} style={styles.modalImage} />
                <View style={styles.modalBody}>
                  <Text style={styles.modalTag}>{selectedArticle.tag}</Text>
                  <Text style={styles.modalTitle}>{selectedArticle.title}</Text>
                  <Text style={styles.modalContentText}>{selectedArticle.content}</Text>

                  <TouchableOpacity
                    style={[clayStyles.btnPrimary, styles.modalCloseBtn]}
                    onPress={() => setSelectedArticle(null)}
                  >
                    <Text style={styles.modalCloseBtnText}>Tutup Artikel</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },

  // Hero Card
  heroCard: {
    padding: 18,
    backgroundColor: '#ffffff',
    borderColor: '#e0f2fe',
    marginBottom: 16,
  },
  heroTextWrap: { marginBottom: 14 },
  heroTag: { fontSize: 11, fontWeight: '800', color: COLORS.brandDark, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 6 },
  heroSubtitle: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18 },
  quickActionRow: { flexDirection: 'row', gap: 10 },
  quickBtn: { flex: 1, flexDirection: 'row', gap: 6, paddingVertical: 11, borderRadius: 14 },
  quickBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },
  quickBtnSec: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  quickBtnSecText: { color: COLORS.brandDark, fontSize: 13, fontWeight: '800' },

  // Leaderboard / Badge Section
  sectionWrap: { marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 17, fontWeight: '900', color: COLORS.textPrimary },
  sectionSubTitle: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  contributorList: { gap: 8 },
  contributorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  rankText: { fontSize: 11, fontWeight: '900', color: COLORS.textSecondary },
  contributorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  avatarLetter: { fontSize: 16, fontWeight: '900', color: COLORS.brandDark },
  contributorInfo: { flex: 1 },
  contributorName: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 2 },
  badgePill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 3,
  },
  badgePillText: { fontSize: 10, fontWeight: '800' },
  contributorStats: { fontSize: 11, color: COLORS.textMuted },
  pointsWrap: { alignItems: 'flex-end', marginLeft: 8 },
  pointsVal: { fontSize: 15, fontWeight: '900', color: COLORS.brandDark },
  pointsLabel: { fontSize: 10, color: COLORS.textMuted },

  // Ads Card
  adBadge: { fontSize: 10, fontWeight: '800', color: COLORS.brandDark, backgroundColor: COLORS.brandLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  adCard: { overflow: 'hidden', marginBottom: 12 },
  adImage: { width: '100%', height: 140 },
  adContent: { padding: 14 },
  adBrand: { fontSize: 11, fontWeight: '800', color: COLORS.brandDark, textTransform: 'uppercase', marginBottom: 2 },
  adTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  adDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17, marginBottom: 8 },
  adCtaWrap: { alignSelf: 'flex-start' },
  adCtaText: { fontSize: 12, fontWeight: '800', color: COLORS.brandDark },

  // Article Card
  articleCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 16,
    marginBottom: 10,
    alignItems: 'center',
  },
  articleImage: { width: 80, height: 80, borderRadius: 12 },
  articleContent: { flex: 1, marginLeft: 12 },
  articleMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  articleTag: { fontSize: 11, fontWeight: '700', color: COLORS.brandDark },
  articleReadTime: { fontSize: 11, color: COLORS.textMuted },
  articleTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 3 },
  articleSummary: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 16 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { maxHeight: '85%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 24, overflow: 'hidden' },
  modalImage: { width: '100%', height: 200 },
  modalBody: { padding: 18 },
  modalTag: { fontSize: 12, fontWeight: '800', color: COLORS.brandDark, marginBottom: 4 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 12 },
  modalContentText: { fontSize: 14, color: COLORS.textPrimary, lineHeight: 22, marginBottom: 20 },
  modalCloseBtn: { paddingVertical: 12, borderRadius: 14 },
  modalCloseBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
});
