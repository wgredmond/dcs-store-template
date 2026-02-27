import { NextRequest, NextResponse } from "next/server";
import { verifySignature } from "@/lib/decomm/webhooks";

// ─── Webhook event shape ──────────────────────────────────────────────────────

interface WebhookEvent {
  id: string;
  type: "payment_confirmed" | "payment_failed" | "payment_expired";
  created: number;
  data: Record<string, unknown>;
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  // 1. Validate configuration ─────────────────────────────────────────────────
  const secret = process.env.DECOMM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[webhook] DECOMM_WEBHOOK_SECRET is not set — run: npm run register:webhook");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  // 2. Read the RAW body BEFORE parsing ───────────────────────────────────────
  //
  //    ⚠️  IMPORTANT: Do NOT call req.json() here.
  //    Signature verification must happen on the exact bytes sent by the server.
  //    Parsing JSON first (even read-back via JSON.stringify) can alter whitespace
  //    and break the HMAC. This is the #1 gotcha when moving from Stripe webhooks.
  //
  const rawBody = await req.text();

  // 3. Verify the signature ───────────────────────────────────────────────────
  const sigHeader = req.headers.get("x-decomm-signature") ?? "";
  try {
    verifySignature(rawBody, sigHeader, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Bad signature";
    console.warn("[webhook] Signature verification failed:", message);
    return NextResponse.json({ error: message }, { status: 400 });
  }

  // 4. Parse the event (safe now that signature is verified) ──────────────────
  let event: WebhookEvent;
  try {
    event = JSON.parse(rawBody) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 5. Handle event types ─────────────────────────────────────────────────────
  //
  //    Return 200 immediately — don't await slow operations (fulfillment, email,
  //    DB writes). Push those to a background queue so dcs-runtime doesn't
  //    time out and retry unnecessarily.
  //
  switch (event.type) {
    case "payment_confirmed": {
      console.log("[webhook] payment_confirmed", event.id, event.data);

      // TODO: trigger fulfillment / send confirmation email, e.g.:
      //   await queue.enqueue('fulfillment', { orderId: event.data.orderId });
      //   await queue.enqueue('email:confirm', { to: event.data.customerEmail });

      break;
    }

    case "payment_failed": {
      console.log("[webhook] payment_failed", event.id, event.data);

      // TODO: notify the customer, release inventory reservation, e.g.:
      //   await queue.enqueue('email:failed', { to: event.data.customerEmail });

      break;
    }

    case "payment_expired": {
      console.log("[webhook] payment_expired", event.id, event.data);

      // TODO: release inventory reservation, e.g.:
      //   await queue.enqueue('inventory:release', { items: event.data.items });

      break;
    }

    default: {
      // Unknown event type — log and ignore. dcs-runtime may add event types
      // in future versions; unrecognised types should not cause a 4xx.
      const unknownType = (event as WebhookEvent).type;
      console.log("[webhook] unhandled event type:", unknownType);
    }
  }

  // 6. Acknowledge receipt ─────────────────────────────────────────────────────
  //    dcs-runtime retries on non-2xx. Return 200 quickly; do real work async.
  return NextResponse.json({ received: true });
}
