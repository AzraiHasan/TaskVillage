// types/userSessionData.ts
export interface UserSessionData {
 [key: string]: any;
  user: {
    id: string
    name: string
    email: string
    avatar: string
    workspaces: number[]
    roles: string[] 
  }
}