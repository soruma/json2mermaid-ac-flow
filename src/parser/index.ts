import * as fs from 'fs';
import { FlowSchema, Flow } from '../schema/flow';

/**
 * Amazon Connect フローの JSON ファイルを解析して Flow オブジェクトを返します。
 * @param filePath 解析する JSON ファイルのパス
 * @returns バリデーション済みの Flow オブジェクト
 */
export const parseFlowFile = (filePath: string): Flow => {
  const content = fs.readFileSync(filePath, 'utf-8');
  const json = JSON.parse(content);
  return FlowSchema.parse(json);
};
