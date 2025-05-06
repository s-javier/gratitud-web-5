<script lang="ts">
  // import { goto } from '$app/navigation'
  import { Button, TextField } from 'noph-ui'
  import { applyAction, enhance } from '$app/forms'
  // import type { PageProps } from './$types'
  import type { ActionResult } from '@sveltejs/kit'
  import { toast } from 'svoast'
  import { loader } from '~/stores/loader.svelte'

  // let { form }: PageProps = $props()
  let emailErr = $state('')

  // Ojo con el inspect, podría ejecutar dos veces al utilizar form
  // $inspect(form).with(() => {
  //   console.log('form', form)
  // })
</script>

<div class="flex min-h-screen flex-col justify-center py-12 sm:px-6 lg:px-8">
  <div class="sm:mx-auto sm:w-full sm:max-w-md">
    <img
      class="mx-auto h-10 w-auto"
      src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
      alt="Your Company"
    />
    <h2 class="mt-6 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
      Ingresa a tu cuenta
    </h2>
  </div>

  <div class="mt-10 px-4 sm:mx-auto sm:w-full sm:max-w-[480px] sm:px-0">
    <div class="bg-white px-6 py-12 shadow-sm sm:rounded-lg sm:px-12">
      <form
        method="POST"
        use:enhance={() => {
          toast.removeAll()
          loader.is = true
          return async ({ result }: { result: ActionResult }) => {
            await applyAction(result)
            loader.is = false
            if ('data' in result && result.data?.error?.email) {
              emailErr = result.data.error.email
              return
            }
            if ('data' in result && result.data?.error?.server) {
              toast.error(result.data.error.server, { closable: true, infinite: true })
            }
          }
        }}
      >
        <TextField
          type="email"
          label="Email"
          name="email"
          variant="outlined"
          class="mb-10 w-full"
          error={emailErr.length > 0}
          errorText={emailErr}
          --np-outlined-text-field-label-text-color="var(--color-indigo-600)"
          --np-outlined-text-field-focus-outline-color="var(--color-indigo-400)"
          onfocus={() => {
            emailErr = ''
          }}
        >
          {#snippet end()}
            {#if emailErr}
              <svg
                class="pointer-events-none col-start-1 row-start-1 mr-3 size-5 self-center justify-self-end text-red-500"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
                data-slot="icon"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
                  clip-rule="evenodd"
                />
              </svg>
            {/if}
          {/snippet}
        </TextField>
        <Button
          variant="filled"
          class="w-full text-center!"
          --np-filled-button-container-color="var(--color-indigo-600)"
          --np-filled-button-container-height="42px"
          --np-filled-button-container-shape="4px"
        >
          Ingresar
        </Button>
      </form>
    </div>
  </div>
</div>
