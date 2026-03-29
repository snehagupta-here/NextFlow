import { defineConfig } from "@trigger.dev/sdk";
import { ffmpeg } from "@trigger.dev/build/extensions/core";

export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF!,
  maxDuration: 300,
  build: {
    extensions: [ffmpeg()],
    external: ["fluent-ffmpeg"],
  },
});