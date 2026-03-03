/**
 * One-time webhook registration script.
 *
 * Usage:
 *   npm run register:webhook
 *
 * Reads from .env.local:
 *   WALLEYONE_URL          — base URL of your walleyeone instance
 *   WALLEYONE_API_KEY      — wl_test_sk_... API key for your storefront environment
 *   NEXT_PUBLIC_BASE_URL   — public URL of this store (used to construct the webhook endpoint)
 *
 * On success, prints the `whsec_` signing secret.
 * Add it to .env.local as:
 *   DECOMM_WEBHOOK_SECRET=whsec_...
 */

import fs from "fs";
import path from "path";

// ─── Load .env.local ──────────────────────────────────────────────────────────

function loadEnv(): Record<string, string> {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (!fs.existsSync(envPath)) {
    console.error("Error: .env.local not found. Copy .env.example to .env.local and fill in values.");
    process.exit(1);
  }

  const env: Record<string, string> = {};
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
    env[key] = val;
  }
  return env;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const env = loadEnv();

  const runtimeUrl = env["WALLEYONE_URL"];
  const apiKey = env["WALLEYONE_API_KEY"];
  const baseUrl = env["NEXT_PUBLIC_BASE_URL"];

  if (!runtimeUrl) {
    console.error("Error: WALLEYONE_URL is not set in .env.local");
    process.exit(1);
  }
  if (!apiKey) {
    console.error("Error: WALLEYONE_API_KEY is not set in .env.local");
    process.exit(1);
  }
  if (!baseUrl) {
    console.error("Error: NEXT_PUBLIC_BASE_URL is not set in .env.local");
    process.exit(1);
  }

  const webhookUrl = `${baseUrl}/api/webhooks/dcs`;
  const events = ["payment_confirmed", "payment_failed", "payment_expired"];

  // walleyeone enforces https:// for webhook URLs to prevent plaintext secret
  // transmission. For local development, use a tunnel tool to get a public HTTPS URL:
  //   ngrok:              ngrok http 3009
  //   Cloudflare Tunnel:  cloudflared tunnel --url http://localhost:3009
  // Then set NEXT_PUBLIC_BASE_URL to the tunnel URL in .env.local before running this script.
  if (!webhookUrl.startsWith("https://")) {
    console.error("Error: NEXT_PUBLIC_BASE_URL must be an https:// URL.");
    console.error("  Webhook URL:", webhookUrl);
    console.error();
    console.error("For local development, expose your store via a tunnel first:");
    console.error("  ngrok:              ngrok http 3009");
    console.error("  Cloudflare Tunnel:  cloudflared tunnel --url http://localhost:3009");
    console.error();
    console.error("Set NEXT_PUBLIC_BASE_URL to the tunnel URL and re-run.");
    process.exit(1);
  }

  console.log("Registering webhook...");
  console.log("  Runtime:", runtimeUrl);
  console.log("  URL:    ", webhookUrl);
  console.log("  Events: ", events.join(", "));
  console.log();

  const res = await fetch(`${runtimeUrl}/api/v1/webhooks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ url: webhookUrl, events }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Error: walleyeone returned ${res.status}`);
    console.error(text);
    process.exit(1);
  }

  const data = (await res.json()) as { secret?: string; id?: string };

  if (!data.secret) {
    console.error("Error: walleyeone response did not include a secret:", data);
    process.exit(1);
  }

  console.log("Webhook registered successfully!");
  console.log("  ID:    ", data.id ?? "(not returned)");
  console.log("  Secret:", data.secret);
  console.log();
  console.log("Add the following to your .env.local:");
  console.log();
  console.log(`  DECOMM_WEBHOOK_SECRET=${data.secret}`);
  console.log();
  console.log("Then restart your dev server.");
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
