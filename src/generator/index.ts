import { Action, Flow } from '../schema/flow';

export type Language = 'ja' | 'en';

/**
 * Amazon Connect フロー Type の日本語ラベルマッピング
 */
const ACTION_TYPE_LABELS_JA: Record<string, string> = {
  // コンタクト属性
  UpdateContactAttributes: 'コンタクト属性の設定',
  UpdateContactData: 'コンタクト属性の設定',
  CheckAttribute: 'コンタクト属性を確認する',
  // プロンプト・入力
  MessageParticipant: 'プロンプトの再生',
  GetParticipantInput: '顧客の入力を取得する',
  // 音声・録音
  SetVoice: '音声の設定',
  UpdateContactTextToSpeechVoice: '音声の設定',
  SetRecordingBehavior: '録音の設定',
  UpdateContactRecordingBehavior: '記録と分析の動作の設定',
  // キュー
  SetQueue: 'キューの設定',
  SetWorkingQueue: '作業キューの設定',
  UpdateContactTargetQueue: '作業キューの設定',
  CheckQueueStatus: 'キューのステータスを確認する',
  // 転送・切断
  TransferContactToQueue: 'キューへの転送',
  TransferContactToNumber: '電話番号への転送',
  DisconnectParticipant: '切断',
  // 時間・待機
  Wait: '待機',
  CheckHoursOfOperation: '営業時間の確認',
  // Lambda・外部連携
  InvokeExternalResource: 'AWS Lambda 関数を呼び出す',
  InvokeLambdaFunction: 'AWS Lambda 関数を呼び出す',
  // 配布・ルーティング
  DistributeByPercentage: 'パーセンテージベースの配布',
  SetRoutingCriteria: 'ルーティング条件の設定',
  // ロギング
  UpdateFlowLoggingBehavior: 'ログ記録動作の設定',
  // 顧客情報
  GetContactData: '顧客情報の取得',
  // フロー制御
  InvokeModule: 'モジュールの呼び出し',
  EndFlowModuleExecution: '戻る (モジュールから)',
  ResumeContact: 'コンタクトを再開',
  // コールバック
  SetCallbackNumber: 'コールバック番号を設定する',
  // フロー設定
  SetDisconnectFlow: '切断フローの設定',
  SetHoldFlow: '保留フローの設定',
  SetWhisperFlow: 'ウィスパーフローの設定',
  SetEventFlow: 'イベントフローの設定',
  // Voice ID
  CheckVoiceID: 'Voice ID を確認する',
  // 人員確認
  CheckStaffing: '人員の確認',
  // メディアストリーミング
  StartMediaStreaming: 'メディアストリーミングの開始',
  StopMediaStreaming: 'メディアストリーミングの停止',
  // ビュー
  ShowView: 'ビューを表示',
  // コンテンツ取得
  LoadContactContent: '保存されたコンテンツを取得する',
  // コンタクト関連付け
  CreatePersistentContactAssociation: '常設コンタクト関連付けの作成',
  // 顧客認証
  AuthenticateParticipant: '顧客を認証',
  // 通話進捗
  CheckCallProgress: '通話の進捗確認',
};

const getTypeLabel = (type: string, language: Language): string => {
  if (language === 'ja' && ACTION_TYPE_LABELS_JA[type]) {
    return ACTION_TYPE_LABELS_JA[type];
  }
  return type;
};

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
const generateNode = (action: Action, language: Language): string => {
  const safeId = sanitizeId(action.Identifier);
  let label = getTypeLabel(action.Type, language);

  // Parameters から追加情報を抽出してラベルに付与
  if (action.Parameters) {
    if (action.Parameters.Text) {
      const escapedText = action.Parameters.Text.replace(/"/g, '#quot;');
      label += `\n${escapedText.substring(0, 30)}${escapedText.length > 30 ? '...' : ''}`;
    } else if (action.Parameters.Attributes) {
      const attrEntries = Object.entries(action.Parameters.Attributes as Record<string, string>);
      if (attrEntries.length > 0) {
        const attrs = attrEntries.map(([k, v]) => `${k}=${String(v).replace(/"/g, '#quot;')}`).join('\n');
        label += `\n${attrs}`;
      }
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
export const generateMermaid = (flow: Flow, language: Language = 'ja'): string => {
  const lines: string[] = ['graph TD'];

  // 全ノードの定義
  flow.Actions.forEach((action) => {
    lines.push(generateNode(action, language));
  });

  // 全エッジの定義
  flow.Actions.forEach((action) => {
    const actionEdges = generateEdges(action);
    lines.push(...actionEdges);
  });

  return lines.join('\n');
};
