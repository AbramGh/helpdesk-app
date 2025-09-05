// Simple placeholder encryption - replace with proper KMS in production
export function encrypt(plain: string): string {
  return Buffer.from(plain, "utf8").toString("base64")
}

export function decrypt(enc: string): string {
  return Buffer.from(enc, "base64").toString("utf8")
}

