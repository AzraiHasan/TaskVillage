// types/userSessionData.ts
import type { WorkspaceRole, WorkspacePermission } from '~/composables/useUser'

export interface UserSessionData {
  user: {
    id: string
    name: string
    email: string
    avatar: string
    workspacePermissions: WorkspacePermission[]
    roles: string[]
  }
}