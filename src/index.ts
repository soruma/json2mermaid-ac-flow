import { parseFlowFile } from './parser';
import { generateMermaid, Language } from './generator';

export type { Language };

/**
 * Amazon Connect フローの JSON ファイルを Mermaid 形式に変換します。
 * @param inputPath 入力 JSON ファイルのパス
 * @param language 出力言語 ('ja' または 'en'、デフォルト: 'ja')
 * @returns Mermaid 構文の文字列
 */
export const convertJsonToMermaid = (inputPath: string, language: Language = 'ja'): string => {
  const flow = parseFlowFile(inputPath);
  return generateMermaid(flow, language);
};
