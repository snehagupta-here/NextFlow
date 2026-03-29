export type GeminiModelOption = {
  id: string;
  label: string;
  description?: string;
  supportedGenerationMethods?: string[];
  inputTokenLimit?: number;
  outputTokenLimit?: number;
  disabled: boolean;
  disabledReason?: "unsupported" | "deprecated" | "paid_quota" | "quota_unavailable";
  badge?: "deprecated" | "paid quota" | "unsupported" | "quota unavailable";
};