import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
  Linking,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Report, ActivityType } from '../types';
import { Flaticon } from '../components/Flaticon';
import { COLORS, clayStyles } from '../theme/clay';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ReportDetailScreenProps {
  reportId: number;
  onBack: () => void;
  onOpenChat: (userId: number, reportId: number) => void;
  onRequireAuth: () => void;
}

export const ReportDetailScreen: React.FC<ReportDetailScreenProps> = ({
  reportId,
  onBack,
  onOpenChat,
  onRequireAuth,
}) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIdx, setActiveImageIdx] = useState(0);


  // Feeding / Activity modal state
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [activityType, setActivityType] = useState<ActivityType>('fed');
  const [activityNotes, setActivityNotes] = useState('');
  const [submittingActivity, setSubmittingActivity] = useState(false);

  // Adoption modal state
  const [adoptModalOpen, setAdoptModalOpen] = useState(false);
  const [housingPermit, setHousingPermit] = useState(true);
  const [petHistory, setPetHistory] = useState('');
  const [financialReady, setFinancialReady] = useState(true);
  const [sterilCommit, setSterilCommit] = useState(true);
  const [antiAbuseAgreed, setAntiAbuseAgreed] = useState(false);
  const [submittingAdopt, setSubmittingAdopt] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/reports/${reportId}`);
      const reportData = res.data?.report || res.data?.data;
      if (reportData) {
        setReport(reportData);
      }
    } catch {
      Alert.alert('Error', 'Gagal memuat detail laporan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [reportId]);

  const handleOpenNavigation = () => {
    if (!report) return;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`;
    Linking.openURL(url);
  };

  const handleRecordActivity = async () => {
    if (!user) {
      setActivityModalOpen(false);
      onRequireAuth();
      return;
    }

    setSubmittingActivity(true);
    try {
      await api.post(`/reports/${reportId}/activity`, {
        activity_type: activityType,
        notes: activityNotes,
      });
      Alert.alert('Berhasil', 'Aksi komunitas berhasil dicatat!');
      setActivityModalOpen(false);
      setActivityNotes('');
      fetchDetail();
    } catch (err: any) {
      Alert.alert('Gagal', err.response?.data?.message || 'Terjadi kesalahan saat mencatat aksi.');
    } finally {
      setSubmittingActivity(false);
    }
  };

  const handleApplyAdoption = async () => {
    if (!user) {
      setAdoptModalOpen(false);
      onRequireAuth();
      return;
    }

    if (!antiAbuseAgreed) {
      Alert.alert('Persetujuan Wajib', 'Anda wajib menyetujui komitmen perlindungan hewan (tidak untuk pakan/komersial).');
      return;
    }

    setSubmittingAdopt(true);
    try {
      await api.post('/adoptions/submit', {
        report_id: reportId,
        screening_answers: {
          housing_type: 'house',
          housing_permit: housingPermit,
          pet_history: petHistory || 'Pernah memelihara',
          financial_readiness: financialReady,
          sterilization_commitment: sterilCommit,
        },
      });
      Alert.alert('Pengajuan Terkirim', 'Formulir skrining adopsi berhasil dikirim ke pelapor.');
      setAdoptModalOpen(false);
      fetchDetail();
    } catch (err: any) {
      Alert.alert('Gagal', err.response?.data?.message || 'Gagal mengajukan adopsi.');
    } finally {
      setSubmittingAdopt(false);
    }
  };

  const handleFlagReport = () => {
    Alert.alert(
      'Laporkan Pelanggaran',
      'Laporkan jika postingan ini melanggar kebijakan (jual-beli, pakan reptil / snake feeder, penyiksaan)?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Laporkan',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post('/moderation/flag', {
                report_id: reportId,
                reason: 'Terindikasi pelanggaran komunitas / snake feeder',
              });
              Alert.alert('Laporan Diterima', 'Terima kasih, tim moderator akan segera meninjau postingan ini.');
            } catch {
              Alert.alert('Info', 'Anda telah melaporkan postingan ini.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.brandDark} />
        <Text style={styles.loadingText}>Memuat detail anabul...</Text>
      </View>
    );
  }

  if (!report) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Laporan tidak ditemukan.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backBtnText}>← Kembali ke Peta</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const images = report.images && report.images.length > 0 ? report.images : [];
  const currentImage = images.length > 0 ? images[activeImageIdx]?.image_url : null;

  return (
    <View style={styles.container}>
      {/* Top App Bar with Safe Area */}
      <View style={[styles.topBar, { paddingTop: insets.top > 0 ? insets.top + 4 : 12 }]}>
        <TouchableOpacity onPress={onBack} style={styles.topBackBtn}>
          <Flaticon name="back" size={16} tintColor={COLORS.brandDark} />
          <Text style={styles.topBackText}>Peta</Text>
        </TouchableOpacity>
        <Text style={styles.topBarTitle} numberOfLines={1}>{report.title}</Text>
        <TouchableOpacity onPress={handleFlagReport} style={styles.topFlagBtn}>
          <Flaticon name="flag" size={14} tintColor={COLORS.danger} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: 100 + Math.max(insets.bottom, 16) }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          {currentImage ? (
            <Image source={{ uri: currentImage }} style={styles.detailImage} resizeMode="cover" />
          ) : (
            <View style={[styles.detailImage, styles.noImage]}>
              <Flaticon name="camera" size={48} tintColor={COLORS.textMuted} />
              <Text style={styles.noImageText}>Foto Tidak Tersedia</Text>
            </View>
          )}


          {/* Thumbnail Selector if multiple images */}
          {images.length > 1 && (
            <View style={styles.thumbRow}>
              {images.map((img, idx) => (
                <TouchableOpacity
                  key={img.id != null ? String(img.id) : `img-${idx}`}
                  style={[styles.thumbBox, activeImageIdx === idx && styles.thumbBoxActive]}
                  onPress={() => setActiveImageIdx(idx)}
                >
                  <Image source={{ uri: img.image_url }} style={styles.thumbImage} />
                </TouchableOpacity>
              ))}
            </View>
          )}

        </View>

        {/* Main Details Card */}
        <View style={[clayStyles.card, styles.mainCard]}>
          {/* Badge Tags */}
          <View style={styles.badgeRow}>
            <View style={[styles.tag, styles.petTag]}>
              <Flaticon
                name={report.pet_type === 'cat' ? 'cat' : 'dog'}
                size={14}
                tintColor={COLORS.brandDark}
              />
              <Text style={styles.petTagText}>
                {report.pet_type === 'cat' ? 'Kucing' : 'Anjing'} • {report.age_group === 'kitten_puppy' ? 'Anak' : 'Dewasa'}
              </Text>
            </View>

            <View style={[styles.tag, styles.conditionTag]}>
              <Text style={styles.conditionTagText}>
                {report.condition === 'critical' ? 'Kritis' : report.condition === 'injured' ? 'Terluka' : 'Sehat'}
              </Text>
            </View>

            <View style={[styles.tag, styles.statusTag]}>
              <Text style={styles.statusTagText}>{report.status.toUpperCase()}</Text>
            </View>
          </View>

          <Text style={styles.title}>{report.title}</Text>

          {/* Location & Navigation Row */}
          <View style={styles.locationSection}>
            <View style={styles.addressRow}>
              <Flaticon name="pin" size={16} tintColor={COLORS.brandDark} />
              <View style={styles.addressTextWrap}>
                <Text style={styles.addressNote}>{report.address_note || 'Lokasi jalanan'}</Text>
                <Text style={styles.gpsCoords}>
                  Koordinat: {Number(report.latitude).toFixed(4)}, {Number(report.longitude).toFixed(4)}
                  {report.is_masked ? ' (Disamarkan demi keamanan shelter)' : ''}
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.navLinkBtn} onPress={handleOpenNavigation}>
              <Flaticon name="pin" size={14} tintColor="#ffffff" />
              <Text style={styles.navLinkBtnText}>Buka Rute di Google Maps</Text>
            </TouchableOpacity>
          </View>

          {/* Description Section */}
          {report.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Deskripsi & Ciri Khusus</Text>
              <Text style={styles.descriptionText}>{report.description}</Text>
            </View>
          ) : null}

          {/* Anti-Snake Feeder Safety Notice */}
          <View style={styles.safetyBox}>
            <View style={styles.safetyHeader}>
              <Flaticon name="shield" size={18} tintColor="#166534" />
              <Text style={styles.safetyTitle}>Pakta Perlindungan Satwa</Text>
            </View>
            <Text style={styles.safetyText}>
              Platform ini melarang jual-beli, uang tebusan, dan eksploitasi pakan reptil (snake feeder). Seluruh calon adopter wajib menyelesaikan kuesioner verifikasi.
            </Text>
          </View>

          {/* Activity Timeline */}
          <View style={styles.section}>
            <View style={styles.timelineHeader}>
              <Text style={styles.sectionTitle}>Linimasa Kepedulian Warga ({report.activities?.length || 0})</Text>
              <TouchableOpacity onPress={() => setActivityModalOpen(true)}>
                <Text style={styles.addActivityText}>+ Catat Aksi</Text>
              </TouchableOpacity>
            </View>

            {report.activities && report.activities.length > 0 ? (
              report.activities.map((act, idx) => (
                <View key={act.id != null ? String(act.id) : `act-${idx}`} style={styles.timelineItem}>
                  <View style={styles.timelineDot} />
                  <View style={styles.timelineContent}>

                    <Text style={styles.timelineAction}>
                      {act.activity_type === 'fed'
                        ? 'Memberi Makan'
                        : act.activity_type === 'secured'
                        ? 'Diamankan'
                        : act.activity_type === 'treated'
                        ? 'Diberi Perawatan Medis'
                        : act.activity_type === 'adopted'
                        ? 'Resmi Diadopsi'
                        : 'Melihat Anabul'}{' '}
                      oleh {act.user?.name || 'Warga'}
                    </Text>
                    {act.notes ? <Text style={styles.timelineNotes}>{act.notes}</Text> : null}
                    <Text style={styles.timelineDate}>{new Date(act.created_at).toLocaleDateString('id-ID')}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyActivity}>Belum ada catatan aksi. Jadilah yang pertama memberi makan atau mengecek anabul ini!</Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Action Bar with Safe Area */}
      <View style={[styles.bottomActionBar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        <TouchableOpacity style={styles.actionBtnSec} onPress={() => setActivityModalOpen(true)}>
          <Flaticon name="food" size={16} tintColor={COLORS.brandDark} />
          <Text style={styles.actionBtnSecText}>Beri Makan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnSec}
          onPress={() => {
            if (!user) onRequireAuth();
            else if (report.user_id) onOpenChat(report.user_id, report.id);
          }}
        >
          <Flaticon name="chat" size={16} tintColor={COLORS.brandDark} />
          <Text style={styles.actionBtnSecText}>Chat Pelapor</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[clayStyles.btnPrimary, styles.actionBtnPrimary]}
          onPress={() => setAdoptModalOpen(true)}
        >
          <Text style={styles.actionBtnPrimaryText}>Ajukan Adopsi</Text>
        </TouchableOpacity>
      </View>

      {/* Feeding / Activity Modal */}
      <Modal visible={activityModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[clayStyles.card, styles.modalContent]}>
            <Text style={styles.modalTitle}>Catat Aksi Lapangan</Text>
            <Text style={styles.modalSubtitle}>Bagikan catatan pemberian makan, kondisi luka, atau evakuasi.</Text>

            <View style={styles.modalOptionRow}>
              {(['fed', 'sighted', 'secured'] as ActivityType[]).map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.modalOptionBtn, activityType === type && styles.modalOptionBtnActive]}
                  onPress={() => setActivityType(type)}
                >
                  <Text style={[styles.modalOptionText, activityType === type && styles.modalOptionTextActive]}>
                    {type === 'fed' ? 'Beri Makan' : type === 'sighted' ? 'Melihat' : 'Amankan'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[clayStyles.input, styles.modalInput]}
              placeholder="Catatan pakan/kondisi (misal: pakan basah 1 sachet, anabul responsif)..."
              placeholderTextColor={COLORS.textMuted}
              value={activityNotes}
              onChangeText={setActivityNotes}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setActivityModalOpen(false)}>
                <Text style={styles.modalCancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[clayStyles.btnPrimary, styles.modalConfirmBtn]}
                onPress={handleRecordActivity}
                disabled={submittingActivity}
              >
                {submittingActivity ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.modalConfirmBtnText}>Simpan Aksi</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Adoption Screening Modal */}
      <Modal visible={adoptModalOpen} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.adoptModalScroll} contentContainerStyle={[clayStyles.card, styles.modalContent]}>
            <Text style={styles.modalTitle}>Formulir Skrining Adopsi</Text>
            <Text style={styles.modalSubtitle}>Pastikan kesiapan Anda untuk memberikan rumah dan komitmen yang aman.</Text>

            <Text style={styles.formLabel}>Pengalaman Memelihara Hewan</Text>
            <TextInput
              style={[clayStyles.input, styles.modalInput]}
              placeholder="Ceritakan pengalaman memelihara hewan sebelumnya..."
              placeholderTextColor={COLORS.textMuted}
              value={petHistory}
              onChangeText={setPetHistory}
            />

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setHousingPermit(!housingPermit)}
            >
              <View style={[styles.checkboxBox, housingPermit && styles.checkboxBoxActive]}>
                {housingPermit && <Flaticon name="check" size={12} tintColor="#ffffff" />}
              </View>
              <Text style={styles.checkboxLabel}>Rumah/Hunian mengizinkan hewan peliharaan</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setFinancialReady(!financialReady)}
            >
              <View style={[styles.checkboxBox, financialReady && styles.checkboxBoxActive]}>
                {financialReady && <Flaticon name="check" size={12} tintColor="#ffffff" />}
              </View>
              <Text style={styles.checkboxLabel}>Siap secara finansial untuk pakan & perawatan medis/vaksin</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setSterilCommit(!sterilCommit)}
            >
              <View style={[styles.checkboxBox, sterilCommit && styles.checkboxBoxActive]}>
                {sterilCommit && <Flaticon name="check" size={12} tintColor="#ffffff" />}
              </View>
              <Text style={styles.checkboxLabel}>Berkomitmen untuk melakukan sterilisasi jika usia cukup</Text>
            </TouchableOpacity>

            {/* Anti-Snake Feeder Agreement */}
            <TouchableOpacity
              style={[styles.checkboxRow, styles.antiAbuseBox]}
              onPress={() => setAntiAbuseAgreed(!antiAbuseAgreed)}
            >
              <View style={[styles.checkboxBox, antiAbuseAgreed && styles.checkboxBoxDanger]}>
                {antiAbuseAgreed && <Flaticon name="check" size={12} tintColor="#ffffff" />}
              </View>
              <Text style={[styles.checkboxLabel, styles.antiAbuseText]}>
                Saya menyatakan TIDAK AKAN menjadikan hewan ini sebagai pakan predator (snake feeder), dijual kembali, atau disiksa.
              </Text>
            </TouchableOpacity>

            <View style={styles.modalBtnRow}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setAdoptModalOpen(false)}>
                <Text style={styles.modalCancelBtnText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[clayStyles.btnPrimary, styles.modalConfirmBtn, !antiAbuseAgreed && { opacity: 0.6 }]}
                onPress={handleApplyAdoption}
                disabled={submittingAdopt || !antiAbuseAgreed}
              >
                {submittingAdopt ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.modalConfirmBtnText}>Kirim Pengajuan</Text>}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  topBackBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  topBackText: { color: COLORS.brandDark, fontSize: 14, fontWeight: '700' },
  topBarTitle: { flex: 1, textAlign: 'center', fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginHorizontal: 12 },
  topFlagBtn: { padding: 4 },
  content: { paddingBottom: 120 },
  imageGallery: { width: '100%', height: 280, position: 'relative' },
  detailImage: { width: '100%', height: '100%' },
  noImage: { backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  noImageText: { color: COLORS.textMuted, marginTop: 8, fontSize: 13 },
  thumbRow: { position: 'absolute', bottom: 12, left: 16, right: 16, flexDirection: 'row', gap: 8 },
  thumbBox: { width: 44, height: 44, borderRadius: 8, overflow: 'hidden', borderWidth: 2, borderColor: '#ffffff' },
  thumbBoxActive: { borderColor: COLORS.brandDark },
  thumbImage: { width: '100%', height: '100%' },
  mainCard: { margin: 16, marginTop: -24, padding: 18, borderRadius: 24 },
  badgeRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  petTag: { backgroundColor: COLORS.brandLight },
  petTagText: { fontSize: 12, fontWeight: '800', color: COLORS.brandDark },
  conditionTag: { backgroundColor: COLORS.warningLight },
  conditionTagText: { color: '#d97706', fontSize: 12, fontWeight: '800' },
  statusTag: { backgroundColor: COLORS.lilacLight },
  statusTagText: { color: '#7c3aed', fontSize: 12, fontWeight: '800' },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 14 },
  locationSection: { backgroundColor: '#f8fafc', padding: 12, borderRadius: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border },
  addressRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  addressTextWrap: { flex: 1 },
  addressNote: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  gpsCoords: { fontSize: 11, color: COLORS.textMuted },
  navLinkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.brandDark, paddingVertical: 9, borderRadius: 10 },
  navLinkBtnText: { color: '#ffffff', fontSize: 12, fontWeight: '800' },
  section: { marginTop: 16, borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 14 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 8 },
  descriptionText: { fontSize: 14, color: COLORS.textSecondary, lineHeight: 21 },
  safetyBox: {
    backgroundColor: COLORS.successLight,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    padding: 14,
    borderRadius: 16,
    marginTop: 16,
  },
  safetyHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  safetyTitle: { fontSize: 13, fontWeight: '800', color: '#166534' },
  safetyText: { fontSize: 12, color: '#15803d', lineHeight: 17 },
  timelineHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  addActivityText: { fontSize: 12, fontWeight: '800', color: COLORS.brandDark },
  timelineItem: { flexDirection: 'row', marginTop: 10 },
  timelineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.brandDark, marginTop: 5, marginRight: 10 },
  timelineContent: { flex: 1 },
  timelineAction: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary },
  timelineNotes: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  timelineDate: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  emptyActivity: { fontSize: 12, color: COLORS.textMuted, fontStyle: 'italic', lineHeight: 17 },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    gap: 8,
  },
  actionBtnSec: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionBtnSecText: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  actionBtnPrimary: {
    flex: 1,
    paddingVertical: 10,
  },
  actionBtnPrimaryText: { fontSize: 13, fontWeight: '800', color: '#ffffff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 10, color: COLORS.textSecondary },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  errorText: { fontSize: 15, fontWeight: '700', color: COLORS.danger, marginBottom: 12 },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: COLORS.brandLight, borderRadius: 10 },
  backBtnText: { color: COLORS.brandDark, fontWeight: '700' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  adoptModalScroll: { maxHeight: '85%' },
  modalTitle: { fontSize: 18, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 4 },
  modalSubtitle: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 14 },
  modalOptionRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  modalOptionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  modalOptionBtnActive: { backgroundColor: COLORS.brandLight, borderColor: COLORS.brandDark },
  modalOptionText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  modalOptionTextActive: { color: COLORS.brandDark, fontWeight: '700' },
  formLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 6 },
  modalInput: { marginBottom: 12 },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 10 },
  checkboxBox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: COLORS.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxBoxActive: { backgroundColor: COLORS.brandDark, borderColor: COLORS.brandDark },
  checkboxBoxDanger: { backgroundColor: COLORS.danger, borderColor: COLORS.danger },
  checkboxLabel: { flex: 1, fontSize: 12, color: COLORS.textPrimary, fontWeight: '500' },
  antiAbuseBox: { backgroundColor: COLORS.dangerLight, padding: 10, borderRadius: 12, borderWidth: 1, borderColor: '#fecaca' },
  antiAbuseText: { color: '#991b1b', fontWeight: '700' },
  modalBtnRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  modalCancelBtn: { flex: 1, paddingVertical: 12, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center' },
  modalCancelBtnText: { color: COLORS.textSecondary, fontWeight: '700' },
  modalConfirmBtn: { flex: 1, paddingVertical: 12, borderRadius: 14 },
  modalConfirmBtnText: { color: '#ffffff', fontWeight: '800' },
});
