import { notFound } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { ArrowLeft, FileDown, GraduationCap, Award, User, MapPin, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/shared/page-header"
import { getTrainingRecord } from "../actions"
import { TRAINING_CATEGORIES } from "../schema"
import { isR2Key } from "@/lib/r2-utils"

const STATUS_COLORS: Record<string, string> = {
  PLANNED: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  EXPIRED: "bg-red-100 text-red-800",
  REVOKED: "bg-gray-100 text-gray-800",
}

export default async function TrainingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const record = await getTrainingRecord(id)

  if (!record) notFound()

  const categoryLabel = TRAINING_CATEGORIES.find((c) => c.value === record.category)?.label ?? record.category

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/training">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      </div>

      <PageHeader heading={record.title} description={categoryLabel}>
        <Badge variant="outline" className={STATUS_COLORS[record.status] ?? ""}>
          {record.status}
        </Badge>
      </PageHeader>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Training Details */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Training Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Category</span>
                <p className="font-medium mt-1">{categoryLabel}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Training Date</span>
                <p className="font-medium mt-1">{format(record.trainingDate, "PPP")}</p>
              </div>
              {record.duration && (
                <div>
                  <span className="text-muted-foreground">Duration</span>
                  <p className="font-medium mt-1">{record.duration}</p>
                </div>
              )}
              {record.location && (
                <div>
                  <span className="text-muted-foreground">Location</span>
                  <p className="font-medium mt-1 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />{record.location}
                  </p>
                </div>
              )}
              {record.assessmentResult && (
                <div>
                  <span className="text-muted-foreground">Assessment Result</span>
                  <p className={`font-medium mt-1 ${record.assessmentResult === "Competent" ? "text-green-600" : "text-red-600"}`}>
                    {record.assessmentResult}
                  </p>
                </div>
              )}
              {record.site && (
                <div>
                  <span className="text-muted-foreground">Site</span>
                  <p className="font-medium mt-1 flex items-center gap-1">
                    <Building2 className="h-3 w-3" />{record.site.name} ({record.site.code})
                  </p>
                </div>
              )}
            </div>
            {record.description && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Description</span>
                <p className="mt-1 text-sm">{record.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trainee & Trainer */}
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <User className="h-4 w-4" />
              People
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Trainee</span>
                <p className="font-medium mt-1">{record.trainee.firstName} {record.trainee.lastName}</p>
                <p className="text-xs text-muted-foreground">{record.trainee.email}</p>
              </div>
              {record.trainerName && (
                <div>
                  <span className="text-muted-foreground">Trainer</span>
                  <p className="font-medium mt-1">{record.trainerName}</p>
                  {record.trainerAccreditation && (
                    <p className="text-xs text-muted-foreground">Accreditation: {record.trainerAccreditation}</p>
                  )}
                </div>
              )}
              {record.trainingProvider && (
                <div>
                  <span className="text-muted-foreground">Training Provider</span>
                  <p className="font-medium mt-1">{record.trainingProvider}</p>
                  {record.providerAccreditationNo && (
                    <p className="text-xs text-muted-foreground">Accreditation No: {record.providerAccreditationNo}</p>
                  )}
                </div>
              )}
              <div>
                <span className="text-muted-foreground">Recorded By</span>
                <p className="font-medium mt-1">{record.recordedBy.firstName} {record.recordedBy.lastName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Certificate */}
        <Card className="border-border/50 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Award className="h-4 w-4" />
              Certificate & Qualifications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              {record.certificateNumber && (
                <div>
                  <span className="text-muted-foreground">Certificate Number</span>
                  <p className="font-medium mt-1">{record.certificateNumber}</p>
                </div>
              )}
              {record.issuedDate && (
                <div>
                  <span className="text-muted-foreground">Issued Date</span>
                  <p className="font-medium mt-1">{format(record.issuedDate, "PPP")}</p>
                </div>
              )}
              {record.expiryDate && (
                <div>
                  <span className="text-muted-foreground">Expiry Date</span>
                  <p className={`font-medium mt-1 ${new Date(record.expiryDate) < new Date() ? "text-red-600" : ""}`}>
                    {format(record.expiryDate, "PPP")}
                  </p>
                </div>
              )}
              {record.saqaUnitStandard && (
                <div>
                  <span className="text-muted-foreground">SAQA Unit Standard</span>
                  <p className="font-medium mt-1">{record.saqaUnitStandard}</p>
                </div>
              )}
              {record.nqfLevel && (
                <div>
                  <span className="text-muted-foreground">NQF Level</span>
                  <p className="font-medium mt-1">Level {record.nqfLevel}</p>
                </div>
              )}
            </div>
            {record.certificateFileKey && isR2Key(record.certificateFileKey) && (
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" size="sm" asChild>
                  <a href={`/api/download/${record.certificateFileKey}`} target="_blank" rel="noopener noreferrer">
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Certificate ({record.certificateFileName ?? "file"})
                  </a>
                </Button>
              </div>
            )}
            {record.notes && (
              <div className="mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">Notes</span>
                <p className="mt-1 text-sm">{record.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
