import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig } from '../types';

const CONFIG_KEY = '@quick_attendance_config';

export class StorageService {
  static async saveConfig(config: AppConfig): Promise<void> {
    try {
      await AsyncStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('設定の保存に失敗しました:', error);
      throw error;
    }
  }

  static async loadConfig(): Promise<AppConfig | null> {
    try {
      const configString = await AsyncStorage.getItem(CONFIG_KEY);
      if (configString) {
        return JSON.parse(configString);
      }
      return null;
    } catch (error) {
      console.error('設定の読み込みに失敗しました:', error);
      return null;
    }
  }

  static async clearConfig(): Promise<void> {
    try {
      await AsyncStorage.removeItem(CONFIG_KEY);
    } catch (error) {
      console.error('設定のクリアに失敗しました:', error);
      throw error;
    }
  }
}
