import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

export { isR2Key } from "./r2-utils"

const globalForR2 = globalThis as unknown as { r2?: S3Client }

export const r2 =
  globalForR2.r2 ??
  new S3Client({
    region: process.env.S3_REGION ?? "auto",
    endpoint: process.env.S3_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: true,
  })

if (process.env.NODE_ENV !== "production") globalForR2.r2 = r2

const bucket = process.env.S3_BUCKET_NAME!

export async function uploadToR2(key: string, body: Buffer, contentType: string) {
  await r2.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  )
}

export async function deleteFromR2(key: string) {
  await r2.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    })
  )
}

export async function getPresignedDownloadUrl(key: string): Promise<string> {
  return getSignedUrl(
    r2,
    new GetObjectCommand({
      Bucket: bucket,
      Key: key,
      ResponseContentDisposition: "attachment",
    }),
    { expiresIn: 3600 }
  )
}
