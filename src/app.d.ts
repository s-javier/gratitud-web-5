// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      error: {
        server?: string
      } | null
      userFirstName: string
      menu: any[]
      organizationsToChange: any[]
      userId: string
      organizationId: string
      roleId: string
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
