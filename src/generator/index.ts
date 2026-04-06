import { Action, Flow, Transition } from '../schema/flow';

/**
 * Mermaid 構文内の ID を安全な形式に変換します。
 * (英数字とアンダースコア以外を置換)
 */
const sanitizeId = (id: string): string => {
  return id.replace(/[^a-zA-Z0-9]/g, '_');
};

/**
 * アクション (Action) を Mermaid のノード定義に変換します。
 */
const generateNode = (action: Action): string => {
  const safeId = sanitizeId(action.Identifier);
  const label = `${action.Type}: ${action.Identifier}`;

  // TODO: アクションタイプに応じて形状を変更する (例: CheckHoursOfOperation はひし形)
  return `  ${safeId}["${label}"]`;
};

/**
 * 遷移 (Transition) を Mermaid のエッジ定義に変換します。
 */
const generateEdges = (action: Action): string[] => {
  const edges: string[] = [];
  const fromId = sanitizeId(action.Identifier);
  const { Transitions } = action;

  // NextAction (デフォルト遷移)
  if (Transitions.NextAction) {
    const toId = sanitizeId(Transitions.NextAction);
    edges.push(`  ${fromId} --> ${toId}`);
  }

  // Errors (エラー遷移)
  if (Transitions.Errors) {
    Transitions.Errors.forEach((error) => {
      const toId = sanitizeId(error.NextAction);
      const label = error.ErrorType ? `|Error: ${error.ErrorType}|` : '|Error|';
      edges.push(`  ${fromId} -- ${label} --> ${toId}`);
    });
  }

  // Conditions (条件分岐)
  if (Transitions.Conditions) {
    Transitions.Conditions.forEach((condition, index) => {
      const toId = sanitizeId(condition.NextAction);
      const label = `|Condition ${index + 1}|`; // TODO: 条件の詳細を表示
      edges.push(`  ${fromId} -- ${label} --> ${toId}`);
    });
  }

  return edges;
};

/**
 * Flow オブジェクト全体を Mermaid 構文に変換します。
 */
export const generateMermaid = (flow: Flow): string => {
  const lines: string[] = ['graph TD'];

  // 全ノードの定義
  flow.Actions.forEach((action) => {
    lines.push(generateNode(action));
  });

  // 全エッジの定義
  flow.Actions.forEach((action) => {
    const actionEdges = generateEdges(action);
    lines.push(...actionEdges);
  });

  return lines.join('\n');
};
