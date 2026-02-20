declare module '@auth/core/types' {
  export interface Session {
    user: {
      name: string
      email: string
      sub: string
      email_verified: boolean
    } & Profile
    account: {
      access_token: string
    }
    expires: Date
  }
}
