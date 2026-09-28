# ちきんポイント通帳

静的なGitHub Pagesサイト。ビルドは不要です。index.html / styles.css / app.js / ledger.mjs / sw.js / manifest.webmanifest を同じディレクトリに配置します。既存のPages公開方法を継続してください。

## ローカル確認

- `node local-server.cjs` → http://127.0.0.1:4178/creative-chicken-points/
- `node --test ledger.test.mjs`
- Playwrightが利用できる環境で `node browser-ui.test.cjs`（FirebaseモックでUI検証）、`node browser-sync.test.cjs`（実Firestoreの公開読み取り）、`node browser-check.cjs`（実接続・375px表示）。Microsoft Edgeを使用します。既存のPlaywrightが別の場所にある場合はNODE_PATHを設定してください。

## データと権限

Firestore `records` コレクションが唯一の台帳です。child（ぴよきち / ぴよみ）、type（earn / spend）、points（正の整数）、reason、createdAt（サーバー時刻）、createdBy（管理者メール）を保存します。全履歴の加算−消費で残高を計算し、削除もそのまま反映します。負の残高もそのまま表示します。公開履歴は最初10件、もっと見るで追加表示します。

ログイン不要で閲覧可能。管理UIは getadry@gmail.com に限定し、実際の書き込み権限は設定済みFirestoreルールで保護します。ログインはメモリ内のみで、再読み込み後は再ログインが必要です。Firebase Authの承認済みドメインに niwanotorico.github.io と、ローカル確認用の 127.0.0.1 または localhost が必要です。

旧端末内データの自動移行はしません。旧データはFirebaseの残高には含まれません。必要な初期残高は管理画面から理由付きで登録してください。台帳全体を購読するため、大量の履歴に増えた場合は読み取り量の見直しが必要です。

Service Workerは旧creative-chicken-pointsキャッシュを削除し、ネットワークから読み込みます。オフライン時の残高は確定値として表示せず、接続状況を表示します。初回更新時に旧画面が開いた場合、ワーカー更新後に再読み込みしてください。
