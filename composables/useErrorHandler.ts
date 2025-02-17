// composables/useErrorHandler.ts
// Central error handling logic that can be used across the application

import { TaskVillageError } from '~/types/errors';
import { ErrorCode } from '~/types/errors';
export const useErrorHandler = () => {
  const toast = useToast()

  // Map error codes to user-friendly messages
  const getErrorMessage = (error: TaskVillageError) => {
    const messages = {
      [ErrorCode.TASK_NOT_FOUND]: 'The requested task could not be found',
      [ErrorCode.INVALID_INPUT]: 'Please check your input and try again',
      [ErrorCode.UNAUTHORIZED]: 'You need to be logged in to perform this action',
      [ErrorCode.WORKSPACE_ACCESS_DENIED]: 'You don\'t have access to this workspace',
      [ErrorCode.OPERATION_FAILED]: 'Operation failed. Please try again',
      [ErrorCode.NETWORK_ERROR]: 'Network error. Please check your connection'
    }
    return messages[error.code as ErrorCode] || 'An unexpected error occurred'
  }

  // Handle errors consistently across the application
  const handleError = (error: unknown) => {
    if (error instanceof TaskVillageError) {
      toast.add({
        title: 'Error',
        description: getErrorMessage(error),
        color: 'red',
        timeout: 5000
      })

      // Handle specific error types
      switch (error.code) {
        case ErrorCode.UNAUTHORIZED:
          // Redirect to login
          break
        case ErrorCode.WORKSPACE_ACCESS_DENIED:
          // Redirect to allowed workspace
          break
      }
    } else {
      // Handle unexpected errors
      toast.add({
        title: 'Error',
        description: 'An unexpected error occurred',
        color: 'red',
        timeout: 5000
      })
      console.error('Unexpected error:', error)
    }
  }

  return {
    handleError
  }
}