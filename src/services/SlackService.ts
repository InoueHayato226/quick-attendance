import axios from 'axios';
import { AttendanceType } from '../types';

export class SlackService {
  static readonly DEFAULT_CLOCK_IN_MESSAGE = '出勤しました';
  static readonly DEFAULT_CLOCK_OUT_MESSAGE = '退勤しました';

  static async sendMessage(
    botToken: string,
    channelId: string,
    type: AttendanceType,
    customMessage?: string
  ): Promise<void> {
    const message = customMessage ||
      (type === 'clockIn'
        ? SlackService.DEFAULT_CLOCK_IN_MESSAGE
        : SlackService.DEFAULT_CLOCK_OUT_MESSAGE);

    try {
      const response = await axios.post(
        'https://slack.com/api/chat.postMessage',
        {
          channel: channelId,
          text: message,
        },
        {
          headers: {
            'Authorization': `Bearer ${botToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.data.ok) {
        throw new Error(response.data.error || 'Slackへのメッセージ送信に失敗しました');
      }
    } catch (error: any) {
      console.error('Slackへのメッセージ送信に失敗しました:', error);
      throw new Error(
        error.response?.data?.error ||
        'Slackへのメッセージ送信に失敗しました'
      );
    }
  }
}
