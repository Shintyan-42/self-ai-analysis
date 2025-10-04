# AI Career App

地方の中高生向けキャリア発見アプリです。15問の質問に答えることで、AIが最適なキャリアロールモデルと進路を提案します。

## 機能

- 🎯 **キャリア発見クイズ**: 15問の包括的な質問
- 🤖 **AI分析**: Gemini AIによる個人化された分析
- 🎓 **具体的な大学推薦**: 実在する大学名と詳細な入試情報
- 📊 **キャリアロードマップ**: 短期・中期・長期の目標設定
- 📱 **レスポンシブデザイン**: モバイル対応の美しいUI

## 技術スタック

- **フレームワーク**: Next.js 15.5.4
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS 4
- **AI**: Google Gemini API
- **データベース**: SQLite (better-sqlite3)
- **開発サーバー**: Turbopack

## セットアップ

1. **リポジトリのクローン**
```bash
git clone https://github.com/Shintyan-42/self-ai-analysis.git
cd self-ai-analysis
```

2. **依存関係のインストール**
```bash
npm install
```

3. **環境変数の設定**
`.env.local`ファイルを作成し、Gemini APIキーを設定：
```bash
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **開発サーバーの起動**
```bash
npm run dev
```

5. **ブラウザでアクセス**
http://localhost:3000 を開いてアプリケーションを使用

## 使用方法

1. アプリを起動するとキャリア発見クイズが表示されます
2. 15問の質問に答えてください
3. AI分析結果で個人に最適なキャリアガイダンスを確認
4. 具体的な大学推薦と進路計画を参考にしてください

## Gemini API セットアップ

詳細なセットアップ手順は [GEMINI_SETUP.md](./GEMINI_SETUP.md) を参照してください。

## ライセンス

MIT License

## 貢献

プルリクエストやイシューの報告を歓迎します。