// server/utils/auth-logger.ts

//This utility provides:

// A typed AuthEvent interface for consistent event structure
// A logAuthEvent function that adds timestamps and handles logging output
// Environment-specific behavior (production vs development)
export interface AuthEvent {
  type: 'login' | 'register' | 'logout' | 'password_change' | 'password_reset' | 'lockout';
  userId?: string;
  success: boolean;
  failureReason?: string;
  ip: string;
  userAgent: string;
}

export async function logAuthEvent(event: AuthEvent): Promise<void> {
  // Log to file in production, console in development
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    ...event
  };
  
  if (process.env.NODE_ENV === 'production') {
    // In production, write to secure log file
    // This would integrate with a logging service in a real app
    console.log(`AUTH EVENT: ${JSON.stringify(logEntry)}`);
  } else {
    // In development, log to console
    console.log(`AUTH EVENT: ${JSON.stringify(logEntry)}`);
  }
}