// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      error: {
        server: string
      } | null
      userId: string | undefined
      userFirstName: string | undefined
      menuPages: any[] | undefined
      organizationsToChange: any[] | undefined
      organizationId: string | undefined
      roleId: string | undefined
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {}
