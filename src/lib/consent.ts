export const CONSENT_VERSION = "1.0";
export const CONSENT_COOKIE_NAME = "asc_lgpd_consent";
export const CONSENT_COOKIE_VALUE = `accepted-v${CONSENT_VERSION}`;

export function isConsentAccepted(value?: string | null) {
  return value === CONSENT_COOKIE_VALUE;
}
