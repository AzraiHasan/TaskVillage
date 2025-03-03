// server/utils/password-validation.ts
import { z } from 'zod'

// Top common passwords to check against
const COMMON_PASSWORDS = [
  'password', 'password123', '123456', '12345678', 'qwerty', 
  'abc123', '111111', 'admin'
];

export const createPasswordSchema = () => {
  return z.string()
    .min(10, 'Password must be at least 10 characters')
    .refine(
      password => /[A-Z]/.test(password),
      'Password must contain at least one uppercase letter'
    )
    .refine(
      password => /[a-z]/.test(password),
      'Password must contain at least one lowercase letter'
    )
    .refine(
      password => /[0-9]/.test(password),
      'Password must contain at least one number'
    )
    .refine(
      password => /[^A-Za-z0-9]/.test(password),
      'Password must contain at least one special character'
    )
    .refine(
      password => !COMMON_PASSWORDS.includes(password.toLowerCase()),
      'This password is too common and easily guessed'
    );
};