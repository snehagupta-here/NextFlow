import {
  logger,
  task
} from "../../../chunk-EL726SIR.mjs";
import "../../../chunk-RA6RHLTU.mjs";
import {
  __name,
  init_esm
} from "../../../chunk-NKKWNCEX.mjs";

// src/trigger/crop-image.ts
init_esm();
import ffmpeg from "fluent-ffmpeg";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
if (process.env.FFMPEG_PATH) {
  ffmpeg.setFfmpegPath(process.env.FFMPEG_PATH);
}
if (process.env.FFPROBE_PATH) {
  ffmpeg.setFfprobePath(process.env.FFPROBE_PATH);
}
function clampPercent(value, fallback) {
  if (Number.isNaN(value)) return fallback;
  return Math.min(100, Math.max(0, value));
}
__name(clampPercent, "clampPercent");
function getCropFilter(x, y, width, height) {
  return `crop=iw*${width}/100:ih*${height}/100:iw*${x}/100:ih*${y}/100`;
}
__name(getCropFilter, "getCropFilter");
function extractResultUrl(data) {
  const resultGroups = data.results ? Object.values(data.results) : [];
  for (const group of resultGroups) {
    if (Array.isArray(group) && group.length > 0) {
      const first = group[0];
      if (first?.ssl_url) return first.ssl_url;
      if (first?.url) return first.url;
    }
  }
  const upload = data.uploads?.[0];
  if (upload?.ssl_url) return upload.ssl_url;
  if (upload?.url) return upload.url;
  return "";
}
__name(extractResultUrl, "extractResultUrl");
var cropImageTask = task({
  id: "crop-image-task",
  run: /* @__PURE__ */ __name(async (payload) => {
    const imageUrl = payload.imageUrl;
    const x = clampPercent(payload.x, 0);
    const y = clampPercent(payload.y, 0);
    const width = clampPercent(payload.width, 100);
    const height = clampPercent(payload.height, 100);
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `source-${Date.now()}.png`);
    const outputPath = path.join(tempDir, `cropped-${Date.now()}.png`);
    logger.log("Starting image crop", { imageUrl, x, y, width, height });
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch source image.");
    }
    const arrayBuffer = await response.arrayBuffer();
    await fs.writeFile(inputPath, Buffer.from(arrayBuffer));
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath).outputOptions(["-vf", getCropFilter(x, y, width, height)]).output(outputPath).on("end", () => resolve()).on("error", (err) => reject(err)).run();
    });
    const fileBuffer = await fs.readFile(outputPath);
    const authKey = process.env.TRANSLOADIT_AUTH_KEY;
    const authSecret = process.env.TRANSLOADIT_AUTH_SECRET;
    const templateId = process.env.TRANSLOADIT_TEMPLATE_ID;
    if (!authKey || !authSecret || !templateId) {
      throw new Error("Missing Transloadit environment variables.");
    }
    const params = {
      auth: {
        key: authKey,
        expires: new Date(Date.now() + 60 * 60 * 1e3).toISOString()
      },
      template_id: templateId
    };
    const paramsString = JSON.stringify(params);
    const signature = "sha384:" + crypto.createHmac("sha384", authSecret).update(paramsString).digest("hex");
    const formData = new FormData();
    formData.append("params", paramsString);
    formData.append("signature", signature);
    formData.append(
      "file",
      new Blob([fileBuffer], { type: "image/png" }),
      "cropped-image.png"
    );
    const uploadResponse = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      body: formData
    });
    if (!uploadResponse.ok) {
      const text = await uploadResponse.text();
      throw new Error(text || "Failed to upload cropped image to Transloadit.");
    }
    const assembly = await uploadResponse.json();
    const croppedImageUrl = extractResultUrl(assembly);
    await fs.unlink(inputPath).catch(() => void 0);
    await fs.unlink(outputPath).catch(() => void 0);
    if (!croppedImageUrl) {
      throw new Error("Cropped image uploaded, but no URL was returned.");
    }
    return {
      croppedImageUrl,
      assemblyId: assembly.assembly_id ?? ""
    };
  }, "run")
});
export {
  cropImageTask
};
//# sourceMappingURL=crop-image.mjs.map
