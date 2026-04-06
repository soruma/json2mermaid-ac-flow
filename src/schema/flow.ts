import { z } from 'zod';

/**
 * 遷移定義 (Transitions) のスキーマ
 */
export const TransitionSchema = z.object({
  NextAction: z.string().optional(),
  Errors: z
    .array(
      z.object({
        NextAction: z.string(),
        ErrorType: z.string().optional(),
      }),
    )
    .optional(),
  Conditions: z
    .array(
      z.object({
        NextAction: z.string(),
        Condition: z.any().optional(), // 条件の詳細は後で具体化可能
      }),
    )
    .optional(),
});

/**
 * アクション (Actions) のスキーマ
 */
export const ActionSchema = z.object({
  Identifier: z.string(),
  Type: z.string(),
  Parameters: z.record(z.string(), z.any()).optional(),
  Transitions: TransitionSchema,
});

/**
 * フロー全体 (Flow) のスキーマ
 */
export const FlowSchema = z.object({
  Version: z.string(),
  StartAction: z.string(),
  Metadata: z.record(z.string(), z.any()).optional(),
  Actions: z.array(ActionSchema),
});

/**
 * TypeScript 用の型定義を自動生成
 */
export type Flow = z.infer<typeof FlowSchema>;
export type Action = z.infer<typeof ActionSchema>;
export type Transition = z.infer<typeof TransitionSchema>;
