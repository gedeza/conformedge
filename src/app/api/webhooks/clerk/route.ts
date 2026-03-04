import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Webhook } from "svix"
import { db } from "@/lib/db"
import { TRIAL_DURATION_DAYS, ONBOARDING_CREDITS } from "@/lib/billing/plans"

type WebhookEvent = {
  type: string
  data: Record<string, unknown>
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }

  const headerPayload = await headers()
  const svixId = headerPayload.get("svix-id")
  const svixTimestamp = headerPayload.get("svix-timestamp")
  const svixSignature = headerPayload.get("svix-signature")

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json(
      { error: "Missing svix headers" },
      { status: 400 }
    )
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    }) as WebhookEvent
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const eventType = evt.type

  if (eventType === "user.created" || eventType === "user.updated") {
    const {
      id,
      email_addresses,
      first_name,
      last_name,
      image_url,
    } = evt.data as {
      id: string
      email_addresses: { email_address: string }[]
      first_name: string | null
      last_name: string | null
      image_url: string | null
    }

    const primaryEmail = email_addresses?.[0]?.email_address

    if (primaryEmail) {
      await db.user.upsert({
        where: { clerkUserId: id },
        update: {
          email: primaryEmail,
          firstName: first_name || "",
          lastName: last_name || "",
          imageUrl: image_url,
          lastLoginAt: new Date(),
        },
        create: {
          clerkUserId: id,
          email: primaryEmail,
          firstName: first_name || "",
          lastName: last_name || "",
          imageUrl: image_url,
        },
      })
    }
  }

  if (
    eventType === "organization.created" ||
    eventType === "organization.updated"
  ) {
    const { id, name, slug } = evt.data as {
      id: string
      name: string
      slug: string
    }

    const org = await db.organization.upsert({
      where: { clerkOrgId: id },
      update: { name, slug },
      create: {
        clerkOrgId: id,
        name,
        slug,
      },
    })

    // Bootstrap billing on org creation (not update)
    if (eventType === "organization.created") {
      const now = new Date()
      const trialEnd = new Date(now)
      trialEnd.setDate(trialEnd.getDate() + TRIAL_DURATION_DAYS)

      // Period = trial duration for new orgs
      const periodStart = now
      const periodEnd = trialEnd

      await db.$transaction(async (tx) => {
        // 1. Create subscription (TRIALING)
        await tx.subscription.upsert({
          where: { organizationId: org.id },
          update: {},
          create: {
            organizationId: org.id,
            plan: "STARTER",
            status: "TRIALING",
            billingCycle: "MONTHLY",
            currentPeriodStart: periodStart,
            currentPeriodEnd: periodEnd,
            trialEndsAt: trialEnd,
          },
        })

        // 2. Create credit balance
        const creditBalance = await tx.creditBalance.upsert({
          where: { organizationId: org.id },
          update: {},
          create: {
            organizationId: org.id,
            balance: ONBOARDING_CREDITS,
            lifetimeEarned: ONBOARDING_CREDITS,
          },
        })

        // 3. Log onboarding credit grant
        await tx.creditTransaction.create({
          data: {
            type: "ADJUSTMENT",
            amount: ONBOARDING_CREDITS,
            balanceAfter: creditBalance.balance,
            description: "Onboarding bonus — expires with trial",
            organizationId: org.id,
          },
        })

        // 4. Create initial usage record
        await tx.usageRecord.upsert({
          where: {
            organizationId_periodStart: {
              organizationId: org.id,
              periodStart,
            },
          },
          update: {},
          create: {
            organizationId: org.id,
            periodStart,
            periodEnd,
            aiClassificationsUsed: 0,
            documentsCount: 0,
            usersCount: 0,
            standardsCount: 0,
          },
        })
      })
    }
  }

  if (eventType === "organizationMembership.created") {
    const { organization, public_user_data, role } = evt.data as {
      organization: { id: string }
      public_user_data: { user_id: string }
      role: string
    }

    const user = await db.user.findUnique({
      where: { clerkUserId: public_user_data.user_id },
    })
    const org = await db.organization.findUnique({
      where: { clerkOrgId: organization.id },
    })

    if (user && org) {
      // Check if OrganizationUser already exists (e.g. created by invitation accept flow with correct role)
      const existing = await db.organizationUser.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: org.id,
          },
        },
      })

      if (!existing) {
        // Only create if not already present — don't override invitation role
        const roleMap: Record<string, string> = {
          "org:admin": "ADMIN",
          "org:member": "VIEWER",
        }

        await db.organizationUser.create({
          data: {
            userId: user.id,
            organizationId: org.id,
            role: (roleMap[role] || "VIEWER") as "OWNER" | "ADMIN" | "MANAGER" | "AUDITOR" | "VIEWER",
          },
        })
      }
    }
  }

  return NextResponse.json({ received: true })
}
