import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE = "cec_admin";

function secret() {
  return process.env.ADMIN_SECRET || "comoencasa-local-secret";
}

function expectedPassword() {
  return process.env.ADMIN_PASSWORD || "comoencasa";
}

export function passwordMatches(input: string) {
  const actual = createHmac("sha256", secret()).update(input).digest();
  const expected = createHmac("sha256", secret()).update(expectedPassword()).digest();
  return timingSafeEqual(actual, expected);
}

export function adminToken() {
  return createHmac("sha256", secret())
    .update(`admin:${expectedPassword()}`)
    .digest("hex");
}

export async function isAdmin() {
  const jar = await cookies();
  const value = jar.get(ADMIN_COOKIE)?.value ?? "";
  const expected = adminToken();
  if (value.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}
