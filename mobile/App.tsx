import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { HomeScreen } from './src/screens/HomeScreen';
import { ExploreScreen } from './src/screens/ExploreScreen';
import { ReportScreen } from './src/screens/ReportScreen';
import { ReportDetailScreen } from './src/screens/ReportDetailScreen';
import { ChatScreen } from './src/screens/ChatScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { Flaticon } from './src/components/Flaticon';
import { COLORS } from './src/theme/clay';

type Tab = 'home' | 'explore' | 'report' | 'chat' | 'profile';

function MainApp() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);
  const [chatTarget, setChatTarget] = useState<{ recipientId: number; reportId?: number } | null>(null);

  const handleSelectReport = (reportId: number) => {
    setSelectedReportId(reportId);
  };

  const handleBackFromDetail = () => {
    setSelectedReportId(null);
  };

  const handleOpenChatFromReport = (recipientId: number, reportId: number) => {
    setSelectedReportId(null);
    setChatTarget({ recipientId, reportId });
    setActiveTab('chat');
  };

  const handleReportCreated = (newReportId: number) => {
    setSelectedReportId(newReportId);
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Screen Render */}
      <View style={styles.mainContainer}>
        {selectedReportId !== null ? (
          <ReportDetailScreen
            reportId={selectedReportId}
            onBack={handleBackFromDetail}
            onOpenChat={handleOpenChatFromReport}
            onRequireAuth={() => setActiveTab('profile')}
          />
        ) : activeTab === 'home' ? (
          <HomeScreen
            onNavigateExplore={() => setActiveTab('explore')}
            onNavigateReport={() => setActiveTab('report')}
            onNavigateChat={() => setActiveTab('chat')}
          />
        ) : activeTab === 'explore' ? (
          <ExploreScreen onSelectReport={handleSelectReport} />
        ) : activeTab === 'report' ? (
          <ReportScreen
            onSuccess={handleReportCreated}
            onRequireAuth={() => setActiveTab('profile')}
          />
        ) : activeTab === 'chat' ? (
          <ChatScreen
            initialRecipientId={chatTarget?.recipientId}
            initialReportId={chatTarget?.reportId}
            onBack={() => setChatTarget(null)}
            onRequireAuth={() => setActiveTab('profile')}
          />
        ) : (
          <ProfileScreen />
        )}
      </View>

      {/* Claymorphic Bottom Navigation Bar */}
      {selectedReportId === null && (
        <View style={[styles.bottomNavContainer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
          <View style={styles.bottomNav}>
            <TouchableOpacity
              style={[styles.navItem, activeTab === 'home' && styles.navItemActive]}
              onPress={() => {
                setChatTarget(null);
                setActiveTab('home');
              }}
            >
              <Flaticon
                name="home"
                size={20}
                tintColor={activeTab === 'home' ? COLORS.brandDark : COLORS.textMuted}
              />
              <Text style={[styles.navLabel, activeTab === 'home' && styles.navLabelActive]}>
                Beranda
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navItem, activeTab === 'explore' && styles.navItemActive]}
              onPress={() => {
                setChatTarget(null);
                setActiveTab('explore');
              }}
            >
              <Flaticon
                name="search"
                size={20}
                tintColor={activeTab === 'explore' ? COLORS.brandDark : COLORS.textMuted}
              />
              <Text style={[styles.navLabel, activeTab === 'explore' && styles.navLabelActive]}>
                Jelajah
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navItem, activeTab === 'report' && styles.navItemActive]}
              onPress={() => {
                setChatTarget(null);
                setActiveTab('report');
              }}
            >
              <Flaticon
                name="plus"
                size={20}
                tintColor={activeTab === 'report' ? COLORS.brandDark : COLORS.textMuted}
              />
              <Text style={[styles.navLabel, activeTab === 'report' && styles.navLabelActive]}>
                Lapor
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navItem, activeTab === 'chat' && styles.navItemActive]}
              onPress={() => {
                setActiveTab('chat');
              }}
            >
              <Flaticon
                name="chat"
                size={20}
                tintColor={activeTab === 'chat' ? COLORS.brandDark : COLORS.textMuted}
              />
              <Text style={[styles.navLabel, activeTab === 'chat' && styles.navLabelActive]}>
                Pesan
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.navItem, activeTab === 'profile' && styles.navItemActive]}
              onPress={() => {
                setChatTarget(null);
                setActiveTab('profile');
              }}
            >
              <Flaticon
                name="user"
                size={20}
                tintColor={activeTab === 'profile' ? COLORS.brandDark : COLORS.textMuted}
              />
              <Text style={[styles.navLabel, activeTab === 'profile' && styles.navLabelActive]}>
                Profil
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  bottomNavContainer: {
    paddingHorizontal: 16,
    backgroundColor: '#f8fafc',
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 24,
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#e0f2fe',
    shadowColor: '#47acd7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 16,
  },
  navItemActive: {
    backgroundColor: '#f0f9ff',
  },
  navLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
    marginTop: 3,
  },
  navLabelActive: {
    color: '#0284c7',
    fontWeight: '700',
  },
});




