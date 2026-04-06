import { parseFlowFile } from './parser';
import { generateMermaid } from './generator';

/**
 * Amazon Connect フローの JSON ファイルを Mermaid 形式に変換します。
 * @param inputPath 入力 JSON ファイルのパス
 * @returns Mermaid 構文の文字列
 */
export const convertJsonToMermaid = (inputPath: string): string => {
  const flow = parseFlowFile(inputPath);
  return generateMermaid(flow);
};
