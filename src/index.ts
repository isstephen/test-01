import { Context } from "aws-lambda";
import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

const s3Client = new S3Client({});

type S3ObjectSummary = {
  key: string;
  size?: number;
  lastModified?: string;
};

type LambdaResponse = {
  statusCode: number;
  body: string;
};

const streamToString = async (stream: unknown): Promise<string> => {
  if (!stream || typeof stream !== "object" || !(Symbol.asyncIterator in stream)) {
    return "";
  }

  const chunks: Buffer[] = [];

  for await (const chunk of stream as AsyncIterable<Buffer | Uint8Array | string>) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf-8");
};

export const handler = async (_event: unknown, _context: Context): Promise<LambdaResponse> => {
  const bucketName = process.env.BUCKET_NAME;
  const prefix = process.env.PREFIX ?? "";
  const sampleKey = process.env.SAMPLE_KEY;
  const maxKeys = Number(process.env.MAX_KEYS ?? "20");

  if (!bucketName) {
    throw new Error("BUCKET_NAME environment variable is required");
  }

  const listResponse = await s3Client.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix,
      MaxKeys: maxKeys,
    }),
  );

  const objects: S3ObjectSummary[] =
    listResponse.Contents?.map((item) => ({
      key: item.Key ?? "",
      size: item.Size,
      lastModified: item.LastModified?.toISOString(),
    })) ?? [];

  let sampleObjectContent: string | undefined;

  if (sampleKey) {
    const getResponse = await s3Client.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: sampleKey,
      }),
    );

    sampleObjectContent = await streamToString(getResponse.Body);
  }

  console.log("S3 inspection result", {
    bucketName,
    prefix,
    objectCount: objects.length,
    sampleKey,
  });

  return {
    statusCode: 200,
    body: JSON.stringify(
      {
        bucketName,
        prefix,
        objectCount: objects.length,
        objects,
        sampleKey,
        sampleObjectContent,
      },
      null,
      2,
    ),
  };
};
