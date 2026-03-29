export type ExtractFrameNodeData = {
  label: string;
  inputVideoUrl: string;
  timestamp: string;
  extractedFrameUrl: string;
  runId?: string;
  isProcessing?: boolean;
  error?: string;
};