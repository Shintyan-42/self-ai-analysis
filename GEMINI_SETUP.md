# Gemini API セットアップガイド

## 🚀 導入完了！

Gemini APIが正常に統合されました。以下の手順で実際のAI機能を使用できます。

## 📋 セットアップ手順

### 1. Gemini APIキーの取得

1. [Google AI Studio](https://ai.google.dev/) にアクセス
2. Googleアカウントでログイン
3. 「Get API Key」をクリック
4. 新しいAPIキーを生成
5. 生成されたAPIキーをコピー

### 2. 環境変数の設定

`.env.local` ファイルを開き、以下のように設定：

```bash
GEMINI_API_KEY=your_actual_api_key_here
```

**重要**: `your_actual_api_key_here` を実際のAPIキーに置き換えてください。

### 3. 開発サーバーの再起動

```bashA tree hydrated but some attributes of the server rendered HTML didn't match the client properties. This won't be patched up. This can happen if a SSR-ed Client Component used:

- A server/client branch `if (typeof window !== 'undefined')`.
- Variable input such as `Date.now()` or `Math.random()` which changes each time it's called.
- Date formatting in a user's locale which doesn't match the server.
- External changing data without sending a snapshot of it along with the HTML.
- Invalid HTML tag nesting.

It can also happen if the client has a browser extension installed which messes with the HTML before React loaded.

See more info here: https://nextjs.org/docs/messages/react-hydration-error


  ...
    <HotReload assetPrefix="" globalError={[...]}>
      <AppDevOverlayErrorBoundary globalError={[...]}>
        <ReplaySsrOnlyErrors>
        <DevRootHTTPAccessFallbackBoundary>
          <HTTPAccessFallbackBoundary notFound={<NotAllowedRootHTTPFallbackError>}>
            <HTTPAccessFallbackErrorBoundary pathname="/" notFound={<NotAllowedRootHTTPFallbackError>} ...>
              <RedirectBoundary>
                <RedirectErrorBoundary router={{...}}>
                  <Head>
                  <__next_root_layout_boundary__>
                    <SegmentViewNode type="layout" pagePath="layout.tsx">
                      <SegmentTrieNode>
                      <link>
                      <script>
                      <RootLayout>
                        <html
                          lang="en"
-                         data-bybit-channel-name="pYvWuMehjAKUqDdsL30cU"
                        >
                  ...
src\app\layout.tsx (33:5) @ RootLayout


  31 | }>) {
  32 |   return (
> 33 |     <html lang="en">
     |     ^
  34 |       <body
  35 |         className={`${geistSans.variable} ${geistMono.variable} antialiased`}
  36 |       >
npm run dev
```

## 🎯 機能の違い

### デモモード（APIキー未設定時）
- 固定の質問と回答
- 全ユーザー同じ結果
- 無料で動作

### AIモード（APIキー設定後）
- 動的な質問生成
- 個人に合わせた分析
- 高精度な推薦
- 月$10-50程度のコスト

## 🔧 実装された機能

### 1. 動的質問生成
```typescript
// ユーザーの回答に基づいて次の質問を生成
const nextQuestion = await generateQuestion(answers, step);
```

### 2. 個人化分析
```typescript
// ユーザーの回答を分析してキャリアアドバイスを生成
const analysis = await analyzeProfile(answers);
```

### 3. AI大学推薦
```typescript
// プロファイルに基づいて最適な大学を推薦
const recommendations = await recommendUniversities(profile, interests);
```

## 📊 料金体系

### Gemini 1.5 Flash（推奨）
- **入力**: $0.075/1M tokens
- **出力**: $0.30/1M tokens
- **月間無料枠**: 1M tokens

### 推定コスト
- **質問生成**: 約$0.001/質問
- **分析処理**: 約$0.005/分析
- **月間コスト**: $10-50程度

## 🛡️ エラーハンドリング

### 自動フォールバック
- APIキー未設定 → デモモード
- API制限到達 → デモモード
- ネットワークエラー → デモモード
- 解析エラー → デフォルト結果

### ログ出力
```bash
# 開発者ツールのコンソールで確認可能
Error generating question: [詳細なエラー情報]
Error analyzing profile: [詳細なエラー情報]
```

## 🧪 テスト方法

### 1. デモモードテスト
```bash
# APIキーを設定せずにテスト
GEMINI_API_KEY=your_gemini_api_key_here npm run dev
```

### 2. AIモードテスト
```bash
# 実際のAPIキーを設定してテスト
GEMINI_API_KEY=actual_api_key npm run dev
```

### 3. 機能確認
1. ログイン画面でメールアドレス入力
2. 質問に回答
3. 分析結果を確認
4. 大学推薦を確認

## 🔍 トラブルシューティング

### よくある問題

#### 1. APIキーが認識されない
```bash
# .env.localファイルの確認
cat .env.local

# サーバーの再起動
npm run dev
```

#### 2. 分析結果がデモモードのまま
- APIキーが正しく設定されているか確認
- ネットワーク接続を確認
- 開発者ツールでエラーログを確認

#### 3. 料金が心配
- 無料枠内でテスト
- 使用量を監視
- 必要に応じてデモモードに戻す

## 📈 今後の拡張

### 短期目標
- [ ] プロンプトの最適化
- [ ] レスポンス時間の改善
- [ ] エラーハンドリングの強化

### 中期目標
- [ ] 複数モデルの対応
- [ ] キャッシュ機能の実装
- [ ] 使用量監視機能

### 長期目標
- [ ] 学習機能の実装
- [ ] 多言語対応
- [ ] 音声入力対応

## 🎉 完了！

Gemini APIの統合が完了しました。実際のAI機能をお楽しみください！

---

**注意**: APIキーは機密情報です。`.env.local`ファイルは`.gitignore`に含まれているため、Gitにコミットされません。
