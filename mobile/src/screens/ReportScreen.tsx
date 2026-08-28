import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { PetType, PetCondition, PetAgeGroup } from '../types';
import { Flaticon } from '../components/Flaticon';
import { COLORS, clayStyles } from '../theme/clay';

interface ReportScreenProps {
  onSuccess: (reportId: number) => void;
  onRequireAuth: () => void;
}

export const ReportScreen: React.FC<ReportScreenProps> = ({ onSuccess, onRequireAuth }) => {
  const { user } = useAuth();
  const [petType, setPetType] = useState<PetType>('cat');
  const [ageGroup, setAgeGroup] = useState<PetAgeGroup>('kitten_puppy');
  const [condition, setCondition] = useState<PetCondition>('healthy');
  const [petCount, setPetCount] = useState('1');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addressNote, setAddressNote] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Izin Dibutuhkan', 'Izin akses galeri dibutuhkan untuk mengunggah foto hewan.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleGetLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Izin Lokasi', 'Izin GPS dibutuhkan untuk menentukan lokasi akurat penemuan hewan.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
      Alert.alert('Lokasi Terkunci', `Lat: ${loc.coords.latitude.toFixed(4)}, Lng: ${loc.coords.longitude.toFixed(4)}`);
    } catch {
      Alert.alert('Gagal Mendeteksi Lokasi', 'Pastikan GPS perangkat Anda aktif.');
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      Alert.alert('Login Diperlukan', 'Silakan masuk terlebih dahulu untuk membuat laporan.', [
        { text: 'Batal', style: 'cancel' },
        { text: 'Masuk', onPress: onRequireAuth },
      ]);
      return;
    }

    if (!title.trim()) {
      Alert.alert('Validasi Gagal', 'Mohon isi judul laporan.');
      return;
    }

    if (!location) {
      Alert.alert('Validasi Gagal', 'Mohon kunci lokasi GPS penemuan hewan.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('pet_type', petType);
      formData.append('age_group', ageGroup);
      formData.append('condition', condition);
      formData.append('pet_count', petCount || '1');
      formData.append('title', title);
      formData.append('description', description);
      formData.append('address_note', addressNote);
      formData.append('latitude', String(location.lat));
      formData.append('longitude', String(location.lng));

      if (imageUri) {
        const filename = imageUri.split('/').pop() || 'photo.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append('images[]', {
          uri: imageUri,
          name: filename,
          type,
        } as any);
      }

      const res = await api.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.data?.id) {
        Alert.alert('Berhasil', 'Laporan hewan jalanan berhasil dipublikasikan!');
        onSuccess(res.data.data.id);
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal mengirim laporan. Cek koneksi backend.';
      Alert.alert('Gagal Mengirim Laporan', message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.screenTitle}>Laporkan Hewan Jalanan</Text>
      <Text style={styles.screenSubtitle}>Bantu hewan jalanan terlantar ditemukan oleh adopter atau shelter.</Text>

      {/* Photo Picker Box */}
      <TouchableOpacity
        style={[clayStyles.cardSoft, styles.photoBox]}
        onPress={handlePickImage}
        activeOpacity={0.8}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.pickedImage} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Flaticon name="camera" size={36} tintColor={COLORS.brand} />
            <Text style={styles.photoPlaceholderText}>Pilih Foto Hewan</Text>
            <Text style={styles.photoPlaceholderSub}>Format JPG, PNG (maksimal 5MB)</Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Pet Type */}
      <Text style={styles.label}>Jenis Hewan</Text>
      <View style={styles.optionRow}>
        {(['cat', 'dog'] as PetType[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.optionBtn, petType === t && styles.optionBtnActive]}
            onPress={() => setPetType(t)}
          >
            <Flaticon
              name={t === 'cat' ? 'cat' : 'dog'}
              size={16}
              tintColor={petType === t ? COLORS.brandDark : COLORS.textSecondary}
            />
            <Text style={[styles.optionText, petType === t && styles.optionTextActive]}>
              {t === 'cat' ? 'Kucing' : 'Anjing'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Age Group */}
      <Text style={styles.label}>Usia Hewan</Text>
      <View style={styles.optionRow}>
        {(['kitten_puppy', 'adult', 'senior'] as PetAgeGroup[]).map((a) => (
          <TouchableOpacity
            key={a}
            style={[styles.optionBtn, ageGroup === a && styles.optionBtnActive]}
            onPress={() => setAgeGroup(a)}
          >
            <Text style={[styles.optionText, ageGroup === a && styles.optionTextActive]}>
              {a === 'kitten_puppy' ? 'Anak' : a === 'adult' ? 'Dewasa' : 'Senior'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Condition */}
      <Text style={styles.label}>Kondisi Fisik</Text>
      <View style={styles.optionRow}>
        {(['healthy', 'injured', 'critical'] as PetCondition[]).map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.optionBtn, condition === c && styles.optionBtnActive]}
            onPress={() => setCondition(c)}
          >
            <Text style={[styles.optionText, condition === c && styles.optionTextActive]}>
              {c === 'healthy' ? 'Sehat' : c === 'injured' ? 'Terluka' : 'Kritis (Darurat)'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Title */}
      <Text style={styles.label}>Judul Laporan *</Text>
      <TextInput
        style={[clayStyles.input, styles.input]}
        placeholder="Contoh: Kucing oranye terlantar di depan ruko"
        placeholderTextColor={COLORS.textMuted}
        value={title}
        onChangeText={setTitle}
      />

      {/* Address Note */}
      <Text style={styles.label}>Patokan / Catatan Alamat</Text>
      <TextInput
        style={[clayStyles.input, styles.input]}
        placeholder="Contoh: Depan Indomaret Jl. Sudirman, di bawah pohon"
        placeholderTextColor={COLORS.textMuted}
        value={addressNote}
        onChangeText={setAddressNote}
      />

      {/* Description */}
      <Text style={styles.label}>Deskripsi & Ciri-ciri Tambahan</Text>
      <TextInput
        style={[clayStyles.input, styles.textArea]}
        placeholder="Ciri khusus, corak warna, luka fisik, atau perilaku..."
        placeholderTextColor={COLORS.textMuted}
        multiline
        numberOfLines={4}
        value={description}
        onChangeText={setDescription}
      />

      {/* Location GPS */}
      <Text style={styles.label}>Titik Koordinat Lokasi *</Text>
      <TouchableOpacity
        style={[styles.gpsBtn, location ? styles.gpsBtnDone : null]}
        onPress={handleGetLocation}
        disabled={locating}
      >
        {locating ? (
          <ActivityIndicator color={COLORS.brandDark} />
        ) : (
          <View style={styles.gpsRow}>
            <Flaticon
              name="pin"
              size={16}
              tintColor={location ? COLORS.success : COLORS.brandDark}
            />
            <Text style={[styles.gpsBtnText, location ? styles.gpsBtnTextDone : null]}>
              {location
                ? `Lokasi Terkunci (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})`
                : 'Deteksi Lokasi Saya Sekarang (GPS)'}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Submit Button */}
      <TouchableOpacity
        style={[clayStyles.btnPrimary, styles.submitBtn, submitting && styles.submitBtnDisabled]}
        onPress={handleSubmit}
        disabled={submitting}
      >
        {submitting ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.submitBtnText}>Kirim Laporan Hewan</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  screenTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  screenSubtitle: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 16 },
  photoBox: {
    width: '100%',
    height: 180,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickedImage: { width: '100%', height: '100%' },
  photoPlaceholder: { alignItems: 'center' },
  photoPlaceholderText: { fontSize: 14, color: COLORS.brandDark, fontWeight: '700', marginTop: 8 },
  photoPlaceholderSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.textPrimary, marginTop: 12, marginBottom: 6 },
  optionRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 4 },
  optionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minWidth: 80,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  optionBtnActive: {
    backgroundColor: COLORS.brandLight,
    borderColor: COLORS.brand,
  },
  optionText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '600' },
  optionTextActive: { color: COLORS.brandDark, fontWeight: '700' },
  input: { marginBottom: 6 },
  textArea: { height: 90, textAlignVertical: 'top', marginBottom: 6 },
  gpsBtn: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#bae6fd',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
  },
  gpsBtnDone: { backgroundColor: COLORS.successLight, borderColor: '#86efac' },
  gpsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gpsBtnText: { color: COLORS.brandDark, fontSize: 13, fontWeight: '700' },
  gpsBtnTextDone: { color: COLORS.success },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 12,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#ffffff', fontSize: 15, fontWeight: '800' },
});
