import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Conversation, Message } from '../types';
import { Flaticon } from '../components/Flaticon';
import { COLORS, clayStyles } from '../theme/clay';

interface ChatScreenProps {
  initialRecipientId?: number;
  initialReportId?: number;
  onBack?: () => void;
  onRequireAuth: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  initialRecipientId,
  initialReportId,
  onBack,
  onRequireAuth,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeUser, setActiveUser] = useState<{ id: number; name: string } | null>(null);
  const [activeReportId, setActiveReportId] = useState<number | undefined>(initialReportId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    if (initialRecipientId) {
      setActiveUser({ id: initialRecipientId, name: 'Pengguna' });
      fetchThread(initialRecipientId);
    } else {
      fetchConversations();
    }
  }, [user, initialRecipientId]);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/messages/conversations');
      if (res.data?.data) {
        setConversations(res.data.data);
      }
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  const fetchThread = async (userId: number) => {
    setLoading(true);
    try {
      const res = await api.get(`/messages/thread/${userId}`);
      if (res.data?.data) {
        setMessages(res.data.data);
      }
    } catch {
      Alert.alert('Error', 'Gagal memuat pesan.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim() || !activeUser) return;

    setSending(true);
    try {
      const res = await api.post('/messages', {
        recipient_id: activeUser.id,
        report_id: activeReportId,
        content: inputText.trim(),
      });
      if (res.data?.data) {
        setMessages((prev) => [...prev, res.data.data]);
        setInputText('');
      }
    } catch (err: any) {
      Alert.alert('Gagal', err.response?.data?.message || 'Gagal mengirim pesan.');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <View style={styles.authContainer}>
        <View style={styles.authCard}>
          <Flaticon name="chat" size={48} tintColor={COLORS.brandDark} />
          <Text style={styles.authTitle}>Masuk untuk Membuka Pesan</Text>
          <Text style={styles.authSubtitle}>Fitur pesan adopsi langsung hanya tersedia untuk akun terdaftar.</Text>
          <TouchableOpacity style={[clayStyles.btnPrimary, styles.authBtn]} onPress={onRequireAuth}>
            <Text style={styles.authBtnText}>Masuk / Daftar Akun</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Active Chat Thread View
  if (activeUser) {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.threadHeader}>
          <TouchableOpacity
            onPress={() => {
              if (onBack && initialRecipientId) {
                onBack();
              } else {
                setActiveUser(null);
                fetchConversations();
              }
            }}
            style={styles.backBtn}
          >
            <Flaticon name="back" size={16} tintColor={COLORS.brandDark} />
            <Text style={styles.backBtnText}>Kembali</Text>
          </TouchableOpacity>
          <Text style={styles.threadTitle}>{activeUser.name}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={COLORS.brandDark} />
          </View>
        ) : (
          <FlatList
            data={messages}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.messageList}
            renderItem={({ item }) => {
              const isMe = item.sender_id === user.id;
              return (
                <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                  <Text style={[styles.bubbleText, isMe ? styles.bubbleTextMe : styles.bubbleTextThem]}>
                    {item.content}
                  </Text>
                  <Text style={[styles.bubbleTime, isMe ? styles.bubbleTimeMe : styles.bubbleTimeThem]}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyThread}>
                <Flaticon name="chat" size={32} tintColor={COLORS.textMuted} />
                <Text style={styles.emptyThreadText}>Mulai percakapan adopsi di sini.</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={[clayStyles.input, styles.textInput]}
            placeholder="Tulis pesan..."
            placeholderTextColor={COLORS.textMuted}
            value={inputText}
            onChangeText={setInputText}
          />
          <TouchableOpacity
            style={[clayStyles.btnPrimary, styles.sendBtn, (!inputText.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSendMessage}
            disabled={!inputText.trim() || sending}
          >
            <Text style={styles.sendBtnText}>Kirim</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  // Conversation List View
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Pesan Adopsi</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.brandDark} />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.convList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[clayStyles.cardSoft, styles.convCard]}
              onPress={() => {
                setActiveUser({ id: item.with_user.id, name: item.with_user.name });
                setActiveReportId(item.report?.id);
                fetchThread(item.with_user.id);
              }}
            >
              <View style={styles.convAvatar}>
                <Text style={styles.convAvatarText}>{item.with_user.name.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.convContent}>
                <View style={styles.convHeader}>
                  <Text style={styles.convName}>{item.with_user.name}</Text>
                  <Text style={styles.convDate}>
                    {new Date(item.last_message.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={styles.convLastMsg} numberOfLines={1}>
                  {item.last_message.content}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Flaticon name="chat" size={40} tintColor={COLORS.textMuted} />
              <Text style={styles.emptyTitle}>Belum Ada Percakapan</Text>
              <Text style={styles.emptySubtitle}>Hubungi pelapor hewan melalui tombol Chat pada halaman detail.</Text>
            </View>
          }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 16, backgroundColor: COLORS.surface, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  screenTitle: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary },
  convList: { padding: 14, gap: 10 },
  convCard: {
    flexDirection: 'row',
    padding: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  convAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  convAvatarText: { color: COLORS.brandDark, fontSize: 16, fontWeight: '800' },
  convContent: { flex: 1 },
  convHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  convName: { fontSize: 14, fontWeight: '800', color: COLORS.textPrimary },
  convDate: { fontSize: 11, color: COLORS.textMuted },
  convLastMsg: { fontSize: 13, color: COLORS.textSecondary },
  threadHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 12 },
  backBtnText: { color: COLORS.brandDark, fontSize: 14, fontWeight: '700' },
  threadTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textPrimary },
  messageList: { padding: 14 },
  bubble: { maxWidth: '78%', padding: 12, borderRadius: 16, marginBottom: 8 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: COLORS.brandDark, borderBottomRightRadius: 4 },
  bubbleThem: { alignSelf: 'flex-start', backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderBottomLeftRadius: 4 },
  bubbleText: { fontSize: 14, lineHeight: 19 },
  bubbleTextMe: { color: '#ffffff', fontWeight: '500' },
  bubbleTextThem: { color: COLORS.textPrimary },
  bubbleTime: { fontSize: 10, marginTop: 4, textAlign: 'right' },
  bubbleTimeMe: { color: COLORS.brandLight },
  bubbleTimeThem: { color: COLORS.textMuted },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendBtn: { paddingHorizontal: 18, paddingVertical: 11, borderRadius: 20 },
  sendBtnDisabled: { opacity: 0.5 },
  sendBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 13 },
  authContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  authCard: { alignItems: 'center', width: '100%' },
  authTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, marginTop: 12, marginBottom: 6 },
  authSubtitle: { fontSize: 13, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 20 },
  authBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 },
  authBtnText: { color: '#ffffff', fontWeight: '800' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyContainer: { alignItems: 'center', marginTop: 48 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary, marginTop: 10, marginBottom: 4 },
  emptySubtitle: { fontSize: 12, color: COLORS.textMuted, textAlign: 'center', paddingHorizontal: 20 },
  emptyThread: { alignItems: 'center', marginTop: 40 },
  emptyThreadText: { fontSize: 13, color: COLORS.textMuted, marginTop: 8 },
});
