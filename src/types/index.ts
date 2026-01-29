export interface AppConfig {
  kingOfTime: {
    loginId: string;
    password: string;
    companyId: string;
  };
  slack: {
    botToken: string;
    channelId: string;
    clockInMessage: string;
    clockOutMessage: string;
  };
}

export type AttendanceType = 'clockIn' | 'clockOut';

export interface AttendanceResult {
  success: boolean;
  message: string;
  timestamp: Date;
}
