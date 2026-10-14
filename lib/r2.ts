import 'server-only'
import { randomUUID } from 'crypto'
import {
  DeleteObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_BYTES,
  extensionFor,
  validateImageUpload,
} from './upload-rules'

function config() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET
  const publicBase = process.env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, '')
  if (!accountId || !accessKeyId || !secretAccessKey || !bucket || !publicBase) {
    throw new Error(
      'R2 の環境変数（R2_ACCOUNT_ID / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY / R2_BUCKET / R2_PUBLIC_BASE_URL）が足りません'
    )
  }
  const client = new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  })
  return { client, bucket, publicBase }
}

/** 署名付き PUT URL を発行する。保存キーはサーバーが決める */
export async function createImageUploadUrl(input: {
  contentType: string
  size: number
  prefix: 'badges' | 'posts'
}) {
  const check = validateImageUpload(input.contentType, input.size)
  if (!check.ok) throw new Error(check.error)
  const { client, bucket, publicBase } = config()
  const key = `${input.prefix}/${randomUUID()}.${extensionFor(input.contentType)}`
  const url = await getSignedUrl(
    client,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: input.contentType,
      ContentLength: input.size,
    }),
    { expiresIn: 300, signableHeaders: new Set(['content-type', 'content-length']) }
  )
  return { url, key, publicUrl: `${publicBase}/${key}` }
}

/** アップロード後に、実際に置かれたオブジェクトの種類とサイズを確認する。合わなければ削除する */
export async function verifyUploadedImage(key: string) {
  if (!/^(badges|posts)\/[0-9a-f-]{36}\.(png|jpg|webp|svg)$/.test(key))
    throw new Error('不正なキーです')
  const { client, bucket, publicBase } = config()
  const head = await client.send(new HeadObjectCommand({ Bucket: bucket, Key: key }))
  const type = head.ContentType ?? ''
  const size = head.ContentLength ?? 0
  if (
    !ALLOWED_IMAGE_TYPES.includes(type as (typeof ALLOWED_IMAGE_TYPES)[number]) ||
    size > MAX_IMAGE_BYTES
  ) {
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }))
    throw new Error('アップロードされたファイルが条件（png/jpg/webp/svg・2MB以下）に合いません')
  }
  return { publicUrl: `${publicBase}/${key}` }
}

/** 画像の URL として保存してよいか（自分の R2 か、既存の /badges/ 配下のみ） */
export function isAllowedImageUrl(url: string) {
  const base = process.env.R2_PUBLIC_BASE_URL?.replace(/\/+$/, '')
  return url.startsWith('/badges/') || Boolean(base && url.startsWith(`${base}/`))
}
