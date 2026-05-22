/**
 * Property-Based Tests for client-side validation utilities.
 *
 * Feature: vayucall-app
 * Property 1: Valid login inputs always attempt authentication
 * Property 2: Invalid login inputs are always rejected client-side
 * Property 3: Registration rejects invalid inputs client-side
 *
 * Validates: Requirements 1.2, 1.4, 1.5, 2.2, 2.3
 */

import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { isValidEmail, isValidPassword, isValidChannelName } from './validation';

// ---------------------------------------------------------------------------
// Arbitraries
// ---------------------------------------------------------------------------

/** Characters safe for email local/domain parts (no '@', no whitespace) */
const emailSafeChar = fc.constantFrom(
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '-', '_'
);

const emailSafeString = (min: number, max: number) =>
  fc.array(emailSafeChar, { minLength: min, maxLength: max }).map(chars => chars.join(''));

/**
 * Generates a valid email: non-empty local + '@' + non-empty domain, total ≤ 254 chars.
 */
const validEmailArb = fc
  .tuple(emailSafeString(1, 100), emailSafeString(1, 100))
  .filter(([local, domain]) => local.length + 1 + domain.length <= 254)
  .map(([local, domain]) => `${local}@${domain}`);

/**
 * Generates an invalid email — one that fails at least one rule.
 */
const invalidEmailArb = fc.oneof(
  // No '@' at all — use only safe chars
  emailSafeString(1, 50),
  // Multiple '@' — two '@' signs
  fc.tuple(emailSafeString(1, 20), emailSafeString(1, 20), emailSafeString(1, 20))
    .map(([a, b, c]) => `${a}@${b}@${c}`),
  // Empty local part: '@' + domain
  emailSafeString(1, 50).map(domain => `@${domain}`),
  // Empty domain: local + '@'
  emailSafeString(1, 50).map(local => `${local}@`),
  // Exceeds 254 chars: local(200) + '@' + domain(55) = 256
  fc.tuple(emailSafeString(200, 200), emailSafeString(55, 55))
    .map(([local, domain]) => `${local}@${domain}`)
);

/**
 * Generates a valid password: 6–128 characters.
 */
const validPasswordArb = fc.string({ minLength: 6, maxLength: 128 });

/**
 * Generates an invalid password: < 6 or > 128 characters.
 */
const invalidPasswordArb = fc.oneof(
  // Too short (0–5 chars)
  fc.string({ minLength: 0, maxLength: 5 }),
  // Too long (129–300 chars)
  fc.string({ minLength: 129, maxLength: 300 })
);

// ---------------------------------------------------------------------------
// Property 1: Valid login inputs always attempt authentication
// ---------------------------------------------------------------------------

describe(
  'Feature: vayucall-app, Property 1: Valid login inputs always attempt authentication',
  () => {
    /**
     * **Validates: Requirements 2.2, 2.3**
     *
     * For any email string that contains exactly one `@` with a non-empty
     * local part and a non-empty domain, and is at most 254 characters,
     * `isValidEmail` must return `true`.
     */
    it(
      'isValidEmail returns true for any valid email (contains @ with non-empty local and domain, ≤254 chars)',
      () => {
        fc.assert(
          fc.property(validEmailArb, (email) => {
            return isValidEmail(email) === true;
          }),
          { numRuns: 100 }
        );
      }
    );
  }
);

// ---------------------------------------------------------------------------
// Property 2: Invalid login inputs are always rejected client-side
// ---------------------------------------------------------------------------

describe(
  'Feature: vayucall-app, Property 2: Invalid login inputs are always rejected client-side',
  () => {
    /**
     * **Validates: Requirements 2.2**
     *
     * For any email that does not contain exactly one `@` with a non-empty
     * domain, or exceeds 254 characters, `isValidEmail` must return `false`.
     */
    it(
      'isValidEmail returns false for any invalid email (missing @, empty local/domain, multiple @, or >254 chars)',
      () => {
        fc.assert(
          fc.property(invalidEmailArb, (email) => {
            return isValidEmail(email) === false;
          }),
          { numRuns: 100 }
        );
      }
    );
  }
);

// ---------------------------------------------------------------------------
// Property 3: Registration rejects invalid inputs client-side
// ---------------------------------------------------------------------------

describe('Property 3: Registration rejects invalid inputs client-side', () => {
  /**
   * Sub-property 3a: valid email AND valid password → both validators return true
   *
   * Validates: Requirements 1.2, 1.4, 1.5
   */
  it('accepts registration when both email and password are valid', () => {
    fc.assert(
      fc.property(validEmailArb, validPasswordArb, (email, password) => {
        const emailOk = isValidEmail(email);
        const passwordOk = isValidPassword(password);
        expect(emailOk).toBe(true);
        expect(passwordOk).toBe(true);
        // Combined gate: registration should proceed (both true)
        expect(emailOk && passwordOk).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Sub-property 3b: invalid email (any password) → combined gate is false
   *
   * Validates: Requirements 1.2
   */
  it('rejects registration when email is invalid regardless of password', () => {
    fc.assert(
      fc.property(invalidEmailArb, fc.string(), (email, password) => {
        const emailOk = isValidEmail(email);
        expect(emailOk).toBe(false);
        // Combined gate must be false when email is invalid
        expect(emailOk && isValidPassword(password)).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Sub-property 3c: invalid password (any email) → combined gate is false
   *
   * Validates: Requirements 1.4, 1.5
   */
  it('rejects registration when password is invalid regardless of email', () => {
    fc.assert(
      fc.property(fc.string(), invalidPasswordArb, (email, password) => {
        const passwordOk = isValidPassword(password);
        expect(passwordOk).toBe(false);
        // Combined gate must be false when password is invalid
        expect(isValidEmail(email) && passwordOk).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Sub-property 3d: invalid email AND invalid password → combined gate is false
   *
   * Validates: Requirements 1.2, 1.4, 1.5
   */
  it('rejects registration when both email and password are invalid', () => {
    fc.assert(
      fc.property(invalidEmailArb, invalidPasswordArb, (email, password) => {
        const emailOk = isValidEmail(email);
        const passwordOk = isValidPassword(password);
        expect(emailOk).toBe(false);
        expect(passwordOk).toBe(false);
        expect(emailOk && passwordOk).toBe(false);
      }),
      { numRuns: 100 }
    );
  });

  /**
   * Sub-property 3e: isValidEmail && isValidPassword iff both pass their rules
   * (bidirectional equivalence over arbitrary inputs)
   *
   * Validates: Requirements 1.2, 1.4, 1.5
   */
  it('combined gate equals (isValidEmail AND isValidPassword) for arbitrary inputs', () => {
    fc.assert(
      fc.property(fc.string(), fc.string(), (email, password) => {
        const emailOk = isValidEmail(email);
        const passwordOk = isValidPassword(password);
        const combinedGate = emailOk && passwordOk;

        // If combined gate is true, each individual validator must also be true
        if (combinedGate) {
          expect(emailOk).toBe(true);
          expect(passwordOk).toBe(true);
        }

        // If either validator is false, combined gate must be false
        if (!emailOk || !passwordOk) {
          expect(combinedGate).toBe(false);
        }
      }),
      { numRuns: 100 }
    );
  });
});

// ---------------------------------------------------------------------------
// Property 4: Channel name validation is consistent
// Validates: Requirements 5.4, 5.5
// ---------------------------------------------------------------------------

describe('Feature: vayucall-app, Property 4: Channel name validation is consistent', () => {
  /**
   * **Validates: Requirements 5.4, 5.5**
   *
   * For any string composed entirely of whitespace characters (spaces, tabs,
   * newlines, carriage returns, form feeds, vertical tabs), `isValidChannelName`
   * must return `false`.
   */
  it('rejects any whitespace-only string', () => {
    fc.assert(
      fc.property(
        // Build strings from whitespace characters only, length 1–50
        fc.array(
          fc.constantFrom(' ', '\t', '\n', '\r', '\f', '\v'),
          { minLength: 1, maxLength: 50 }
        ).map((chars) => chars.join('')),
        (whitespaceOnly) => {
          expect(isValidChannelName(whitespaceOnly)).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * **Validates: Requirements 5.4, 5.5**
   *
   * For any non-empty, non-whitespace-only string of at most 50 characters,
   * `isValidChannelName` must return `true`.
   *
   * Generator strategy: build strings from printable ASCII characters
   * (0x21–0x7E, i.e. '!' through '~') which are guaranteed non-whitespace,
   * with length 1–50. This avoids expensive post-generation filtering.
   */
  it('accepts any non-empty non-whitespace-only string of at most 50 characters', () => {
    // Printable ASCII excluding space (0x21–0x7E): guaranteed non-whitespace
    const printableAsciiChar = fc.integer({ min: 0x21, max: 0x7e })
      .map((code) => String.fromCharCode(code));

    fc.assert(
      fc.property(
        fc.array(printableAsciiChar, { minLength: 1, maxLength: 50 })
          .map((chars) => chars.join('')),
        (validName) => {
          expect(isValidChannelName(validName)).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
});
