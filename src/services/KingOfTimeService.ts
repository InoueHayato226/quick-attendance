import { AttendanceType } from '../types';

export class KingOfTimeService {
  // キングオブタイムのURL
  static readonly BASE_URL = 'https://s2.kingtime.jp/independent/recorder2/personal/';

  // ログインページのURL
  static getLoginUrl(companyId: string): string {
    return `https://s2.kingtime.jp/independent/recorder2/personal/?company_id=${companyId}`;
  }

  // ログイン処理を行うJavaScriptコード
  static getLoginScript(loginId: string, password: string): string {
    return `
      (function() {
        try {
          // ログインフォームの入力
          const loginIdInput = document.getElementById('id');
          const passwordInput = document.getElementById('password');
          const loginButton = document.querySelector('.btn-control-message');

          if (loginIdInput && passwordInput && loginButton) {
            loginIdInput.value = '${loginId}';
            passwordInput.value = '${password}';
            loginButton.click();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'login',
              status: 'success',
              message: 'ログイン処理を実行しました'
            }));
          } else {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'login',
              status: 'error',
              message: 'ログインフォームが見つかりませんでした'
            }));
          }
        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'login',
            status: 'error',
            message: 'ログイン処理でエラーが発生しました: ' + error.message
          }));
        }
      })();
    `;
  }

  // 打刻処理を行うJavaScriptコード
  static getAttendanceScript(type: AttendanceType): string {
    // キングオブタイムのボタンは出勤・退勤で異なる可能性があるため、
    // 実際のHTMLを確認して調整が必要です
    const buttonSelector = type === 'clockIn'
      ? '.record-clock-in' // 出勤ボタンのセレクタ（要調整）
      : '.record-clock-out'; // 退勤ボタンのセレクタ（要調整）

    return `
      (function() {
        try {
          // 打刻ボタンを探して押す
          const button = document.querySelector('${buttonSelector}');

          if (button) {
            button.click();
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'attendance',
              status: 'success',
              message: '打刻処理を実行しました',
              attendanceType: '${type}'
            }));
          } else {
            // ボタンが見つからない場合、別のセレクタを試す
            const allButtons = document.querySelectorAll('button, input[type="button"], input[type="submit"]');
            let found = false;

            for (let btn of allButtons) {
              const text = btn.textContent || btn.value || '';
              if (text.includes('${type === 'clockIn' ? '出勤' : '退勤'}')) {
                btn.click();
                found = true;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                  type: 'attendance',
                  status: 'success',
                  message: '打刻処理を実行しました（フォールバック）',
                  attendanceType: '${type}'
                }));
                break;
              }
            }

            if (!found) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'attendance',
                status: 'error',
                message: '打刻ボタンが見つかりませんでした'
              }));
            }
          }
        } catch (error) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'attendance',
            status: 'error',
            message: '打刻処理でエラーが発生しました: ' + error.message
          }));
        }
      })();
    `;
  }

  // ページのHTMLを取得するスクリプト
  static getPageInfoScript(): string {
    return `
      (function() {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'pageInfo',
          url: window.location.href,
          title: document.title,
          html: document.documentElement.outerHTML.substring(0, 1000) // 最初の1000文字のみ
        }));
      })();
    `;
  }
}
