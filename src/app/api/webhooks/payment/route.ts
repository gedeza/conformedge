import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { captureError } from "@/lib/error-tracking"

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY

/**
 * POST /api/webhooks/payment
 *
 * Paystack webhook endpoint — receives payment events.
 * Phase 6 will implement full event processing.
 *
 * Verifies signature via HMAC-SHA512 (Paystack standard).
 * Returns 200 immediately to acknowledge receipt.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get("x-paystack-signature")

    // Verify Paystack signature (skip in dev if secret not set)
    if (PAYSTACK_SECRET) {
      const hash = crypto
        .createHmac("sha512", PAYSTACK_SECRET)
        .update(body)
        .digest("hex")

      if (hash !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const event = JSON.parse(body) as {
      event: string
      data: Record<string, unknown>
    }

    // TODO Phase 6: Process payment events
    // - charge.success → activate subscription / grant credits
    // - charge.failed → set PAST_DUE + grace period
    // - subscription.create → confirm subscription
    // - subscription.disable → handle cancellation
    // - invoice.create / invoice.update → sync invoice records

    console.log(`[payment-webhook] Received event: ${event.event}`)

    return NextResponse.json({ received: true })
  } catch (error) {
    captureError(error, { source: "webhook.payment" })
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
