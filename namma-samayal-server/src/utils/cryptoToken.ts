import crypto from "crypto";

export interface GeneratedToken {
  /** Raw token sent to the user (email link). Never stored. */
  rawToken: string;
  /** SHA-256 hash of the raw token. This is what we persist in the DB. */
  hashedToken: string;
}

/**
 * Generate a cryptographically random token plus its SHA-256 hash.
 *
 * The raw token is emailed to the user; only the hash is stored. If the DB
 * leaks, the stored hash cannot be used to forge a valid verification or
 * password-reset link.
 */
export const createHashedToken = (): GeneratedToken => {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = hashToken(rawToken);

  return { rawToken, hashedToken };
};

/** Hash an incoming raw token so it can be matched against the stored hash. */
export const hashToken = (rawToken: string): string => {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
};
