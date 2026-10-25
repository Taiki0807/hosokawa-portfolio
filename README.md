# hosokawa-lab.dev

Next.js（App Router）製のポートフォリオ。既存の Blog / CSS Notes / Projects（MDX）に加えて、次の機能があります。

- **学習ログ**：過去 365 日のヒートマップ（JST）、統計、最近の記録、Day detail、`/learning/[date]` の詳細ノート
- **目標と挑戦中の資格**：試験までの残り日数、学習ログと連動する進捗、年・月の目標
- **第三者の目線レビュー**：AI が学習ログと成果物から作成し、本人が確認・編集して公開（「AIが作成」などの注意書きは常に表示）
- **AI チャット**：ホームで、自作のローカル LLM（自宅の PC で動かす API）と話せる。`LOCAL_LLM_BASE_URL` を設定したときだけ表示
- **オーナー専用の管理画面** `/admin`：GitHub ログイン、記録フォーム（AI 整形）、記録一覧、AI レビュー、成果物・ブログ、スキル・資格、お問い合わせ受信箱、設定

| 役割         | 使うもの                                                                          |
| ------------ | --------------------------------------------------------------------------------- |
| ホスティング | Vercel                                                                            |
| DB           | Cloudflare D1（HTTP API 経由、Drizzle ORM の `sqlite-proxy`）                     |
| 画像         | Cloudflare R2（署名付き URL で直接アップロード、カスタムドメインで配信）          |
| メール       | Resend（お問い合わせの通知）                                                      |
| 認証         | Auth.js v5 + GitHub OAuth（JWT セッション、許可リスト方式）                       |
| AI           | OpenAI API（サーバー側のみ。`AI_PROVIDER=anthropic` で Anthropic にも切り替え可） |

## ローカル開発

```bash
pnpm install
cp .env.example .env.local   # 必要な値を入れる（DB_DRIVER=local ならクラウドの値は不要）
pnpm db:migrate:local        # .data/dev.sqlite を作ってマイグレーションを適用
pnpm db:seed                 # 開発用のダミーデータ（ローカル専用。本番ビルドには含まれない）
pnpm dev
```

- `DB_DRIVER=local`：ローカル SQLite（`.data/dev.sqlite`）。`DB_DRIVER=d1`：開発用の D1。
- **開発から本番の D1 には接続しません。** `CLOUDFLARE_D1_PRODUCTION_DATABASE_ID` に本番 DB の ID を入れておくと、本番デプロイ（`VERCEL_ENV=production`）以外からの接続を拒否します。
- `AI_PROVIDER=mock` にすると AI を呼ばずに動作確認できます（Vercel 上では無視されます）。
- ログインを試すには GitHub OAuth App（開発用）の Callback URL を `http://localhost:3000/api/auth/callback/github` にし、`ALLOWED_GITHUB_LOGINS` に自分のログイン名を入れます。

### スクリプト

| コマンド                       | 内容                                                                                                                 |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` / `pnpm typecheck` | ESLint / 型チェック                                                                                                  |
| `pnpm test`                    | 単体テスト（Vitest：統計・ヒートマップ・目標進捗・認可・Markdown のサニタイズ・AI 入出力・お問い合わせ・レート制限） |
| `pnpm test:e2e`                | e2e（Playwright。専用の SQLite と AI のモックで動き、外部サービスには接続しない）                                    |
| `pnpm db:generate`             | `lib/db/schema.ts` からマイグレーションを生成（`drizzle/`）                                                          |
| `pnpm db:migrate:local`        | ローカル SQLite に適用                                                                                               |
| `pnpm db:migrate:d1`           | `.env.local` の D1 に適用（`drizzle-kit migrate`、`driver: d1-http`）                                                |

初回の e2e の前に `pnpm exec playwright install chromium` を実行してください。

## 本番のセットアップ

### 1. Cloudflare D1

1. ダッシュボードで D1 データベースを 2 つ作る（例：`hosokawa-lab-dev` と `hosokawa-lab-prod`）。
2. API トークンを作る：権限は **Account → D1 → Edit** のみ。
3. マイグレーションを適用する：`.env.local` の `CLOUDFLARE_D1_DATABASE_ID` を対象の DB にして `pnpm db:migrate:d1`。まず dev、確認後に prod。
   - `drizzle/0001_import_existing_skills_and_certs.sql` で、以前 `data.ts` にあったスキルと取得済み資格が入ります。

### 2. Cloudflare R2（バッジ画像など）

1. バケットを作り、**カスタムドメイン**（例：`img.hosokawa-lab.dev`）を接続する。`R2_PUBLIC_BASE_URL=https://img.hosokawa-lab.dev`。
2. R2 の API トークンを作る：**Object Read & Write**、対象はそのバケットだけ。
3. ブラウザから直接 PUT するため、バケットの CORS を設定する：

```json
[
  {
    "AllowedOrigins": ["https://hosokawa-lab.dev", "http://localhost:3000"],
    "AllowedMethods": ["PUT"],
    "AllowedHeaders": ["content-type"],
    "MaxAgeSeconds": 3600
  }
]
```

アップロードは「サーバーが種類（png/jpg/webp/svg）とサイズ（2MB 以下）を確認して保存キーを決め、署名付き URL を発行 → ブラウザが PUT → サーバーが実物を `HeadObject` で再確認（合わなければ削除）」の順です。

### 3. Resend（お問い合わせの通知）

`hosokawa-lab.dev` を送信元として認証します（未認証のあいだは `onboarding@resend.dev` から送られます）。

1. Resend の **Domains → Add Domain** で `hosokawa-lab.dev` を追加（リージョンは例：Tokyo `ap-northeast-1`）。
2. 表示された DNS レコードを、ドメインの DNS（Cloudflare など）に追加する。値は必ず Resend の画面からコピーしてください。目安は次のとおりです。

| 種類 | 名前                   | 値                                                        | 用途                              |
| ---- | ---------------------- | --------------------------------------------------------- | --------------------------------- |
| TXT  | `resend._domainkey`    | `p=MIGfMA0GCSq...`（画面に表示される公開鍵）              | DKIM                              |
| MX   | `send`                 | `feedback-smtp.ap-northeast-1.amazonses.com`（優先度 10） | 送信用サブドメイン（Return-Path） |
| TXT  | `send`                 | `v=spf1 include:amazonses.com ~all`                       | SPF                               |
| TXT  | `_dmarc`（任意・推奨） | `v=DMARC1; p=none;`                                       | DMARC                             |

- Cloudflare の場合、これらのレコードはプロキシなし（DNS only）にします。
- ルートドメインに既存の SPF があっても、上の SPF は `send` サブドメインなのでぶつかりません。

3. Resend で **Verify** を押し、Verified になるまで待つ（数分〜数時間）。
4. `MAIL_FROM="Hosokawa Lab <noreply@hosokawa-lab.dev>"`、`MAIL_TO=受け取りたいアドレス` を設定する。

お問い合わせは **先に D1 に保存** してから通知メールを送ります。送信に失敗しても保存は成功扱いで、失敗は受信箱に表示されます。

### 4. GitHub OAuth App（本番用）

- Homepage URL：`https://hosokawa-lab.dev`
- Authorization callback URL：`https://hosokawa-lab.dev/api/auth/callback/github`
- `AUTH_GITHUB_ID` / `AUTH_GITHUB_SECRET` を設定し、`AUTH_SECRET` は `npx auth secret` などで生成。
- `ALLOWED_GITHUB_LOGINS` に管理画面に入れるアカウントをカンマ区切りで入れる。外したアカウントは次のアクセスから拒否されます。

### 5. Vercel の環境変数

`.env.example` のすべてを設定します（Production と Preview で D1 を分け、Preview は開発用 D1 を指す）。`DB_DRIVER=d1`。AI を使う場合は `OPENAI_API_KEY` と `OPENAI_MODEL`（必須。推論モデルなら任意で `OPENAI_REASONING_EFFORT`）。OpenAI には `store: false` で送り、学習ログを OpenAI 側に保存させません。Anthropic を使うときは `AI_PROVIDER=anthropic` と `ANTHROPIC_API_KEY`・`ANTHROPIC_MODEL`。

### 6. ホームの AI チャット（任意）

- `LOCAL_LLM_BASE_URL` にローカル LLM の API の URL（例：Cloudflare Tunnel の URL）を入れると、ホームにチャット欄が出ます。空なら出ません。ホームは静的生成なので、URL を変えたら再デプロイしてください。
- `LOCAL_LLM_SYSTEM_PROMPT` に学習データと同じ system を入れると、毎回先頭に付けます（空なら忍者「ハンゾウ」の口調）。
- ブラウザは API を直接呼ばず、`/api/chat`（入力の検証、送信元ごとに 1 時間 20 回まで）と `/api/chat/health`（状態表示）を通します。会話の内容はサイトの DB にもログにも残しません。

## 設計メモ

- **キャッシュ**：公開ページの集計は `unstable_cache` でキャッシュし、管理画面で保存したときに `updateTag` で再検証します。ホームは「今日（JST）」が変わるため 1 時間ごとにも再生成します。D1 へのクエリは 1 回で取得して JS で集計します。
- **認可**：`proxy.ts`（Next 16 で middleware から改名）は早期リダイレクトだけで、各ページ・Server Action・API で毎回 `requireOwner()` を確認します。
- **ナビのログイン状態**はクライアント側で取得し、既存ページを静的生成のまま保っています。
- **Markdown**：管理画面の入力は MDX として評価せず、`rehype-sanitize` を通した HTML だけを描画します。Callout は `> [!TIP]` などで書けます。
- **AI**：オーナーの操作でのみ呼び出し、1 時間に 10 回まで（D1 の `rate_limit`）。日報の整形に渡すのは日付・タグ・分数・メモ・詳細ノートだけで、入力と違う分数を含む出力は使いません。AI が整えた文章には常に「AI整形」バッジが付き、本人が確認するまで公開されません。
- **学習ログの公開範囲**：`published` は内容まで公開、`private` は時間だけ草と統計に反映、`draft` は非公開。
- **記事**：既存の MDX はそのまま表示し、管理画面で書いた記事（D1）を同じ一覧に並べます（slug が重なったら MDX を優先）。
