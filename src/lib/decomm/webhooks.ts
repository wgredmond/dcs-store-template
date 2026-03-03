// Vendored from walleyeone — replace with:
//   import { verifySignature } from '@decomm/webhooks'
// once the npm package is published.
//
// Signature format: X-Decomm-Signature: t={unix},v1={hmac-sha256-hex}
// This is intentionally identical to Stripe's webhook signature scheme.

import { createHmac, timingSafeEqual } from "crypto";

/** Replay-window tolerance in seconds (matches Stripe's 5-min window). */
const TOLERANCE_SECONDS = 300;

function extractKey(secret: string): Buffer {
  // secret is "whsec_<base64url>" — strip the prefix and decode
  const b64 = secret.slice(6);
  return Buffer.from(b64, "base64url");
}

/**
 * Verify an `X-Decomm-Signature` header value.
 *
 * Throws on:
 *   - Missing or invalid timestamp
 *   - Timestamp outside the 5-minute replay window
 *   - Signature mismatch
 *
 * Uses `timingSafeEqual` to prevent timing-oracle attacks.
 * Accepts multiple `v1=` values to support secret rotation.
 */
export function verifySignature(rawBody: string, header: string, secret: string): void {
  const parts = header.split(",");

  const tPart = parts.find((p) => p.startsWith("t="));
  if (!tPart) throw new Error("Missing timestamp in X-Decomm-Signature header");

  const ts = parseInt(tPart.slice(2), 10);
  if (!Number.isFinite(ts)) throw new Error("Invalid timestamp in X-Decomm-Signature header");

  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > TOLERANCE_SECONDS) {
    throw new Error(`Signature timestamp outside ${TOLERANCE_SECONDS}s tolerance window`);
  }

  const v1Parts = parts.filter((p) => p.startsWith("v1=")).map((p) => p.slice(3));
  if (v1Parts.length === 0) throw new Error("Missing v1 signature in X-Decomm-Signature header");

  const key = extractKey(secret);
  const expected = createHmac("sha256", key)
    .update(`${ts}.${rawBody}`)
    .digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");

  const matched = v1Parts.some((v1) => {
    try {
      const actual = Buffer.from(v1, "hex");
      if (actual.length !== expectedBuf.length) return false;
      return timingSafeEqual(actual, expectedBuf);
    } catch {
      return false;
    }
  });

  if (!matched) throw new Error("Signature verification failed");
}
