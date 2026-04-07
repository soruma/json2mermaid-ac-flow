# 設計書 (docs/DESIGN.md)

## 1. 概要
`json2mermaid-ac-flow` は、Amazon Connect の問い合わせフロー (Flow Language) を定義する JSON ファイルを読み込み、フロー図を表現する Mermaid 形式のテキストファイルに変換する CLI ツールです。

### 参考リソース (Amazon Connect Flow Language 仕様)
- [Amazon Connect Flow Language (AWS Documentation)](https://docs.aws.amazon.com/connect/latest/adminguide/flow-language.html)
- [Amazon Connect API Reference - CreateFlow](https://docs.aws.amazon.com/connect/latest/APIReference/API_CreateFlow.html)
- [Amazon Connect フローのインポートとエクスポート (JSON 形式)](https://docs.aws.amazon.com/connect/latest/adminguide/contact-flow-import-export.html)

## 2. CLI インターフェース定義
- **コマンド名**: `json2mermaid-ac-flow`
- **引数**:
  - `input-file`: 入力となる Amazon Connect フロー JSON ファイルのパス。
- **オプション**:
  - `-o, --output <file>`: 出力先の Mermaid ファイルパス。省略時は標準出力に出力する。
  - `--lang <language>`: ノードラベルの出力言語を指定する。`ja`（日本語）または `en`（英語）。省略時は `ja`。
  - `-V, --version`: バージョン情報の表示。
  - `-h, --help`: ヘルプの表示。

## 3. Amazon Connect Flow Language の型定義 (概要)
Amazon Connect フローの JSON は、大きく分けて以下の構造を持ちます。
- `Version`: フローのバージョン (例: "2019-10-30")
- `StartAction`: 開始アクションの ID。
- `Metadata`: フローの名称や説明、UI上の配置情報など (Mermaid変換には基本不要)。
- `Actions`: アクション (ノード) の配列。

### 各アクションの構造
各アクションは以下のプロパティを持ちます。
- `Identifier`: アクションを一意に特定する ID。
- `Type`: アクションの種類。
- `Parameters`: アクションごとの設定値。
- `Transitions`: 次のアクションへの遷移定義。
  - `NextAction`: デフォルトの遷移先 ID。
  - `Errors`: エラー時の遷移先リスト。
  - `Conditions`: 条件分岐時の遷移先リスト。

### 主要なアクションタイプ (Type)
- `PlayAudio`: 音声再生。
- `GetUserInput`: 顧客入力の取得 (番号入力など)。
- `CheckHoursOfOperation`: 営業時間判定。
- `Transfer`: 転送 (キューへの転送など)。
- `Disconnect`: 切断。
- `SetAttributes`: 属性の設定。

## 4. Mermaid 変換ロジック
... (以下略)
- **グラフ形式**: `graph TD` (上から下への有向グラフ) を使用。
- **ノード変換**: 各アクションの `Type` に基づき、Mermaid のノード形状やラベルを決定。
  - `PlayAudio` -> `[PlayAudio: "Message text"]`
  - `CheckHoursOfOperation` -> `{"Check Hours"}` (ひし形)
- **エッジ変換**: 各アクションの `Transitions` を走査し、Mermaid の矢印 (`-->`) を生成。条件分岐がある場合はラベルを付与。

## 6. ノードラベルの言語対応

### 概要
`--lang` オプションにより、ノードラベルに表示するアクション Type 名を英語（元の Type 名）または日本語（Amazon Connect の管理コンソール上の表示名）に切り替えることができる。

- **`--lang en`**: Type 名をそのまま英語で表示する（例: `CheckHoursOfOperation`）。
- **`--lang ja`**（デフォルト）: Type 名を日本語のラベルに変換して表示する（例: `営業時間の確認`）。

マッピングが定義されていない Type については、言語設定によらず元の英語 Type 名を表示する。

### Type と日本語ラベルの対応表

以下の対応は、Amazon Connect 管理コンソール上の表記（フロービルダーのブロック名）に基づく。

| Type (英語) | 日本語ラベル | 参照ドキュメント |
|---|---|---|
| `UpdateContactAttributes` | コンタクト属性の設定 | [set-contact-attributes](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-contact-attributes.html) |
| `UpdateContactData` | コンタクト属性の設定 | [contact-actions-updatecontactdata](https://docs.aws.amazon.com/connect/latest/APIReference/contact-actions-updatecontactdata.html) |
| `CheckAttribute` | コンタクト属性を確認する | [check-contact-attributes](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/check-contact-attributes.html) |
| `MessageParticipant` | プロンプトの再生 | [play](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/play.html) |
| `GetParticipantInput` | 顧客の入力を取得する | [get-customer-input](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/get-customer-input.html) |
| `SetVoice` | 音声の設定 | [set-voice](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-voice.html) |
| `UpdateContactTextToSpeechVoice` | 音声の設定 | [set-voice](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-voice.html) |
| `SetRecordingBehavior` | 録音の設定 | [set-recording-behavior](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-recording-behavior.html) |
| `UpdateContactRecordingBehavior` | 記録と分析の動作の設定 | [set-recording-behavior](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-recording-behavior.html) |
| `SetQueue` | キューの設定 | [set-working-queue](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-working-queue.html) |
| `SetWorkingQueue` | 作業キューの設定 | [set-working-queue](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-working-queue.html) |
| `UpdateContactTargetQueue` | 作業キューの設定 | [set-working-queue](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-working-queue.html) |
| `CheckQueueStatus` | キューのステータスを確認する | [check-queue-status](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/check-queue-status.html) |
| `TransferContactToQueue` | キューへの転送 | [transfer-to-queue](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/transfer-to-queue.html) |
| `TransferContactToNumber` | 電話番号への転送 | [transfer-to-phone-number](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/transfer-to-phone-number.html) |
| `DisconnectParticipant` | 切断 | [disconnect-hang-up](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/disconnect-hang-up.html) |
| `Wait` | 待機 | [wait](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/wait.html) |
| `CheckHoursOfOperation` | 営業時間の確認 | [check-hours-of-operation](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/check-hours-of-operation.html) |
| `InvokeExternalResource` | AWS Lambda 関数を呼び出す | [invoke-lambda-function-block](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/invoke-lambda-function-block.html) |
| `InvokeLambdaFunction` | AWS Lambda 関数を呼び出す | [invoke-lambda-function-block](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/invoke-lambda-function-block.html) |
| `GetContactData` | 顧客情報の取得 | [contact-block-definitions](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/contact-block-definitions.html) |
| `DistributeByPercentage` | パーセンテージベースの配布 | [distribute-by-percentage](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/distribute-by-percentage.html) |
| `SetRoutingCriteria` | ルーティング条件の設定 | [set-routing-criteria](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-routing-criteria.html) |
| `UpdateFlowLoggingBehavior` | ログ記録動作の設定 | [set-logging-behavior](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-logging-behavior.html) |
| `InvokeModule` | モジュールの呼び出し | [invoke-module-block](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/invoke-module-block.html) |
| `EndFlowModuleExecution` | 戻る (モジュールから) | [return-module](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/return-module.html) |
| `ResumeContact` | コンタクトを再開 | [resume-contact](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/resume-contact.html) |
| `SetCallbackNumber` | コールバック番号を設定する | [set-callback-number](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-callback-number.html) |
| `SetDisconnectFlow` | 切断フローの設定 | [set-disconnect-flow](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-disconnect-flow.html) |
| `SetHoldFlow` | 保留フローの設定 | [set-hold-flow](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-hold-flow.html) |
| `SetWhisperFlow` | ウィスパーフローの設定 | [set-whisper-flow](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-whisper-flow.html) |
| `SetEventFlow` | イベントフローの設定 | [set-event-flow](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/set-event-flow.html) |
| `CheckVoiceID` | Voice ID を確認する | [check-voice-id](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/check-voice-id.html) |
| `CheckStaffing` | 人員の確認 | [check-staffing](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/check-staffing.html) |
| `StartMediaStreaming` | メディアストリーミングの開始 | [start-media-streaming](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/start-media-streaming.html) |
| `StopMediaStreaming` | メディアストリーミングの停止 | [stop-media-streaming](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/stop-media-streaming.html) |
| `ShowView` | ビューを表示 | [show-view-block](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/show-view-block.html) |
| `LoadContactContent` | 保存されたコンテンツを取得する | [get-stored-content](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/get-stored-content.html) |
| `CreatePersistentContactAssociation` | 常設コンタクト関連付けの作成 | [create-persistent-contact-association-block](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/create-persistent-contact-association-block.html) |
| `AuthenticateParticipant` | 顧客を認証 | [authenticate-customer](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/authenticate-customer.html) |
| `CheckCallProgress` | 通話の進捗確認 | [check-call-progress](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/check-call-progress.html) |

### 参考ドキュメント（日本語ラベルの出典）

- [Amazon Connect フローブロック定義一覧 (AWS ドキュメント)](https://docs.aws.amazon.com/ja_jp/connect/latest/adminguide/contact-block-definitions.html)

## 5. テスト戦略
- **単体テスト (Unit Tests)**:
  - Zod スキーマによる JSON バリデーションのテスト。
  - 各アクションから Mermaid ノード/エッジへの個別の変換ロジックのテスト。
- **統合テスト (Integration Tests)**:
  - JSON 全体を渡して一貫した Mermaid 構文が生成されるかのテスト。
- **E2E テスト**:
  - CLI を実行し、ファイル入出力を含めた動作の検証。
- **ゴールデンマスターテスト**:
  - 既知の入力 JSON と、期待される Mermaid 出力を比較する。
