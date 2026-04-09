export type UploadImageNodeData = {
  label: string;
  fileName: string;
  imageUrl: string;
  assemblyId?: string;
  isUploading?: boolean;
  isProcessing?: boolean;
  runId?: string;
  error?: string;
};
