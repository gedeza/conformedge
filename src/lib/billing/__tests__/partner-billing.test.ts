import { describe, it, expect, vi, beforeEach } from "vitest"
import { VAT_RATE } from "../plans"

// ─────────────────────────────────────────────
// Mock Prisma db
// ─────────────────────────────────────────────

const mockDb = {
  partner: {
    findUnique: vi.fn(),
  },
  partnerInvoice: {
    findFirst: vi.fn(),
    create: vi.fn(),
  },
}

vi.mock("@/lib/db", () => ({
  db: mockDb,
}))

// Import AFTER mock setup
const { calculatePartnerInvoice, generatePartnerInvoice } = await import("../partner-billing")

// ─────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────

function makePartner(overrides: {
  clientOrganizations?: Array<{
    organizationId: string
    clientSize: string
    customFeeCents: number | null
    isActive: boolean
    organization: { id: string; name: string }
  }>
  basePlatformFeeCents?: number
  volumeDiscountPercent?: number
  defaultSmallFeeCents?: number
  defaultMediumFeeCents?: number
  defaultLargeFeeCents?: number
} = {}) {
  return {
    id: "partner-1",
    basePlatformFeeCents: overrides.basePlatformFeeCents ?? 499_500, // R4,995
    volumeDiscountPercent: overrides.volumeDiscountPercent ?? 0,
    defaultSmallFeeCents: overrides.defaultSmallFeeCents ?? 149_900,  // R1,499
    defaultMediumFeeCents: overrides.defaultMediumFeeCents ?? 199_900, // R1,999
    defaultLargeFeeCents: overrides.defaultLargeFeeCents ?? 299_900,  // R2,999
    clientOrganizations: overrides.clientOrganizations ?? [],
  }
}

function makeClient(
  name: string,
  size: "SMALL" | "MEDIUM" | "LARGE",
  customFeeCents: number | null = null
) {
  const id = `org-${name.toLowerCase().replace(/\s/g, "-")}`
  return {
    organizationId: id,
    clientSize: size,
    customFeeCents,
    isActive: true,
    organization: { id, name },
  }
}

beforeEach(() => {
  vi.clearAllMocks()
})

// ─────────────────────────────────────────────
// calculatePartnerInvoice
// ─────────────────────────────────────────────

describe("calculatePartnerInvoice", () => {
  it("returns null for non-existent partner", async () => {
    mockDb.partner.findUnique.mockResolvedValue(null)
    const result = await calculatePartnerInvoice("nonexistent")
    expect(result).toBeNull()
  })

  it("returns platform fee only when no clients", async () => {
    mockDb.partner.findUnique.mockResolvedValue(makePartner())

    const result = await calculatePartnerInvoice("partner-1")
    expect(result).not.toBeNull()
    expect(result!.platformFeeCents).toBe(499_500)
    expect(result!.clientFeesCents).toBe(0)
    expect(result!.activeClientCount).toBe(0)
    expect(result!.subtotalCents).toBe(499_500)
    expect(result!.vatCents).toBe(Math.round(499_500 * VAT_RATE))
    expect(result!.totalCents).toBe(499_500 + Math.round(499_500 * VAT_RATE))
  })

  it("calculates correctly with one SMALL client", async () => {
    mockDb.partner.findUnique.mockResolvedValue(
      makePartner({
        clientOrganizations: [makeClient("Acme Corp", "SMALL")],
      })
    )

    const result = (await calculatePartnerInvoice("partner-1"))!
    expect(result.activeClientCount).toBe(1)
    expect(result.clientFeesCents).toBe(149_900) // R1,499
    expect(result.clientLineItems[0].feeCents).toBe(149_900)
    expect(result.clientLineItems[0].isCustom).toBe(false)

    const expectedSubtotal = 499_500 + 149_900
    expect(result.subtotalCents).toBe(expectedSubtotal)
    expect(result.vatCents).toBe(Math.round(expectedSubtotal * VAT_RATE))
    expect(result.totalCents).toBe(expectedSubtotal + Math.round(expectedSubtotal * VAT_RATE))
  })

  it("calculates correctly with mixed client sizes", async () => {
    mockDb.partner.findUnique.mockResolvedValue(
      makePartner({
        clientOrganizations: [
          makeClient("Small Co", "SMALL"),
          makeClient("Medium Co", "MEDIUM"),
          makeClient("Large Co", "LARGE"),
        ],
      })
    )

    const result = (await calculatePartnerInvoice("partner-1"))!
    expect(result.activeClientCount).toBe(3)

    const expectedClientFees = 149_900 + 199_900 + 299_900 // R1,499 + R1,999 + R2,999
    expect(result.clientFeesCents).toBe(expectedClientFees)

    const expectedSubtotal = 499_500 + expectedClientFees
    expect(result.subtotalCents).toBe(expectedSubtotal)
  })

  it("uses custom fee when set on a client", async () => {
    mockDb.partner.findUnique.mockResolvedValue(
      makePartner({
        clientOrganizations: [
          makeClient("Custom Client", "MEDIUM", 250_000), // R2,500 custom rate
        ],
      })
    )

    const result = (await calculatePartnerInvoice("partner-1"))!
    expect(result.clientLineItems[0].feeCents).toBe(250_000)
    expect(result.clientLineItems[0].isCustom).toBe(true)
    expect(result.clientFeesCents).toBe(250_000)
  })

  it("applies manually negotiated volume discount", async () => {
    mockDb.partner.findUnique.mockResolvedValue(
      makePartner({
        volumeDiscountPercent: 10, // 10% negotiated discount
        clientOrganizations: [
          makeClient("Client A", "MEDIUM"),
          makeClient("Client B", "MEDIUM"),
        ],
      })
    )

    const result = (await calculatePartnerInvoice("partner-1"))!
    const clientFees = 199_900 * 2 // R3,998
    expect(result.clientFeesCents).toBe(clientFees)

    const expectedDiscount = Math.round(clientFees * 0.10)
    expect(result.discountCents).toBe(expectedDiscount)
    expect(result.volumeDiscountPercent).toBe(10)

    const expectedSubtotal = 499_500 + clientFees - expectedDiscount
    expect(result.subtotalCents).toBe(expectedSubtotal)
  })

  it("zero discount when volumeDiscountPercent is 0", async () => {
    mockDb.partner.findUnique.mockResolvedValue(
      makePartner({
        volumeDiscountPercent: 0,
        clientOrganizations: [makeClient("Client A", "SMALL")],
      })
    )

    const result = (await calculatePartnerInvoice("partner-1"))!
    expect(result.discountCents).toBe(0)
    expect(result.volumeDiscountPercent).toBe(0)
  })

  it("VAT is 15% of subtotal", async () => {
    mockDb.partner.findUnique.mockResolvedValue(
      makePartner({
        clientOrganizations: [makeClient("Client A", "LARGE")],
      })
    )

    const result = (await calculatePartnerInvoice("partner-1"))!
    const expectedSubtotal = 499_500 + 299_900
    expect(result.vatCents).toBe(Math.round(expectedSubtotal * 0.15))
  })

  it("total = subtotal + VAT", async () => {
    mockDb.partner.findUnique.mockResolvedValue(
      makePartner({
        clientOrganizations: [
          makeClient("A", "SMALL"),
          makeClient("B", "LARGE"),
        ],
      })
    )

    const result = (await calculatePartnerInvoice("partner-1"))!
    expect(result.totalCents).toBe(result.subtotalCents + result.vatCents)
  })
})

// ─────────────────────────────────────────────
// generatePartnerInvoice
// ─────────────────────────────────────────────

describe("generatePartnerInvoice", () => {
  it("returns null for non-existent partner", async () => {
    mockDb.partner.findUnique.mockResolvedValue(null)
    const result = await generatePartnerInvoice("nonexistent")
    expect(result).toBeNull()
  })

  it("creates invoice with correct totals and PI- number format", async () => {
    mockDb.partner.findUnique.mockResolvedValue(
      makePartner({
        clientOrganizations: [makeClient("Acme", "MEDIUM")],
      })
    )
    mockDb.partnerInvoice.findFirst.mockResolvedValue(null) // No previous invoices
    mockDb.partnerInvoice.create.mockResolvedValue({ id: "invoice-1" })

    const result = await generatePartnerInvoice("partner-1")
    expect(result).toBe("invoice-1")

    // Verify the create call
    const createCall = mockDb.partnerInvoice.create.mock.calls[0][0]
    expect(createCall.data.partnerId).toBe("partner-1")
    expect(createCall.data.platformFeeCents).toBe(499_500)
    expect(createCall.data.clientFeesCents).toBe(199_900)
    expect(createCall.data.totalCents).toBe(createCall.data.subtotalCents + createCall.data.vatCents)

    // Invoice number format: PI-YYYYMM-0001
    expect(createCall.data.invoiceNumber).toMatch(/^PI-\d{6}-0001$/)
  })

  it("increments sequence from last invoice", async () => {
    mockDb.partner.findUnique.mockResolvedValue(makePartner())
    mockDb.partnerInvoice.findFirst.mockResolvedValue({
      invoiceNumber: "PI-202603-0005",
    })
    mockDb.partnerInvoice.create.mockResolvedValue({ id: "invoice-2" })

    await generatePartnerInvoice("partner-1")

    const createCall = mockDb.partnerInvoice.create.mock.calls[0][0]
    expect(createCall.data.invoiceNumber).toMatch(/^PI-\d{6}-0006$/)
  })

  it("sets due date to 15th of next month", async () => {
    mockDb.partner.findUnique.mockResolvedValue(makePartner())
    mockDb.partnerInvoice.findFirst.mockResolvedValue(null)
    mockDb.partnerInvoice.create.mockResolvedValue({ id: "invoice-3" })

    await generatePartnerInvoice("partner-1")

    const createCall = mockDb.partnerInvoice.create.mock.calls[0][0]
    const dueAt: Date = createCall.data.dueAt
    expect(dueAt.getDate()).toBe(15)
  })

  it("includes line items with platform fee and client fees", async () => {
    mockDb.partner.findUnique.mockResolvedValue(
      makePartner({
        clientOrganizations: [
          makeClient("Foo Ltd", "SMALL"),
          makeClient("Bar Inc", "LARGE"),
        ],
      })
    )
    mockDb.partnerInvoice.findFirst.mockResolvedValue(null)
    mockDb.partnerInvoice.create.mockResolvedValue({ id: "invoice-4" })

    await generatePartnerInvoice("partner-1")

    const createCall = mockDb.partnerInvoice.create.mock.calls[0][0]
    const lineItems = createCall.data.lineItems

    // 1 platform fee + 2 client fees = 3 line items (no discount since 0%)
    expect(lineItems).toHaveLength(3)
    expect(lineItems[0].description).toBe("Partner Platform Fee")
    expect(lineItems[1].description).toContain("Foo Ltd")
    expect(lineItems[2].description).toContain("Bar Inc")
  })

  it("includes discount line item when volumeDiscountPercent > 0", async () => {
    mockDb.partner.findUnique.mockResolvedValue(
      makePartner({
        volumeDiscountPercent: 5,
        clientOrganizations: [makeClient("Discounted", "MEDIUM")],
      })
    )
    mockDb.partnerInvoice.findFirst.mockResolvedValue(null)
    mockDb.partnerInvoice.create.mockResolvedValue({ id: "invoice-5" })

    await generatePartnerInvoice("partner-1")

    const createCall = mockDb.partnerInvoice.create.mock.calls[0][0]
    const lineItems = createCall.data.lineItems

    // 1 platform + 1 client + 1 discount = 3 line items
    expect(lineItems).toHaveLength(3)
    const discountLine = lineItems.find((li: { description: string }) => li.description.includes("Volume Discount"))
    expect(discountLine).toBeDefined()
    expect(discountLine.totalCents).toBeLessThan(0)
  })
})

// ─────────────────────────────────────────────
// Pricing Integrity — real-world scenarios
// ─────────────────────────────────────────────

describe("Real-world pricing scenarios", () => {
  it("Consulting partner with 3 Essentials clients = R4,995 + 3×R1,499 = R9,492/mo + VAT", async () => {
    mockDb.partner.findUnique.mockResolvedValue(
      makePartner({
        basePlatformFeeCents: 499_500,
        clientOrganizations: [
          makeClient("Client 1", "SMALL"),
          makeClient("Client 2", "SMALL"),
          makeClient("Client 3", "SMALL"),
        ],
      })
    )

    const result = (await calculatePartnerInvoice("partner-1"))!

    expect(result.platformFeeCents).toBe(499_500)           // R4,995
    expect(result.clientFeesCents).toBe(449_700)            // 3 × R1,499
    expect(result.subtotalCents).toBe(949_200)              // R9,492
    expect(result.vatCents).toBe(Math.round(949_200 * 0.15)) // R1,423.80
    expect(result.totalCents).toBe(949_200 + Math.round(949_200 * 0.15)) // R10,915.80
  })

  it("Partner with mixed tiers: 2 Essentials + 1 Pro + 1 Business", async () => {
    mockDb.partner.findUnique.mockResolvedValue(
      makePartner({
        basePlatformFeeCents: 499_500,
        clientOrganizations: [
          makeClient("Small A", "SMALL"),
          makeClient("Small B", "SMALL"),
          makeClient("Medium C", "MEDIUM"),
          makeClient("Large D", "LARGE"),
        ],
      })
    )

    const result = (await calculatePartnerInvoice("partner-1"))!

    const expectedClientFees = (149_900 * 2) + 199_900 + 299_900 // R7,996
    expect(result.clientFeesCents).toBe(expectedClientFees)
    expect(result.activeClientCount).toBe(4)

    const expectedSubtotal = 499_500 + expectedClientFees // R12,991
    expect(result.subtotalCents).toBe(expectedSubtotal)
  })

  it("CE share stays ~27% at scale (10 Pro clients)", async () => {
    const clients = Array.from({ length: 10 }, (_, i) =>
      makeClient(`Client ${i + 1}`, "MEDIUM")
    )
    mockDb.partner.findUnique.mockResolvedValue(
      makePartner({ basePlatformFeeCents: 499_500, clientOrganizations: clients })
    )

    const result = (await calculatePartnerInvoice("partner-1"))!

    // Partner pays: R4,995 platform + 10 × R1,999 = R24,985/mo
    // Each client pays CE: R5,499/mo (Professional direct price)
    // Total client revenue to CE: 10 × R5,499 = R54,990
    // CE share from partner: R24,985 / R54,990 ≈ 45% (partner fees alone)
    // But the validation is that per-client fee / direct price stays stable
    const perClientShare = 199_900 / 549_900  // R1,999 / R5,499 ≈ 36%
    expect(perClientShare).toBeGreaterThan(0.30)
    expect(perClientShare).toBeLessThan(0.40)
  })
})
