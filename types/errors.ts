// types/errors.ts
// Define our custom error types to handle different scenarios consistently
export class TaskVillageError extends Error {
  constructor(
    message: string,
    public code: string,
    public httpStatus?: number,
    public retry?: boolean
  ) {
    super(message)
    this.name = 'TaskVillageError'
  }
}

// Known error types that can occur in our application
export enum ErrorCode {
  TASK_NOT_FOUND = 'TASK_NOT_FOUND',
  INVALID_INPUT = 'INVALID_INPUT',
  UNAUTHORIZED = 'UNAUTHORIZED',
  WORKSPACE_ACCESS_DENIED = 'WORKSPACE_ACCESS_DENIED',
  OPERATION_FAILED = 'OPERATION_FAILED',
  NETWORK_ERROR = 'NETWORK_ERROR'
}