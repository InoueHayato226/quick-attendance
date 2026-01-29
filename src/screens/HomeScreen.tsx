import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { WebView } from 'react-native-webview';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StorageService } from '../services/StorageService';
import { SlackService } from '../services/SlackService';
import { KingOfTimeService } from '../services/KingOfTimeService';
import { AppConfig, AttendanceType } from '../types';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [currentAttendanceType, setCurrentAttendanceType] = useState<AttendanceType>('clockIn');
  const webViewRef = useRef<WebView>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  // 画面がフォーカスされたときに設定を再読み込み
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadConfig();
    });

    return unsubscribe;
  }, [navigation]);

  const loadConfig = async () => {
    const savedConfig = await StorageService.loadConfig();
    setConfig(savedConfig);
  };

  const handleAttendance = async (type: AttendanceType) => {
    if (!config) {
      Alert.alert(
        '設定が必要です',
        '先に設定画面でキングオブタイムとSlackの情報を入力してください。',
        [
          {
            text: '設定画面へ',
            onPress: () => navigation.navigate('Settings'),
          },
          { text: 'キャンセル' },
        ]
      );
      return;
    }

    setCurrentAttendanceType(type);
    setLoading(true);

    try {
      // WebViewを表示してキングオブタイムの打刻を実行
      setWebViewVisible(true);
    } catch (error) {
      setLoading(false);
      Alert.alert('エラー', '処理に失敗しました');
    }
  };

  const handleWebViewMessage = async (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('WebView message:', data);

      if (data.type === 'attendance' && data.status === 'success') {
        // 打刻成功後、Slackにメッセージを送信
        if (config?.slack.botToken && config?.slack.channelId) {
          const message = currentAttendanceType === 'clockIn'
            ? config.slack.clockInMessage
            : config.slack.clockOutMessage;
          await SlackService.sendMessage(
            config.slack.botToken,
            config.slack.channelId,
            currentAttendanceType,
            message
          );
        }

        setWebViewVisible(false);
        setLoading(false);

        Alert.alert(
          '成功',
          `${currentAttendanceType === 'clockIn' ? '出勤' : '退勤'}の記録が完了しました`,
          [{ text: 'OK' }]
        );
      } else if (data.status === 'error') {
        setWebViewVisible(false);
        setLoading(false);
        Alert.alert('エラー', data.message);
      }
    } catch (error) {
      console.error('WebView message parse error:', error);
    }
  };

  const handleWebViewLoadEnd = () => {
    // ページ読み込み完了後、ログイン処理を実行
    if (webViewRef.current && config) {
      setTimeout(() => {
        webViewRef.current?.injectJavaScript(
          KingOfTimeService.getLoginScript(
            config.kingOfTime.loginId,
            config.kingOfTime.password
          )
        );

        // ログイン後、打刻処理を実行（少し待つ）
        setTimeout(() => {
          webViewRef.current?.injectJavaScript(
            KingOfTimeService.getAttendanceScript(currentAttendanceType)
          );
        }, 2000);
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Quick Attendance</Text>
        <TouchableOpacity
          style={styles.settingsButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.settingsButtonText}>⚙️ 設定</Text>
        </TouchableOpacity>
      </View>

      {!config && (
        <View style={styles.noticeContainer}>
          <Text style={styles.noticeText}>
            まずは設定画面で初期設定を行ってください
          </Text>
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.clockInButton]}
          onPress={() => handleAttendance('clockIn')}
          disabled={loading}
        >
          {loading && currentAttendanceType === 'clockIn' ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>🌅</Text>
              <Text style={styles.buttonText}>出勤</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.clockOutButton]}
          onPress={() => handleAttendance('clockOut')}
          disabled={loading}
        >
          {loading && currentAttendanceType === 'clockOut' ? (
            <ActivityIndicator color="#fff" size="large" />
          ) : (
            <>
              <Text style={styles.buttonIcon}>🌙</Text>
              <Text style={styles.buttonText}>退勤</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {config && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>
            設定済み: {config.kingOfTime.loginId}
          </Text>
        </View>
      )}

      {/* WebView Modal */}
      <Modal
        visible={webViewVisible}
        animationType="slide"
        onRequestClose={() => {
          setWebViewVisible(false);
          setLoading(false);
        }}
      >
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>キングオブタイム</Text>
            <TouchableOpacity
              onPress={() => {
                setWebViewVisible(false);
                setLoading(false);
              }}
            >
              <Text style={styles.closeButton}>閉じる</Text>
            </TouchableOpacity>
          </View>
          {config && (
            <WebView
              ref={webViewRef}
              source={{
                uri: KingOfTimeService.getLoginUrl(config.kingOfTime.companyId),
              }}
              onMessage={handleWebViewMessage}
              onLoadEnd={handleWebViewLoadEnd}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              incognito={true}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  settingsButton: {
    padding: 8,
  },
  settingsButtonText: {
    fontSize: 16,
  },
  noticeContainer: {
    margin: 20,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  noticeText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    gap: 30,
  },
  button: {
    width: '100%',
    height: 120,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  clockInButton: {
    backgroundColor: '#4CAF50',
  },
  clockOutButton: {
    backgroundColor: '#2196F3',
  },
  buttonIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusContainer: {
    padding: 20,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 12,
    color: '#666',
  },
  webViewContainer: {
    flex: 1,
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  webViewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    fontSize: 16,
    color: '#2196F3',
  },
});
