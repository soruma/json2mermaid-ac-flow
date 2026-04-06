import { Action, Flow } from '../schema/flow';

/**
 * Mermaid 構文内の ID を安全な形式に変換します。
 * (英数字とアンダースコア以外を置換)
 */
const sanitizeId = (id: string): string => {
  return id.replace(/[^a-zA-Z0-9]/g, '_');
};

/**
 * UUID かどうかを判定します。
 */
const isUUID = (str: string): boolean => {
  // Common UUID regex: 8-4-4-4-12 hexadecimal characters
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

/**
 * アクション (Action) を Mermaid のノード定義に変換します。
 */
const generateNode = (action: Action): string => {
  const safeId = sanitizeId(action.Identifier);
  let label = `${action.Type}`;

  // Parameters から追加情報を抽出してラベルに付与
  if (action.Parameters) {
    if (action.Parameters.Text) {
      const escapedText = action.Parameters.Text.replace(/"/g, '#quot;');
      label += `\n${escapedText.substring(0, 30)}${escapedText.length > 30 ? '...' : ''}`;
    } else if (action.Parameters.Attributes) {
      const attrs = Object.entries(action.Parameters.Attributes)
        .map(([k, v]) => `${k}=${v}`)
        .join(', ');
      if (attrs)
        label += `
[${attrs.substring(0, 30)}${attrs.length > 30 ? '...' : ''}]`;
    }
  }

  // 識別子がUUIDでない場合のみ、識別子を補助情報として追加
  if (!isUUID(action.Identifier)) {
    label += `
(${action.Identifier})`;
  }

  // アクションタイプに応じて形状を変更
  const decisionTypes = ['CheckHoursOfOperation', 'CheckAttribute', 'GetUserInput', 'CheckPrompts'];
  if (decisionTypes.includes(action.Type)) {
    return `  ${safeId}{"${label}"}`; // ひし形
  }

  return `  ${safeId}["${label}"]`; // 四角形
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

      // Condition オブジェクトからラベルを推測
      let labelText = `Condition ${index + 1}`;
      if (condition.Condition) {
        if (condition.Condition.Operator) {
          labelText = condition.Condition.Operator;
        } else if (condition.Condition.Comparison) {
          labelText = `${condition.Condition.Comparison} ${condition.Condition.Value || ''}`;
        }
      }

      const label = `|${labelText}|`;
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
