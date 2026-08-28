import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Dimensions,
  Animated,
  PanResponder,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../api/client';
import { Report } from '../types';
import { Flaticon } from '../components/Flaticon';
import { COLORS, clayStyles } from '../theme/clay';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SNAP_COLLAPSED = 140;
const SNAP_EXPANDED = Math.min(SCREEN_HEIGHT * 0.60, 500);

interface ExploreScreenProps {
  onSelectReport: (reportId: number) => void;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({ onSelectReport }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [petTypeFilter, setPetTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);

  const mapRef = useRef<MapView | null>(null);
  const sheetHeight = useRef(new Animated.Value(SNAP_COLLAPSED)).current;
  const currentHeight = useRef(SNAP_COLLAPSED);

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5,
      onPanResponderMove: (_, gesture) => {
        const newHeight = currentHeight.current - gesture.dy;
        if (newHeight >= SNAP_COLLAPSED && newHeight <= SNAP_EXPANDED) {
          sheetHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        const newHeight = currentHeight.current - gesture.dy;
        let snapTo = SNAP_COLLAPSED;

        if (gesture.vy < -0.3 || (newHeight > (SNAP_COLLAPSED + SNAP_EXPANDED) / 2 && gesture.vy <= 0)) {
          snapTo = SNAP_EXPANDED;
        } else {
          snapTo = SNAP_COLLAPSED;
        }

        currentHeight.current = snapTo;
        Animated.spring(sheetHeight, {
          toValue: snapTo,
          useNativeDriver: false,
          bounciness: 4,
        }).start();
      },
    })
  ).current;

  const snapSheetTo = (height: number) => {
    currentHeight.current = height;
    Animated.spring(sheetHeight, {
      toValue: height,
      useNativeDriver: false,
      bounciness: 4,
    }).start();
  };

  const fetchLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setUserLocation(coords);
        return coords;
      }
    } catch {
      // Fallback
    }
    return { lat: -6.2088, lng: 106.8456 };
  };

  const fetchReports = useCallback(async (loc?: { lat: number; lng: number } | null) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const activeLoc = loc !== undefined ? loc : userLocation;
      const params: Record<string, any> = {
        radius: 100,
      };
      if (activeLoc) {
        params.lat = activeLoc.lat;
        params.lng = activeLoc.lng;
      }
      if (petTypeFilter !== 'all') {
        params.pet_type = petTypeFilter;
      }

      let res = await api.get('/reports', { params });
      let items = Array.isArray(res.data?.data)
        ? res.data.data
        : (res.data?.data?.data || []);

      if (items.length === 0 && activeLoc) {
        const fallbackParams: Record<string, any> = {};
        if (petTypeFilter !== 'all') fallbackParams.pet_type = petTypeFilter;
        res = await api.get('/reports', { params: fallbackParams });
        items = Array.isArray(res.data?.data)
          ? res.data.data
          : (res.data?.data?.data || []);
      }

      setReports(items);

      if (items.length > 0 && mapRef.current) {
        const first = items[0];
        mapRef.current.animateToRegion({
          latitude: Number(first.latitude),
          longitude: Number(first.longitude),
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        });
      }
    } catch (err: any) {
      setReports([]);
      setErrorMessage('Koneksi ke backend belum terhubung. Pastikan Laravel API berjalan pada port 8001.');
    } finally {
      setLoading(false);
    }
  }, [userLocation, petTypeFilter]);

  useEffect(() => {
    (async () => {
      const loc = await fetchLocation();
      if (loc && mapRef.current) {
        mapRef.current.animateToRegion({
          latitude: loc.lat,
          longitude: loc.lng,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });
      }
      fetchReports(loc);
    })();
  }, [petTypeFilter]);

  const handleCenterUser = async () => {
    const loc = await fetchLocation();
    if (loc && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: loc.lat,
        longitude: loc.lng,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      });
    }
  };

  const handleMarkerPress = (report: Report) => {
    setSelectedMarkerId(report.id);
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: Number(report.latitude),
        longitude: Number(report.longitude),
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      });
    }
    snapSheetTo(SNAP_EXPANDED);
  };

  const reportList = Array.isArray(reports) ? reports : [];
  const filteredReports = reportList.filter((r) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (r.title && r.title.toLowerCase().includes(q)) ||
      (r.address_note && r.address_note.toLowerCase().includes(q)) ||
      (r.description && r.description.toLowerCase().includes(q))
    );
  });

  const selectedReport = selectedMarkerId
    ? reportList.find((r) => r.id === selectedMarkerId) || null
    : null;

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case 'critical': return COLORS.danger;
      case 'injured': return COLORS.warning;
      default: return COLORS.success;
    }
  };

  const initialRegion = {
    latitude: userLocation?.lat || -6.2088,
    longitude: userLocation?.lng || 106.8456,
    latitudeDelta: 0.08,
    longitudeDelta: 0.08,
  };

  return (
    <View style={styles.container}>
      {/* Full Screen Interactive Map */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
        onPress={() => {
          // Tap on empty map area can unselect marker
        }}
      >
        {filteredReports.map((report) => {
          const lat = Number(report.latitude);
          const lng = Number(report.longitude);
          if (isNaN(lat) || isNaN(lng)) return null;
          const isSelected = selectedMarkerId === report.id;
          return (
            <Marker
              key={report.id}
              coordinate={{ latitude: lat, longitude: lng }}
              onPress={() => handleMarkerPress(report)}
            >
              <View style={[styles.markerContainer, isSelected && styles.markerSelected]}>
                <View
                  style={[
                    styles.markerBadge,
                    { backgroundColor: report.pet_type === 'cat' ? COLORS.brand : COLORS.lilac },
                  ]}
                >
                  <Flaticon
                    name={report.pet_type === 'cat' ? 'cat' : 'dog'}
                    size={16}
                    tintColor="#ffffff"
                  />
                </View>
                <View
                  style={[
                    styles.markerConditionDot,
                    { backgroundColor: getConditionColor(report.condition) },
                  ]}
                />
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Floating Top Search & Filter Bar */}
      <View style={styles.topFloatingArea}>
        <View style={[clayStyles.card, styles.floatingSearch]}>
          <Flaticon name="search" size={16} tintColor={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Cari lokasi atau anabul..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filterRow}>
          {[
            { key: 'all', label: 'Semua', icon: 'search' },
            { key: 'cat', label: 'Kucing', icon: 'cat' },
            { key: 'dog', label: 'Anjing', icon: 'dog' },
          ].map((item) => (
            <TouchableOpacity
              key={item.key}
              style={[
                clayStyles.cardSoft,
                styles.filterChip,
                petTypeFilter === item.key && styles.filterChipActive,
              ]}
              onPress={() => setPetTypeFilter(item.key)}
            >
              <Flaticon
                name={item.icon}
                size={14}
                tintColor={petTypeFilter === item.key ? '#ffffff' : COLORS.textSecondary}
              />
              <Text
                style={[
                  styles.filterChipText,
                  petTypeFilter === item.key && styles.filterChipTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Floating GPS Recenter Button */}
      <TouchableOpacity
        style={[clayStyles.card, styles.floatingGpsBtn]}
        onPress={handleCenterUser}
        activeOpacity={0.85}
      >
        <Flaticon name="pin" size={20} tintColor={COLORS.brandDark} />
      </TouchableOpacity>

      {/* Claymorphic Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, { height: sheetHeight }]}>
        {/* Draggable Handle Header */}
        <View {...panResponder.panHandlers} style={styles.handleContainer}>
          <View style={styles.handleBar} />
          <View style={styles.sheetHeaderRow}>
            {selectedReport ? (
              <>
                <Text style={styles.sheetTitle}>Detail Anabul Terpilih</Text>
                <TouchableOpacity
                  onPress={() => {
                    setSelectedMarkerId(null);
                    snapSheetTo(SNAP_COLLAPSED);
                  }}
                  style={styles.backToListBtn}
                >
                  <Text style={styles.backToListText}>Lihat Semua Anabul ({filteredReports.length})</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={styles.sheetTitle}>
                  Sebaran Anabul ({filteredReports.length})
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    snapSheetTo(
                      currentHeight.current >= SNAP_EXPANDED - 10 ? SNAP_COLLAPSED : SNAP_EXPANDED
                    )
                  }
                >
                  <Text style={styles.sheetExpandText}>
                    {currentHeight.current >= SNAP_EXPANDED - 10 ? 'Kecilkan' : 'Perluas'}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Dynamic Sheet Body: Single Detail vs Full List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.brandDark} />
            <Text style={styles.loadingText}>Memuat data...</Text>
          </View>
        ) : errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => fetchReports()}>
              <Text style={styles.retryBtnText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : selectedReport ? (
          /* Single Pet Detail Card View */
          <View style={styles.selectedDetailWrap}>
            <View style={[clayStyles.cardSoft, styles.selectedDetailCard]}>
              <View style={styles.selectedImageRow}>
                {selectedReport.images && selectedReport.images.length > 0 ? (
                  <Image
                    source={{ uri: selectedReport.images[0].image_url }}
                    style={styles.selectedImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.selectedImage, styles.noImage]}>
                    <Flaticon name="camera" size={24} tintColor={COLORS.textMuted} />
                  </View>
                )}

                <View style={styles.selectedMeta}>
                  <View style={styles.badgeRow}>
                    <View style={[styles.miniBadge, { backgroundColor: selectedReport.pet_type === 'cat' ? COLORS.brandLight : COLORS.lilacLight }]}>
                      <Text style={[styles.miniBadgeText, { color: selectedReport.pet_type === 'cat' ? COLORS.brandDark : '#7c3aed' }]}>
                        {selectedReport.pet_type === 'cat' ? 'Kucing' : 'Anjing'} • {selectedReport.age_group === 'kitten_puppy' ? 'Anak' : 'Dewasa'}
                      </Text>
                    </View>
                    <View style={[styles.conditionDot, { backgroundColor: getConditionColor(selectedReport.condition) }]} />
                  </View>

                  <Text style={styles.selectedTitle} numberOfLines={2}>
                    {selectedReport.title}
                  </Text>

                  <View style={styles.addressRow}>
                    <Flaticon name="pin" size={12} tintColor={COLORS.textSecondary} />
                    <Text style={styles.selectedAddress} numberOfLines={1}>
                      {selectedReport.address_note || 'Lokasi jalanan'}
                    </Text>
                  </View>
                </View>
              </View>

              {selectedReport.description ? (
                <Text style={styles.selectedDesc} numberOfLines={2}>
                  {selectedReport.description}
                </Text>
              ) : null}

              {/* Action Button to Open Full Detail Page */}
              <TouchableOpacity
                style={[clayStyles.btnPrimary, styles.fullDetailBtn]}
                onPress={() => onSelectReport(selectedReport.id)}
                activeOpacity={0.85}
              >
                <Text style={styles.fullDetailBtnText}>Buka Detail & Catat Aksi →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Multi-Pet List View */
          <FlatList
            data={filteredReports}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const primaryImg = item.images && item.images.length > 0 ? item.images[0].image_url : null;
              const distanceKm = item.distance_meters ? (item.distance_meters / 1000).toFixed(1) : null;

              return (
                <TouchableOpacity
                  style={[clayStyles.cardSoft, styles.petCard]}
                  activeOpacity={0.85}
                  onPress={() => handleMarkerPress(item)}
                >
                  <View style={styles.petCardImageWrap}>
                    {primaryImg ? (
                      <Image source={{ uri: primaryImg }} style={styles.petCardImage} resizeMode="cover" />
                    ) : (
                      <View style={[styles.petCardImage, styles.noImage]}>
                        <Flaticon name="camera" size={20} tintColor={COLORS.textMuted} />
                      </View>
                    )}
                    <View
                      style={[
                        styles.conditionBadgeMini,
                        { backgroundColor: getConditionColor(item.condition) },
                      ]}
                    />
                  </View>

                  <View style={styles.petCardInfo}>
                    <View style={styles.petCardHeader}>
                      <Text style={styles.petTypeTag}>
                        {item.pet_type === 'cat' ? 'Kucing' : 'Anjing'} • {item.age_group === 'kitten_puppy' ? 'Anak' : 'Dewasa'}
                      </Text>
                      {distanceKm ? (
                        <Text style={styles.distanceTag}>{distanceKm} km</Text>
                      ) : null}
                    </View>

                    <Text style={styles.petCardTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <View style={styles.addressRow}>
                      <Flaticon name="pin" size={12} tintColor={COLORS.textSecondary} />
                      <Text style={styles.petCardAddress} numberOfLines={1}>
                        {item.address_note || 'Lokasi jalanan'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Flaticon name="search" size={32} tintColor={COLORS.textMuted} />
                <Text style={styles.emptyTitle}>Tidak ada anabul ditemukan</Text>
              </View>
            }
          />
        )}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  map: { width: '100%', height: '100%' },

  markerContainer: { alignItems: 'center', justifyContent: 'center' },
  markerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  markerSelected: { transform: [{ scale: 1.25 }] },
  markerConditionDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    marginTop: -4,
  },

  topFloatingArea: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 12 : 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  floatingSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  filterRow: { flexDirection: 'row', gap: 8 },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  filterChipActive: {
    backgroundColor: COLORS.brandDark,
    borderColor: COLORS.brandDark,
  },
  filterChipText: { fontSize: 12, color: COLORS.textSecondary, fontWeight: '700' },
  filterChipTextActive: { color: '#ffffff' },

  floatingGpsBtn: {
    position: 'absolute',
    right: 16,
    bottom: SNAP_COLLAPSED + 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    shadowColor: '#47acd7',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    zIndex: 20,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 16,
  },
  handleBar: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    marginBottom: 8,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  sheetTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary },
  sheetExpandText: { fontSize: 12, color: COLORS.brandDark, fontWeight: '700' },
  backToListBtn: { paddingVertical: 2, paddingHorizontal: 6 },
  backToListText: { fontSize: 12, color: COLORS.brandDark, fontWeight: '700' },
  listContent: { paddingHorizontal: 16, paddingBottom: 24, gap: 10 },

  // Single Pet Selected View
  selectedDetailWrap: { paddingHorizontal: 16, paddingBottom: 20 },
  selectedDetailCard: { padding: 14, borderRadius: 20 },
  selectedImageRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
  selectedImage: { width: 90, height: 90, borderRadius: 14 },
  selectedMeta: { flex: 1, justifyContent: 'center' },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  miniBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  miniBadgeText: { fontSize: 11, fontWeight: '800' },
  conditionDot: { width: 8, height: 8, borderRadius: 4 },
  selectedTitle: { fontSize: 15, fontWeight: '900', color: COLORS.textPrimary, marginBottom: 4 },
  selectedAddress: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  selectedDesc: { fontSize: 12, color: COLORS.textSecondary, lineHeight: 17, marginBottom: 12 },
  fullDetailBtn: { paddingVertical: 12, borderRadius: 14, marginTop: 4 },
  fullDetailBtnText: { color: '#ffffff', fontSize: 13, fontWeight: '800' },

  // Pet List Card
  petCard: {
    flexDirection: 'row',
    padding: 10,
    borderRadius: 16,
    alignItems: 'center',
  },
  petCardImageWrap: { width: 70, height: 70, borderRadius: 12, overflow: 'hidden', position: 'relative' },
  petCardImage: { width: '100%', height: '100%' },
  noImage: { backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  conditionBadgeMini: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  petCardInfo: { flex: 1, marginLeft: 12 },
  petCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  petTypeTag: { fontSize: 11, color: COLORS.textSecondary, fontWeight: '600' },
  distanceTag: { fontSize: 11, color: COLORS.brandDark, fontWeight: '700' },
  petCardTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 4 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  petCardAddress: { fontSize: 12, color: COLORS.textSecondary, flex: 1 },
  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 20 },
  loadingText: { marginTop: 6, color: COLORS.textSecondary, fontSize: 12 },
  errorContainer: { padding: 16, alignItems: 'center' },
  errorText: { color: COLORS.danger, fontSize: 12, textAlign: 'center', marginBottom: 8 },
  retryBtn: { backgroundColor: COLORS.brandLight, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 10 },
  retryBtnText: { color: COLORS.brandDark, fontSize: 12, fontWeight: '700' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 24 },
  emptyTitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 6 },
});
