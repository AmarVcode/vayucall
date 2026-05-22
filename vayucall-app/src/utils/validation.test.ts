import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPassword, isValidChannelName } from './validation';

// ---------------------------------------------------------------------------
// isValidEmail
// ---------------------------------------------------------------------------
describe('isValidEmail', () => {
  it('accepts a standard email address', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
  });

  it('accepts an email with subdomain', () => {
    expect(isValidEmail('user@mail.example.com')).toBe(true);
  });

  it('rejects an email with no @', () => {
    expect(isValidEmail('userexample.com')).toBe(false);
  });

  it('rejects an email with two @ signs', () => {
    expect(isValidEmail('user@@example.com')).toBe(false);
  });

  it('rejects an email with empty local part', () => {
    expect(isValidEmail('@example.com')).toBe(false);
  });

  it('rejects an email with empty domain', () => {
    expect(isValidEmail('user@')).toBe(false);
  });

  it('rejects an email exceeding 254 characters', () => {
    const longLocal = 'a'.repeat(244);
    const email = `${longLocal}@b.com`; // 244 + 1 + 5 = 250 chars — valid
    expect(isValidEmail(email)).toBe(true);

    const tooLong = 'a'.repeat(249) + '@b.com'; // 249 + 1 + 5 = 255 chars — invalid
    expect(isValidEmail(tooLong)).toBe(false);
  });

  it('accepts an email exactly 254 characters long', () => {
    // local(248) + '@' + 'b.com'(5) = 254
    const email = 'a'.repeat(248) + '@b.com';
    expect(email.length).toBe(254);
    expect(isValidEmail(email)).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(isValidEmail('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidPassword
// ---------------------------------------------------------------------------
describe('isValidPassword', () => {
  it('accepts a password of exactly 6 characters', () => {
    expect(isValidPassword('abc123')).toBe(true);
  });

  it('accepts a password of exactly 128 characters', () => {
    expect(isValidPassword('a'.repeat(128))).toBe(true);
  });

  it('accepts a password between 6 and 128 characters', () => {
    expect(isValidPassword('securePass1!')).toBe(true);
  });

  it('rejects a password shorter than 6 characters', () => {
    expect(isValidPassword('abc')).toBe(false);
  });

  it('rejects a password of 5 characters (boundary)', () => {
    expect(isValidPassword('abcde')).toBe(false);
  });

  it('rejects a password longer than 128 characters', () => {
    expect(isValidPassword('a'.repeat(129))).toBe(false);
  });

  it('rejects an empty password', () => {
    expect(isValidPassword('')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isValidChannelName
// ---------------------------------------------------------------------------
describe('isValidChannelName', () => {
  it('accepts a simple channel name', () => {
    expect(isValidChannelName('my-channel')).toBe(true);
  });

  it('accepts a single non-whitespace character', () => {
    expect(isValidChannelName('a')).toBe(true);
  });

  it('accepts a channel name of exactly 50 characters', () => {
    expect(isValidChannelName('a'.repeat(50))).toBe(true);
  });

  it('rejects an empty string', () => {
    expect(isValidChannelName('')).toBe(false);
  });

  it('rejects a whitespace-only string (spaces)', () => {
    expect(isValidChannelName('   ')).toBe(false);
  });

  it('rejects a whitespace-only string (tabs)', () => {
    expect(isValidChannelName('\t\t')).toBe(false);
  });

  it('rejects a whitespace-only string (newlines)', () => {
    expect(isValidChannelName('\n\n')).toBe(false);
  });

  it('rejects a channel name longer than 50 characters', () => {
    expect(isValidChannelName('a'.repeat(51))).toBe(false);
  });

  it('accepts a channel name with leading/trailing spaces but non-whitespace content', () => {
    expect(isValidChannelName(' room ')).toBe(true);
  });
});
