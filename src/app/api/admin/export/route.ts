import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSuperAdminContext } from "@/lib/admin-auth"

function toCsv(headers: string[], rows: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  return [
    headers.map(escape).join(","),
    ...rows.map((row) => row.map(escape).join(",")),
  ].join("\n")
}

export async function GET(request: NextRequest) {
  const ctx = await getSuperAdminContext()
  if (!ctx) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const type = request.nextUrl.searchParams.get("type")

  if (type === "organizations") {
    const orgs = await db.organization.findMany({
      select: {
        name: true,
        slug: true,
        industry: true,
        createdAt: true,
        subscription: { select: { plan: true, status: true, billingCycle: true } },
        _count: { select: { members: { where: { isActive: true } }, documents: true, capas: true, incidents: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    const csv = toCsv(
      ["Name", "Slug", "Industry", "Plan", "Status", "Billing Cycle", "Members", "Documents", "CAPAs", "Incidents", "Created"],
      orgs.map((o) => [
        o.name,
        o.slug ?? "",
        o.industry ?? "",
        o.subscription?.plan ?? "None",
        o.subscription?.status ?? "None",
        o.subscription?.billingCycle ?? "",
        String(o._count.members),
        String(o._count.documents),
        String(o._count.capas),
        String(o._count.incidents),
        o.createdAt.toISOString().slice(0, 10),
      ])
    )

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="organizations-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  }

  if (type === "users") {
    const users = await db.user.findMany({
      select: {
        email: true,
        firstName: true,
        lastName: true,
        isSuperAdmin: true,
        lastLoginAt: true,
        createdAt: true,
        memberships: {
          where: { isActive: true },
          select: { role: true, organization: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const csv = toCsv(
      ["Email", "First Name", "Last Name", "Super Admin", "Organizations", "Roles", "Last Login", "Created"],
      users.map((u) => [
        u.email,
        u.firstName,
        u.lastName,
        u.isSuperAdmin ? "Yes" : "No",
        u.memberships.map((m) => m.organization.name).join("; "),
        u.memberships.map((m) => m.role).join("; "),
        u.lastLoginAt?.toISOString().slice(0, 10) ?? "Never",
        u.createdAt.toISOString().slice(0, 10),
      ])
    )

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="users-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  }

  if (type === "subscriptions") {
    const subs = await db.subscription.findMany({
      include: { organization: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })

    const csv = toCsv(
      ["Organization", "Plan", "Status", "Billing Cycle", "Trial Ends", "Period Start", "Period End", "Created"],
      subs.map((s) => [
        s.organization.name,
        s.plan,
        s.status,
        s.billingCycle,
        s.trialEndsAt?.toISOString().slice(0, 10) ?? "",
        s.currentPeriodStart.toISOString().slice(0, 10),
        s.currentPeriodEnd.toISOString().slice(0, 10),
        s.createdAt.toISOString().slice(0, 10),
      ])
    )

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="subscriptions-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    })
  }

  return NextResponse.json({ error: "Invalid type. Use: organizations, users, subscriptions" }, { status: 400 })
}
