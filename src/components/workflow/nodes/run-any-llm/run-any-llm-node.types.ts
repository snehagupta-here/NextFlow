export type RunAnyLlmNodeData = {
  label: string;
  model: string;
  systemPrompt: string;
  userMessage: string;
  imageUrls: string[];
  outputText: string;
  runId?: string;
  isProcessing?: boolean;
  error?: string;
};