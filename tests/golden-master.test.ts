import * as fs from 'fs';
import * as path from 'path';
import { convertJsonToMermaid } from '../src';

describe('Golden Master Test', () => {
  const inputPath = path.resolve(__dirname, './fixtures/sample-flow.json');
  const goldenPath = path.resolve(__dirname, './fixtures/sample-flow.golden.mmd');

  it('should match the golden master (exact comparison)', () => {
    // 1. ゴールデンマスター（期待される出力）を読み込む
    const expected = fs.readFileSync(goldenPath, 'utf-8').trim();

    // 2. 現在のロジックで変換を実行
    const actual = convertJsonToMermaid(inputPath).trim();

    // 3. 比較（空白や改行コードの違いを考慮して trim() を適用）
    expect(actual).toBe(expected);
  });
});
