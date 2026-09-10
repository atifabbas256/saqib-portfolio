import "server-only";

import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  createSessionToken,
  validateCredentials,
  verifySessionToken,
} from "@/lib/admin/session";

export {
  ADMIN_COOKIE,
  createSessionToken,
  validateCredentials,
  verifySessionToken,
};

export async function isAdminAuthenticated() {
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function requireAdmin() {
  const ok = await isAdminAuthenticated();
  if (!ok) {
    const error = new Error("UNAUTHORIZED");
    throw error;
  }
}
