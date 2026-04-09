export type UploadVideoNodeData = {
  label: string;
  fileName: string;
  videoUrl: string;
  assemblyId?: string;
  isUploading?: boolean;
  isProcessing?: boolean;
  runId?: string;
  error?: string;
};
