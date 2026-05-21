# test-01

TypeScript AWS Lambda demo repository.

## S3 inspection Lambda

This project contains a TypeScript Lambda function that checks the contents of an S3 bucket.

The Lambda can:

- List objects in a bucket
- Optionally filter by prefix
- Optionally read one sample object
- Return object key, size, and last modified time

## Project structure

```text
.
├── src/index.ts
├── package.json
├── tsconfig.json
└── README.md
```

## Environment variables

| Variable | Required | Example | Description |
|---|---:|---|---|
| `BUCKET_NAME` | Yes | `my-demo-bucket` | S3 bucket to inspect |
| `PREFIX` | No | `raw/` | Optional prefix filter |
| `MAX_KEYS` | No | `20` | Maximum number of objects to list |
| `SAMPLE_KEY` | No | `raw/example.json` | Optional object key to read |

## Build

```bash
npm install
npm run build
```

## Package for Lambda zip upload

```bash
npm run package
```

This creates:

```text
lambda.zip
```

## Lambda handler

Use this handler value when creating the Lambda function:

```text
index.handler
```

## Minimum IAM policy

For listing bucket objects:

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:ListBucket"
  ],
  "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME"
}
```

If `SAMPLE_KEY` is used to read an object, also add:

```json
{
  "Effect": "Allow",
  "Action": [
    "s3:GetObject"
  ],
  "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
}
```
