export type CropImageNodeData = {
  label: string;
  inputImageUrl: string;
  x: string;
  y: string;
  width: string;
  height: string;
  croppedImageUrl: string;
  runId?: string;
  isProcessing?: boolean;
  error?: string;
};