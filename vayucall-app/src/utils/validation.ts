/**
 * Validates an email address.
 *
 * Rules:
 * - Contains exactly one `@`
 * - Non-empty local part (before `@`)
 * - Non-empty domain part (after `@`)
 * - Maximum 254 characters total
 */
export function isValidEmail(email: string): boolean {
  if (email.length > 254) return false;

  const atIndex = email.indexOf('@');
  if (atIndex === -1) return false;

  // Exactly one `@`
  if (email.indexOf('@', atIndex + 1) !== -1) return false;

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (localPart.length === 0) return false;
  if (domain.length === 0) return false;

  return true;
}

/**
 * Validates a password for registration and login.
 *
 * Rules:
 * - 6–128 characters
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6 && password.length <= 128;
}

/**
 * Validates a channel name.
 *
 * Rules:
 * - 1–50 characters
 * - Not whitespace-only
 */
export function isValidChannelName(name: string): boolean {
  if (name.length === 0 || name.length > 50) return false;
  return name.trim().length > 0;
}
