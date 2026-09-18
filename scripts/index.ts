import { config as loadEnv } from "dotenv";
import {
  AuthenticationError,
  NotEnoughCreditsError,
} from "@higgsfield/client";
import { config, higgsfield } from "@higgsfield/client/v2";

loadEnv({ path: ".env.local" });

const MODEL = "bytedance/seedance-2.5/text-to-video";

async function main() {
  const credentials = process.env.HF_CREDENTIALS;
  if (!credentials) {
    console.error(
      "Missing HF_CREDENTIALS. Set it in .env.local as HF_CREDENTIALS=<key-id>:<key-secret>.",
    );
    process.exitCode = 1;
    return;
  }

  config({ credentials });

  console.log(`Submitting ${MODEL} generation request...`);

  const result = await higgsfield.subscribe(MODEL, {
    input: {
      prompt: "A cinematic scene at sunset",
      duration: 5,
      resolution: "720p",
      aspect_ratio: "16:9",
    },
    withPolling: true,
  });

  if (result.status !== "completed") {
    console.error(
      `Generation did not complete successfully. Status: ${result.status}`,
      result,
    );
    process.exitCode = 1;
    return;
  }

  const url = result.video?.url;
  if (!url) {
    console.error("Job reported completed but no video URL was returned.", result);
    process.exitCode = 1;
    return;
  }

  console.log("Video generated successfully.");
  console.log(url);
}

main().catch((error) => {
  if (error instanceof AuthenticationError) {
    console.error(
      "Authentication failed — check HF_CREDENTIALS in .env.local.",
    );
  } else if (error instanceof NotEnoughCreditsError) {
    console.error("Insufficient Higgsfield account credits for this request.");
  } else {
    console.error("Unexpected error while generating video:", error);
  }
  process.exitCode = 1;
});
