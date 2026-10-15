-- data.ts に固定で書かれていたスキル・取得済み資格を D1 に移す（表示は変えない）
INSERT INTO skill (name, category, years, description, sort, created_at, updated_at) VALUES ('Next.js', 'learning', NULL, 'ルーティング、レイアウト、APIルートを使ったモダンなアプリ開発。趣味で利用。', 0, '2026-10-15T00:00:00.000Z', '2026-10-15T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO skill (name, category, years, description, sort, created_at, updated_at) VALUES ('React', 'learning', NULL, 'コンポーネント・状態管理・propsを使ったUI構築。趣味で利用。', 1, '2026-10-15T00:00:00.000Z', '2026-10-15T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO skill (name, category, years, description, sort, created_at, updated_at) VALUES ('TypeScript', 'learning', NULL, '型安全なコードでバグを未然に防ぐ開発スタイル。趣味で利用。', 2, '2026-10-15T00:00:00.000Z', '2026-10-15T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO skill (name, category, years, description, sort, created_at, updated_at) VALUES ('C#', 'experience', NULL, '業務システム開発', 3, '2026-10-15T00:00:00.000Z', '2026-10-15T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO skill (name, category, years, description, sort, created_at, updated_at) VALUES ('Oracle', 'experience', NULL, 'SQLによるデータ操作・業務データベースの運用。', 4, '2026-10-15T00:00:00.000Z', '2026-10-15T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO skill (name, category, years, description, sort, created_at, updated_at) VALUES ('Python', 'experience', NULL, '業務システム開発、競技プラミングで使用', 5, '2026-10-15T00:00:00.000Z', '2026-10-15T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO skill (name, category, years, description, sort, created_at, updated_at) VALUES ('C++', 'learning', NULL, '競技プログラミング(AtCoder等)で使用。アルゴリズム・データ構造の学習。', 6, '2026-10-15T00:00:00.000Z', '2026-10-15T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO skill (name, category, years, description, sort, created_at, updated_at) VALUES ('AWS', 'experience', NULL, 'EC2・S3・Lambdaなどを使ったクラウド構成。趣味で利用。', 7, '2026-10-15T00:00:00.000Z', '2026-10-15T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO skill (name, category, years, description, sort, created_at, updated_at) VALUES ('GCP', 'learning', NULL, 'Cloud Run・FireStorageなどを使ったクラウド構成。趣味で利用。', 8, '2026-10-15T00:00:00.000Z', '2026-10-15T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO certification (name, issuer, earned_on, expires_on, badge_url, credential_url, sort, created_at, updated_at) VALUES ('AWS Certified Developer – Associate', '', '2026-03', NULL, '/badges/aws-certified-developer-associate.png', 'https://www.credly.com/badges/89f89d7b-4e76-407a-ba0e-ec32cc01686d/public_url', 0, '2026-10-15T00:00:00.000Z', '2026-10-15T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO certification (name, issuer, earned_on, expires_on, badge_url, credential_url, sort, created_at, updated_at) VALUES ('Associate Cloud Engineer', '', '2026-03', NULL, '/badges/associate-cloud-engineer-certification.png', 'https://www.credly.com/badges/dff52c35-ee88-441a-ac59-b193c045ffe7/public_url', 1, '2026-10-15T00:00:00.000Z', '2026-10-15T00:00:00.000Z');
--> statement-breakpoint
INSERT INTO certification (name, issuer, earned_on, expires_on, badge_url, credential_url, sort, created_at, updated_at) VALUES ('Professional Cloud Architect', '', '2026-04', NULL, '/badges/professional-cloud-architect-certification.png', 'https://www.credly.com/badges/db413ed1-e982-49f4-82b9-0c40c051d43b/public_url', 2, '2026-10-15T00:00:00.000Z', '2026-10-15T00:00:00.000Z');
