// server/utils/csrf.ts
import { randomBytes } from 'node:crypto'

// Generate a random CSRF token
export function generateCsrfToken(): string {
  return randomBytes(32).toString('hex')
}

// Set a CSRF token cookie
export function setCsrfCookie(event: any): string {
  const token = generateCsrfToken()
  setCookie(event, 'csrf-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 3600 // 1 hour
  })
  return token
}

// Validate CSRF token
export function validateCsrfToken(event: any, formToken: string): boolean {
  const cookieToken = getCookie(event, 'csrf-token')
  return Boolean(cookieToken && cookieToken === formToken)
}