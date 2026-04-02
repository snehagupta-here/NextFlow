import {
  logger,
  task
} from "../../../chunk-EL726SIR.mjs";
import "../../../chunk-RA6RHLTU.mjs";
import {
  __name,
  init_esm
} from "../../../chunk-NKKWNCEX.mjs";

// src/trigger/extract-frame.ts
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
function parsePercentTimestamp(value) {
  const trimmed = value.trim();
  return trimmed.endsWith("%");
}
__name(parsePercentTimestamp, "parsePercentTimestamp");
function clampPercent(value) {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}
__name(clampPercent, "clampPercent");
function getVideoDuration(videoPath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format?.duration ?? 0);
    });
  });
}
__name(getVideoDuration, "getVideoDuration");
var extractFrameTask = task({
  id: "extract-frame-task",
  run: /* @__PURE__ */ __name(async (payload) => {
    const videoUrl = String(payload.videoUrl).replace(/\s+/g, "").trim();
    const timestampInput = String(payload.timestamp ?? "0").trim() || "0";
    try {
      new URL(videoUrl);
    } catch {
      throw new Error("Invalid source video URL.");
    }
    const tempDir = os.tmpdir();
    const inputPath = path.join(tempDir, `video-${Date.now()}.mp4`);
    const outputPath = path.join(tempDir, `frame-${Date.now()}.png`);
    logger.log("Starting extract frame", { videoUrl, timestampInput });
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch source video.");
    }
    const arrayBuffer = await response.arrayBuffer();
    await fs.writeFile(inputPath, Buffer.from(arrayBuffer));
    let timestampSeconds = 0;
    if (parsePercentTimestamp(timestampInput)) {
      const percent = clampPercent(Number(timestampInput.replace("%", "")));
      const duration = await getVideoDuration(inputPath);
      timestampSeconds = duration * percent / 100;
    } else {
      const numeric = Number(timestampInput);
      if (Number.isNaN(numeric) || numeric < 0) {
        throw new Error("Invalid timestamp. Use seconds or percentage like 50%.");
      }
      timestampSeconds = numeric;
    }
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath).seekInput(timestampSeconds).frames(1).outputOptions(["-q:v 2"]).output(outputPath).on("end", () => resolve()).on("error", (err) => reject(err)).run();
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
      "frame-image.png"
    );
    const uploadResponse = await fetch("https://api2.transloadit.com/assemblies", {
      method: "POST",
      body: formData
    });
    if (!uploadResponse.ok) {
      const text = await uploadResponse.text();
      throw new Error(text || "Failed to upload extracted frame to Transloadit.");
    }
    const assembly = await uploadResponse.json();
    const frameImageUrl = extractResultUrl(assembly);
    await fs.unlink(inputPath).catch(() => void 0);
    await fs.unlink(outputPath).catch(() => void 0);
    if (!frameImageUrl) {
      throw new Error("Frame extracted, but no image URL was returned.");
    }
    return {
      frameImageUrl,
      assemblyId: assembly.assembly_id ?? ""
    };
  }, "run")
});
export {
  extractFrameTask
};
//# sourceMappingURL=extract-frame.mjs.map
