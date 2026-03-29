export type UploadImageNodeData = {
  label: string;
  fileName: string;
  imageUrl: string;
  assemblyId?: string;
  isUploading?: boolean;
  error?: string;
};