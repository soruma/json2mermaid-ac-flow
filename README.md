# json2mermaid-ac-flow

Amazon Connect の問い合わせフロー (Flow Language) JSON ファイルを、フロー図を表現する Mermaid 形式のテキストファイルに変換する CLI ツールです。

## 特徴

- **簡単な変換**: JSON ファイルを渡すだけで Mermaid 構文を生成。
- **型安全**: Zod を使用した厳密なスキーマ検証。
- **CLI インターフェース**: 引数とオプションによる直感的な操作。

## インストール

```bash
npm install -g .
```

または、開発環境で直接実行する場合：

```bash
npm install
npm run build
node dist/bin.js <input-file>
```

## 使い方

```bash
json2mermaid-ac-flow input-flow.json -o output-diagram.mmd
```

### オプション

- `-o, --output <file>`: 出力先の Mermaid ファイルパス (デフォルトは入力ファイル名 + `.mmd`)。
- `-v, --version`: バージョン情報の表示。
- `-h, --help`: ヘルプの表示。

## 開発

### テストの実行

```bash
npm test
```

### 静的解析とフォーマット

```bash
npm run lint
npm run format
```

## ライセンス

ISC
