# Quick Attendance

キングオブタイムとSlackへの出退勤を一括で行えるモバイルアプリです。

## 機能

- ✨ ボタン一つでキングオブタイムとSlackの両方に出退勤を記録
- 🔐 認証情報をデバイス内に安全に保存
- 📱 iOS・Android対応（React Native / Expo）
- ⚙️ 簡単な設定画面

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. アプリの起動

#### iOS シミュレーター（Macのみ）

```bash
npm run ios
```

#### Android エミュレーター

```bash
npm run android
```

#### Expo Go（実機）

```bash
npm start
```

スマートフォンにExpo Goアプリをインストールし、表示されるQRコードをスキャンしてください。

## 使い方

### 初回設定

1. アプリを起動したら「⚙️ 設定」ボタンをタップ
2. 以下の情報を入力：

#### キングオブタイム

- **会社ID**: pe9lrc
- **ログインID**: あなたのキングオブタイムのログインID
- **パスワード**: あなたのキングオブタイムのパスワード

#### Slack

- **ユーザートークン**: Slackユーザートークン（`xoxp-`で始まる）
- **チャンネル名**: メッセージを送信するチャンネル（例: `general`）

### Slackユーザートークンの取得方法

1. https://api.slack.com/apps にアクセス
2. 「Create New App」をクリック
3. 「From scratch」を選択
4. アプリ名（例: Quick Attendance）とワークスペース（株式会社ルートチーム）を選択して「Create App」
5. 左メニューから「OAuth & Permissions」を開く
6. 「Scopes」セクションの「User Token Scopes」に以下を追加：
   - `chat:write`
7. ページ上部の「Install to Workspace」をクリック
8. 権限を確認して「許可する」をクリック
9. **User OAuth Token**（`xoxp-`で始まる）をコピー

これで、あなたの個人アカウントとしてメッセージが送信されます。

### 出退勤の記録

1. ホーム画面で「出勤」または「退勤」ボタンをタップ
2. 自動的にキングオブタイムへのログインと打刻が実行されます
3. 同時にSlackへメッセージが送信されます
4. 完了すると確認メッセージが表示されます

## 注意事項

### セキュリティ

- 認証情報はデバイス内に保存されます
- 本番環境では、より高度な暗号化の実装を推奨します

### キングオブタイムの自動化について

- このアプリはWebViewを使用してキングオブタイムのWebサイトを自動操作します
- キングオブタイムの利用規約で自動化が許可されているか確認してください
- WebサイトのUI変更により動作しなくなる可能性があります

### カスタマイズが必要な場合

キングオブタイムのHTMLセレクタは環境によって異なる可能性があります。
動作しない場合は、`src/services/KingOfTimeService.ts` を確認し、
実際のHTMLに合わせてセレクタを調整してください。

## トラブルシューティング

### 打刻ボタンが見つからない

キングオブタイムのWebサイトでHTMLを確認し、
`src/services/KingOfTimeService.ts` のセレクタを調整してください。

### Slackメッセージが送信されない

- ユーザートークン（`xoxp-`）が正しいか確認
- チャンネル名が正しいか確認（`#`なしで入力）
- アプリのUser Token Scopesに`chat:write`が追加されているか確認
- チャンネルに参加しているか確認

## 技術スタック

- React Native
- Expo
- TypeScript
- React Navigation
- react-native-webview
- AsyncStorage
- Axios

## 開発

### ディレクトリ構造

```
quick-attendance/
├── src/
│   ├── screens/          # 画面コンポーネント
│   │   ├── HomeScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/         # ビジネスロジック
│   │   ├── KingOfTimeService.ts
│   │   ├── SlackService.ts
│   │   └── StorageService.ts
│   └── types/            # 型定義
│       └── index.ts
├── App.tsx               # アプリエントリーポイント
└── package.json
```

## ライセンス

MIT
