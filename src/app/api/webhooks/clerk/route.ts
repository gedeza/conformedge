import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { Webhook } from "svix"
import { db } from "@/lib/db"

type WebhookEvent = {
  type: string
  data: Record<string, unknown>
}

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
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

    await db.organization.upsert({
      where: { clerkOrgId: id },
      update: { name, slug },
      create: {
        clerkOrgId: id,
        name,
        slug,
      },
    })
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
      const roleMap: Record<string, string> = {
        "org:admin": "ADMIN",
        "org:member": "VIEWER",
      }

      await db.organizationUser.upsert({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: org.id,
          },
        },
        update: {
          role: (roleMap[role] || "VIEWER") as "OWNER" | "ADMIN" | "MANAGER" | "AUDITOR" | "VIEWER",
        },
        create: {
          userId: user.id,
          organizationId: org.id,
          role: (roleMap[role] || "VIEWER") as "OWNER" | "ADMIN" | "MANAGER" | "AUDITOR" | "VIEWER",
        },
      })
    }
  }

  return NextResponse.json({ received: true })
}
