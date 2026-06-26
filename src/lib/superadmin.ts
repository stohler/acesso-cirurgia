const DEFAULT_SUPERADMIN_EMAIL = "pstohler@gmail.com";

export function getSuperAdminEmails() {
  const explicit = (process.env.SUPERADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const bootstrap = process.env.BOOTSTRAP_DOCTOR_EMAIL?.trim().toLowerCase();

  return [...new Set([...explicit, ...(bootstrap ? [bootstrap] : []), DEFAULT_SUPERADMIN_EMAIL])];
}

export function isSuperAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return getSuperAdminEmails().includes(email.trim().toLowerCase());
}
