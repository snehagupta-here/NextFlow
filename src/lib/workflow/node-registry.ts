import TextNode from "@/components/workflow/nodes/text/TextNode";
import UploadImageNode from "@/components/workflow/nodes/upload-image/UploadImageNode";
import UploadVideoNode from "@/components/workflow/nodes/upload-video/UploadVideoNode";
import CropImageNode from "@/components/workflow/nodes/crop-image/CropImageNode";
import ExtractFrameNode from "@/components/workflow/nodes/extract-frame/ExtractFrameNode";
import RunAnyLlmNode from "@/components/workflow/nodes/run-any-llm/RunAnyLlmNode";

export const workflowNodeTypes = {
  textNode: TextNode,
  uploadImageNode: UploadImageNode,
  uploadVideoNode: UploadVideoNode,
  cropImageNode: CropImageNode,
  extractFrameNode: ExtractFrameNode,
  runAnyLlmNode: RunAnyLlmNode,
};