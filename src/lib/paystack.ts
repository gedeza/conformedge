/**
 * Paystack Server-Side API Helpers
 *
 * All amounts in kobo (ZAR cents). Paystack uses the same convention.
 * Docs: https://paystack.com/docs/api/
 */

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY
const PAYSTACK_BASE = "https://api.paystack.co"

interface PaystackResponse<T> {
  status: boolean
  message: string
  data: T
}

async function paystackFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<PaystackResponse<T>> {
  if (!PAYSTACK_SECRET) {
    throw new Error("PAYSTACK_SECRET_KEY is not configured")
  }

  const res = await fetch(`${PAYSTACK_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Paystack API error (${res.status}): ${body}`)
  }

  return res.json()
}

// ─────────────────────────────────────────────
// Transactions (one-time payments — credit packs)
// ─────────────────────────────────────────────

export interface InitializeTransactionInput {
  email: string
  amount: number // in cents/kobo
  reference: string
  metadata?: Record<string, unknown>
  callbackUrl?: string
}

interface InitializeTransactionData {
  authorization_url: string
  access_code: string
  reference: string
}

export async function initializeTransaction(
  input: InitializeTransactionInput
): Promise<InitializeTransactionData> {
  const res = await paystackFetch<InitializeTransactionData>("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: input.email,
      amount: input.amount,
      reference: input.reference,
      metadata: input.metadata,
      callback_url: input.callbackUrl,
    }),
  })
  return res.data
}

interface VerifyTransactionData {
  id: number
  status: string // "success" | "failed" | "abandoned"
  reference: string
  amount: number
  currency: string
  channel: string
  paid_at: string
  customer: { email: string; id: number }
  metadata: Record<string, unknown>
}

export async function verifyTransaction(
  reference: string
): Promise<VerifyTransactionData> {
  const res = await paystackFetch<VerifyTransactionData>(
    `/transaction/verify/${encodeURIComponent(reference)}`
  )
  return res.data
}

// ─────────────────────────────────────────────
// Plans (recurring subscriptions)
// ─────────────────────────────────────────────

export interface CreatePlanInput {
  name: string
  amount: number // in cents/kobo
  interval: "monthly" | "annually"
  description?: string
}

interface PlanData {
  id: number
  plan_code: string
  name: string
  amount: number
  interval: string
}

export async function createPlan(input: CreatePlanInput): Promise<PlanData> {
  const res = await paystackFetch<PlanData>("/plan", {
    method: "POST",
    body: JSON.stringify({
      name: input.name,
      amount: input.amount,
      interval: input.interval,
      description: input.description,
      currency: "ZAR",
    }),
  })
  return res.data
}

export async function listPlans(): Promise<PlanData[]> {
  const res = await paystackFetch<PlanData[]>("/plan?currency=ZAR")
  return res.data
}

// ─────────────────────────────────────────────
// Subscriptions
// ─────────────────────────────────────────────

export interface CreateSubscriptionInput {
  customer: string // email or customer code
  plan: string // plan code
  startDate?: string // ISO date
}

interface SubscriptionData {
  id: number
  subscription_code: string
  email_token: string
  status: string
  plan: { plan_code: string }
}

export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<SubscriptionData> {
  const res = await paystackFetch<SubscriptionData>("/subscription", {
    method: "POST",
    body: JSON.stringify({
      customer: input.customer,
      plan: input.plan,
      start_date: input.startDate,
    }),
  })
  return res.data
}

export async function disableSubscription(
  code: string,
  emailToken: string
): Promise<void> {
  await paystackFetch("/subscription/disable", {
    method: "POST",
    body: JSON.stringify({ code, token: emailToken }),
  })
}

// ─────────────────────────────────────────────
// Customers
// ─────────────────────────────────────────────

interface CustomerData {
  id: number
  customer_code: string
  email: string
  first_name: string | null
  last_name: string | null
}

export async function createOrFetchCustomer(
  email: string,
  firstName?: string,
  lastName?: string
): Promise<CustomerData> {
  try {
    const res = await paystackFetch<CustomerData>("/customer", {
      method: "POST",
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
      }),
    })
    return res.data
  } catch {
    // Customer may already exist — fetch by email
    const res = await paystackFetch<CustomerData>(
      `/customer/${encodeURIComponent(email)}`
    )
    return res.data
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

/** Generate a unique reference for a transaction */
export function generateReference(prefix: string): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return `${prefix}_${timestamp}_${random}`
}
