export type UploadVideoNodeData = {
  label: string;
  fileName: string;
  videoUrl: string;
  assemblyId?: string;
  isUploading?: boolean;
  error?: string;
};