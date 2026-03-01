"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod/v4"
import { db } from "@/lib/db"
import { getAuthContext } from "@/lib/auth"
import { logAuditEvent } from "@/lib/audit"
import { canManageOrg } from "@/lib/permissions"
import type { ActionResult } from "@/types"

const stepSchema = z.object({
  stepOrder: z.number().int().min(1),
  role: z.enum(["MANAGER", "ADMIN", "OWNER"]),
  label: z.string().min(1).max(100),
})

const templateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  steps: z.array(stepSchema).min(1, "At least one approval step is required"),
  isDefault: z.boolean().default(false),
})

export type WorkflowTemplateFormValues = z.infer<typeof templateSchema>

export type WorkflowTemplate = {
  id: string
  name: string
  description: string | null
  steps: unknown
  isDefault: boolean
  createdAt: Date
  createdBy: { id: string; firstName: string; lastName: string }
}

export async function getWorkflowTemplates(): Promise<WorkflowTemplate[]> {
  const { dbOrgId } = await getAuthContext()

  return db.approvalWorkflowTemplate.findMany({
    where: { organizationId: dbOrgId },
    include: {
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  })
}

export async function createWorkflowTemplate(
  values: WorkflowTemplateFormValues
): Promise<ActionResult<{ id: string }>> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canManageOrg(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = templateSchema.parse(values)

    // If this is marked as default, unmark others
    if (parsed.isDefault) {
      await db.approvalWorkflowTemplate.updateMany({
        where: { organizationId: dbOrgId, isDefault: true },
        data: { isDefault: false },
      })
    }

    const template = await db.approvalWorkflowTemplate.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        steps: parsed.steps as unknown as import("@/generated/prisma/client").Prisma.InputJsonValue,
        isDefault: parsed.isDefault,
        organizationId: dbOrgId,
        createdById: dbUserId,
      },
    })

    logAuditEvent({
      action: "CREATE",
      entityType: "ApprovalWorkflowTemplate",
      entityId: template.id,
      metadata: { name: parsed.name, stepCount: parsed.steps.length },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/settings")
    return { success: true, data: { id: template.id } }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to create template" }
  }
}

export async function updateWorkflowTemplate(
  id: string,
  values: WorkflowTemplateFormValues
): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canManageOrg(role)) return { success: false, error: "Insufficient permissions" }
    const parsed = templateSchema.parse(values)

    const existing = await db.approvalWorkflowTemplate.findFirst({
      where: { id, organizationId: dbOrgId },
    })
    if (!existing) return { success: false, error: "Template not found" }

    if (parsed.isDefault) {
      await db.approvalWorkflowTemplate.updateMany({
        where: { organizationId: dbOrgId, isDefault: true, id: { not: id } },
        data: { isDefault: false },
      })
    }

    await db.approvalWorkflowTemplate.update({
      where: { id },
      data: {
        name: parsed.name,
        description: parsed.description,
        steps: parsed.steps as unknown as import("@/generated/prisma/client").Prisma.InputJsonValue,
        isDefault: parsed.isDefault,
      },
    })

    logAuditEvent({
      action: "UPDATE",
      entityType: "ApprovalWorkflowTemplate",
      entityId: id,
      metadata: { name: parsed.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to update template" }
  }
}

export async function deleteWorkflowTemplate(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canManageOrg(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.approvalWorkflowTemplate.findFirst({
      where: { id, organizationId: dbOrgId },
    })
    if (!existing) return { success: false, error: "Template not found" }

    await db.approvalWorkflowTemplate.delete({ where: { id } })

    logAuditEvent({
      action: "DELETE",
      entityType: "ApprovalWorkflowTemplate",
      entityId: id,
      metadata: { name: existing.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to delete template" }
  }
}

export async function setDefaultWorkflowTemplate(id: string): Promise<ActionResult> {
  try {
    const { dbUserId, dbOrgId, role } = await getAuthContext()
    if (!canManageOrg(role)) return { success: false, error: "Insufficient permissions" }

    const existing = await db.approvalWorkflowTemplate.findFirst({
      where: { id, organizationId: dbOrgId },
    })
    if (!existing) return { success: false, error: "Template not found" }

    await db.$transaction([
      db.approvalWorkflowTemplate.updateMany({
        where: { organizationId: dbOrgId, isDefault: true },
        data: { isDefault: false },
      }),
      db.approvalWorkflowTemplate.update({
        where: { id },
        data: { isDefault: true },
      }),
    ])

    logAuditEvent({
      action: "SET_DEFAULT",
      entityType: "ApprovalWorkflowTemplate",
      entityId: id,
      metadata: { name: existing.name },
      userId: dbUserId,
      organizationId: dbOrgId,
    })

    revalidatePath("/settings")
    return { success: true }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : "Failed to set default template" }
  }
}
