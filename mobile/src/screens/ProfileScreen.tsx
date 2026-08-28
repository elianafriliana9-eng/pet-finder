import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import api, { DEFAULT_API_URL } from '../api/client';
import { Flaticon } from '../components/Flaticon';
import { COLORS, clayStyles } from '../theme/clay';

export const ProfileScreen: React.FC = () => {
  const { user, login, register, logout } = useAuth();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  // Custom API URL configuration
  const [customApiUrl, setCustomApiUrl] = useState(DEFAULT_API_URL);

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem('custom_api_url');
      if (saved) setCustomApiUrl(saved);
    })();
  }, []);

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Validasi Gagal', 'Email dan password wajib diisi.');
      return;
    }

    setLoading(true);
    try {
      if (isLoginTab) {
        await login(email.trim(), password);
        Alert.alert('Berhasil Masuk', `Selamat datang kembali!`);
      } else {
        if (!name.trim()) {
          Alert.alert('Validasi Gagal', 'Nama lengkap wajib diisi.');
          setLoading(false);
          return;
        }
        await register(name.trim(), email.trim(), password, phone.trim() || undefined);
        Alert.alert('Registrasi Berhasil', 'Akun Anda telah terdaftar.');
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Autentikasi gagal. Periksa kembali email, password, dan koneksi server.';
      Alert.alert('Gagal', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApiUrl = async () => {
    if (!customApiUrl.trim()) return;
    api.defaults.baseURL = customApiUrl.trim();
    await AsyncStorage.setItem('custom_api_url', customApiUrl.trim());
    Alert.alert('API URL Disimpan', `Base URL: ${customApiUrl.trim()}`);
  };

  // If user is logged in
  if (user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Claymorphic Profile Card */}
        <View style={[clayStyles.card, styles.profileCard]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileEmail}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>{user.role.toUpperCase()}</Text>
          </View>
        </View>

        {/* Safety & App Guidelines */}
        <View style={[clayStyles.cardSoft, styles.sectionCard]}>
          <View style={styles.sectionTitleRow}>
            <Flaticon name="shield" size={16} tintColor={COLORS.brandDark} />
            <Text style={styles.sectionTitle}>Kebijakan StreetPet</Text>
          </View>
          <Text style={styles.policyItem}>• Bebas komersialisasi hewan (Zero Animal Sale).</Text>
          <Text style={styles.policyItem}>• Skrining ketat pencegahan pakan reptil (Anti-Snake Feeder).</Text>
          <Text style={styles.policyItem}>• Penyamaran koordinat shelter dari penelantaran massal.</Text>
        </View>

        {/* API Settings */}
        <View style={[clayStyles.cardSoft, styles.sectionCard]}>
          <Text style={styles.sectionTitle}>Pengaturan Server API (Backend)</Text>
          <TextInput
            style={[clayStyles.input, styles.input]}
            value={customApiUrl}
            onChangeText={setCustomApiUrl}
            placeholder="http://192.168.1.X:8001/api atau http://10.0.2.2:8001/api"
            placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity style={styles.saveApiBtn} onPress={handleUpdateApiUrl}>
            <Text style={styles.saveApiBtnText}>Simpan Endpoint</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutBtnText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  // Not logged in: Login/Register View
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.authHeader}>
        <Text style={styles.appBrand}>StreetPet</Text>
        <Text style={styles.appBrandSub}>Rescue & Adoption Platform</Text>
      </View>

      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabBtn, isLoginTab && styles.tabBtnActive]}
          onPress={() => setIsLoginTab(true)}
        >
          <Text style={[styles.tabText, isLoginTab && styles.tabTextActive]}>Masuk</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabBtn, !isLoginTab && styles.tabBtnActive]}
          onPress={() => setIsLoginTab(false)}
        >
          <Text style={[styles.tabText, !isLoginTab && styles.tabTextActive]}>Daftar</Text>
        </TouchableOpacity>
      </View>

      {/* Claymorphic Form Card */}
      <View style={[clayStyles.card, styles.formCard]}>
        {!isLoginTab && (
          <>
            <Text style={styles.label}>Nama Lengkap *</Text>
            <TextInput
              style={[clayStyles.input, styles.input]}
              placeholder="Contoh: Rian Pratama"
              placeholderTextColor={COLORS.textMuted}
              value={name}
              onChangeText={setName}
            />
          </>
        )}

        <Text style={styles.label}>Email *</Text>
        <TextInput
          style={[clayStyles.input, styles.input]}
          placeholder="email@example.com"
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        {!isLoginTab && (
          <>
            <Text style={styles.label}>Nomor WhatsApp / HP (Opsional)</Text>
            <TextInput
              style={[clayStyles.input, styles.input]}
              placeholder="08123456789"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
            />
          </>
        )}

        <Text style={styles.label}>Kata Sandi *</Text>
        <TextInput
          style={[clayStyles.input, styles.input]}
          placeholder="Minimal 8 karakter"
          placeholderTextColor={COLORS.textMuted}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={[clayStyles.btnPrimary, styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.submitBtnText}>{isLoginTab ? 'Masuk ke Akun' : 'Daftar Sekarang'}</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* API Endpoint Configuration */}
      <View style={[clayStyles.cardSoft, styles.sectionCard]}>
        <Text style={styles.sectionTitle}>Pengaturan Server API (Dev)</Text>
        <TextInput
          style={[clayStyles.input, styles.input]}
          value={customApiUrl}
          onChangeText={setCustomApiUrl}
          placeholder="http://192.168.1.X:8001/api atau http://10.0.2.2:8001/api"
          placeholderTextColor={COLORS.textMuted}
        />
        <TouchableOpacity style={styles.saveApiBtn} onPress={handleUpdateApiUrl}>
          <Text style={styles.saveApiBtnText}>Ubah Base URL</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 40 },
  authHeader: { alignItems: 'center', marginVertical: 20 },
  appBrand: { fontSize: 26, fontWeight: '900', color: COLORS.brandDark },
  appBrandSub: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  tabRow: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 14, padding: 4, marginBottom: 16 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabBtnActive: { backgroundColor: COLORS.surface },
  tabText: { fontSize: 13, fontWeight: '700', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.brandDark },
  formCard: { padding: 18, marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary, marginTop: 10, marginBottom: 6 },
  input: { marginBottom: 6 },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 18,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#ffffff', fontSize: 14, fontWeight: '800' },
  profileCard: {
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: COLORS.brandLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#bae6fd',
  },
  avatarText: { fontSize: 26, fontWeight: '900', color: COLORS.brandDark },
  profileName: { fontSize: 20, fontWeight: '900', color: COLORS.textPrimary },
  profileEmail: { fontSize: 13, color: COLORS.textSecondary, marginTop: 2 },
  roleBadge: { marginTop: 10, backgroundColor: COLORS.successLight, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  roleText: { fontSize: 11, fontWeight: '800', color: COLORS.success },
  sectionCard: { padding: 16, marginTop: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 6 },
  policyItem: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 4 },
  saveApiBtn: { backgroundColor: '#f1f5f9', paddingVertical: 10, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  saveApiBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.textPrimary },
  logoutBtn: { backgroundColor: COLORS.dangerLight, paddingVertical: 14, borderRadius: 16, alignItems: 'center', marginTop: 20, borderWidth: 1, borderColor: '#fecaca' },
  logoutBtnText: { color: COLORS.danger, fontSize: 14, fontWeight: '800' },
});
