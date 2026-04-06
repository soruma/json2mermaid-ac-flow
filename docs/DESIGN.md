# 設計書 (docs/DESIGN.md)

## 1. 概要
`json2mermaid-ac-flow` は、Amazon Connect の問い合わせフロー (Flow Language) を定義する JSON ファイルを読み込み、フロー図を表現する Mermaid 形式のテキストファイルに変換する CLI ツールです。

## 2. CLI インターフェース定義
- **コマンド名**: `json2mermaid-ac-flow`
- **引数**:
  - `input-file`: 入力となる Amazon Connect フロー JSON ファイルのパス。
- **オプション**:
  - `-o, --output <file>`: 出力先の Mermaid ファイルパス (デフォルトは入力ファイル名 + `.mmd`)。
  - `-v, --version`: バージョン情報の表示。
  - `-h, --help`: ヘルプの表示。

## 3. Amazon Connect Flow Language の型定義 (概要)
Amazon Connect フローの JSON は、大きく分けて以下の構造を持ちます。
- `StartAction`: 開始アクションの ID。
- `Actions`: アクション (ノード) の配列。各アクションは `Identifier` (ID), `Type` (アクションの種類), `Parameters` (設定値), `Transitions` (遷移先) を持つ。

詳細は Zod を用いたバリデーション時に厳密に定義します。

## 4. Mermaid 変換ロジック
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
