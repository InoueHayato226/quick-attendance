import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { StorageService } from '../services/StorageService';
import { AppConfig } from '../types';

type RootStackParamList = {
  Home: undefined;
  Settings: undefined;
};

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export default function SettingsScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const [config, setConfig] = useState<AppConfig>({
    kingOfTime: {
      loginId: '',
      password: '',
      companyId: '',
    },
    slack: {
      botToken: '',
      channelId: '',
      clockInMessage: '出勤しました',
      clockOutMessage: '退勤しました',
    },
  });

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    setLoading(true);
    const savedConfig = await StorageService.loadConfig();
    if (savedConfig) {
      setConfig(savedConfig);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    // バリデーション
    if (!config.kingOfTime.loginId || !config.kingOfTime.password || !config.kingOfTime.companyId) {
      Alert.alert('入力エラー', 'キングオブタイムの情報をすべて入力してください');
      return;
    }

    if (!config.slack.botToken) {
      Alert.alert('入力エラー', 'Slackユーザートークンを入力してください');
      return;
    }

    if (!config.slack.channelId) {
      Alert.alert('入力エラー', 'Slackチャンネル名を入力してください');
      return;
    }

    // ユーザートークンの簡易バリデーション
    if (!config.slack.botToken.startsWith('xoxp-')) {
      Alert.alert(
        '入力エラー',
        'Slackユーザートークンが正しい形式ではありません。\nxoxp-... の形式で入力してください'
      );
      return;
    }

    setLoading(true);
    try {
      await StorageService.saveConfig(config);
      Alert.alert('保存完了', '設定を保存しました', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      Alert.alert('エラー', '設定の保存に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    Alert.alert(
      '設定のクリア',
      '保存されている設定をすべて削除してもよろしいですか？',
      [
        {
          text: 'キャンセル',
          style: 'cancel',
        },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clearConfig();
            setConfig({
              kingOfTime: {
                loginId: '',
                password: '',
                companyId: '',
              },
              slack: {
                botToken: '',
                channelId: '',
                clockInMessage: '出勤しました',
                clockOutMessage: '退勤しました',
              },
            });
            Alert.alert('完了', '設定をクリアしました');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.title}>設定</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>キングオブタイム</Text>

        <Text style={styles.label}>会社ID</Text>
        <TextInput
          style={styles.input}
          value={config.kingOfTime.companyId}
          onChangeText={(text) =>
            setConfig({
              ...config,
              kingOfTime: { ...config.kingOfTime, companyId: text },
            })
          }
          placeholder="会社IDを入力"
          autoCapitalize="none"
        />

        <Text style={styles.label}>ログインID</Text>
        <TextInput
          style={styles.input}
          value={config.kingOfTime.loginId}
          onChangeText={(text) =>
            setConfig({
              ...config,
              kingOfTime: { ...config.kingOfTime, loginId: text },
            })
          }
          placeholder="ログインIDを入力"
          autoCapitalize="none"
        />

        <Text style={styles.label}>パスワード</Text>
        <TextInput
          style={styles.input}
          value={config.kingOfTime.password}
          onChangeText={(text) =>
            setConfig({
              ...config,
              kingOfTime: { ...config.kingOfTime, password: text },
            })
          }
          placeholder="パスワードを入力"
          secureTextEntry
          autoCapitalize="none"
        />

        <View style={styles.helpBox}>
          <Text style={styles.helpText}>
            ⚠️ 認証情報はデバイス内に暗号化されて保存されます
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Slack</Text>

        <Text style={styles.label}>ユーザートークン</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={config.slack.botToken}
          onChangeText={(text) =>
            setConfig({
              ...config,
              slack: { ...config.slack, botToken: text },
            })
          }
          placeholder="xoxp-..."
          autoCapitalize="none"
          multiline
        />

        <Text style={styles.label}>チャンネル名</Text>
        <TextInput
          style={styles.input}
          value={config.slack.channelId}
          onChangeText={(text) =>
            setConfig({
              ...config,
              slack: { ...config.slack, channelId: text },
            })
          }
          placeholder="general"
          autoCapitalize="none"
        />

        <Text style={styles.label}>出勤メッセージ</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={config.slack.clockInMessage}
          onChangeText={(text) =>
            setConfig({
              ...config,
              slack: { ...config.slack, clockInMessage: text },
            })
          }
          placeholder="出勤しました"
          multiline
        />

        <Text style={styles.label}>退勤メッセージ</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={config.slack.clockOutMessage}
          onChangeText={(text) =>
            setConfig({
              ...config,
              slack: { ...config.slack, clockOutMessage: text },
            })
          }
          placeholder="退勤しました"
          multiline
        />

        <View style={styles.helpBox}>
          <Text style={styles.helpText}>
            💡 ユーザートークンの取得方法：{'\n'}
            1. https://api.slack.com/apps にアクセス{'\n'}
            2. 「Create New App」→「From scratch」{'\n'}
            3. アプリ名とワークスペースを選択{'\n'}
            4. 「OAuth & Permissions」を開く{'\n'}
            5. 「User Token Scopes」に「chat:write」を追加{'\n'}
            6. 「Install to Workspace」をクリック{'\n'}
            7. User OAuth Token（xoxp-...）をコピー{'\n\n'}
            ⚠️ チャンネル名は「#」なしで入力（例: general）
          </Text>
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>保存</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.clearButton}
          onPress={handleClear}
          disabled={loading}
        >
          <Text style={styles.clearButtonText}>設定をクリア</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  helpBox: {
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginTop: 15,
  },
  helpText: {
    fontSize: 12,
    color: '#1976d2',
    lineHeight: 18,
  },
  buttonContainer: {
    padding: 20,
    gap: 10,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  clearButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#f44336',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
