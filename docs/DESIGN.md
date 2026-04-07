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
