<script lang="ts">
  import { onMount } from 'svelte'
  import type { ActionResult } from '@sveltejs/kit'
  import { applyAction, enhance } from '$app/forms'
  import { Button } from 'noph-ui'
  import { OTPInput, OTPRoot } from '@jimmyverburgt/svelte-input-otp'
  import { MinusOutline } from 'flowbite-svelte-icons'
  import { loader } from '~/stores/loader.svelte'
  import { General, Page } from '~/enums'
  import { toast } from 'svoast'
  import { fade } from 'svelte/transition'

  let timeLimit = $state(300) /* 300s = 5 mins */
  let code = $state('')
  let codeErr = $state('')

  onMount(() => {
    const interval = setInterval(() => {
      if (timeLimit === 0) {
        clearInterval(interval)
      } else {
        timeLimit -= 1
      }
    }, 1000)
    return () => clearInterval(interval)
  })

  function handleOtpComplete(code: string) {
    // console.log('OTP Complete:', code)
  }

  function handleOtpChange(event: { detail: string }) {
    codeErr = ''
    // console.log('OTP changed:', event.detail)
  }
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
      <section class="mb-14">
        <p class="mb-4">¡Gracias por iniciar sesión en {General.TITLE}!</p>
        <p class="mb-4">No cierres ni actulices esta página.</p>
        <p class="mb-4">Se te ha enviado un email con un código para que lo ingreses más abajo.</p>
        <p class="">
          Si el email no lo ves en tu bandeja de entrada, por favor, revisa tu carpeta de spam.
        </p>
      </section>

      <form
        method="POST"
        use:enhance={() => {
          toast.removeAll()
          loader.is = true
          return async ({ result }: { result: ActionResult }) => {
            await applyAction(result)
            loader.is = false
            if ('data' in result && result.data?.error?.code) {
              codeErr = result.data.error.code
              return
            }
            if ('data' in result && result.data?.error?.server) {
              toast.error(result.data.error.server, { closable: true, infinite: true })
            }
          }
        }}
      >
        <input name="timeLimit" type="hidden" value={timeLimit} />
        <div class="mb-10 flex justify-center">
          <OTPRoot
            maxLength={6}
            ariaLabel="Código de verificación"
            on:change={handleOtpChange}
            bind:value={code}
            autoFocus={true}
            onComplete={handleOtpComplete}
            className="flex items-center gap-2"
          >
            {#snippet children({ fields })}
              <div class="flex items-center">
                {#each fields.slice(0, 3) as field}
                  <OTPInput
                    {field}
                    className="relative flex w-10 md:w-12 h-14 md:h-16 items-center justify-center border-y border-r border-input text-3xl transition-all first:rounded-l-md first:border-l last:rounded-r-md"
                    focusClassName="z-10 ring-2 ring-ring ring-offset-background"
                  />
                {/each}
              </div>
              <div class="mx-1">
                <MinusOutline />
              </div>
              <div class="flex items-center">
                {#each fields.slice(3, 6) as field}
                  <OTPInput
                    {field}
                    className="relative flex w-10 md:w-12 h-14 md:h-16 items-center justify-center border-y border-r border-input text-3xl transition-all first:rounded-l-md first:border-l last:rounded-r-md"
                    focusClassName="z-10 ring-2 ring-ring ring-offset-background"
                  />
                {/each}
              </div>
            {/snippet}
          </OTPRoot>
        </div>

        <section class="mb-10">
          {#if timeLimit > 0}
            <div class="text-center text-sm font-bold text-gray-400">
              Tienes {timeLimit} segundos para ingresar el código.
            </div>
          {:else}
            <div class="text-center text-sm font-bold text-red-500">
              Oh no, se acabó el tiempo. El código expiró y no se puede volver a utilizar. Por
              favor, presiona&nbsp;
              <a href={Page.LOGIN} class="cursor-pointer text-gray-400 hover:underline"> aquí </a>
              &nbsp;para que ingreses nuevamente tu email y recibirás un nuevo código.
            </div>
          {/if}
        </section>

        {#if codeErr}
          <section class="mb-10 text-center text-sm font-bold text-red-500" transition:fade>
            {codeErr}
          </section>
        {/if}

        <Button
          variant="filled"
          class="mb-10 w-full text-center!"
          --np-filled-button-container-color="var(--color-indigo-600)"
          --np-filled-button-container-height="42px"
          --np-filled-button-container-shape="4px"
          disabled={timeLimit === 0}
        >
          Ingresar
        </Button>
      </form>

      <div class="line rounded-md bg-slate-200 p-4 text-sm">
        Si el código no lo recibiste o tienes algún problema, por favor, presiona
        <a href="/ingreso" class="cursor-pointer font-bold text-indigo-500 hover:underline">
          aquí
        </a>
        para que ingreses nuevamente tu email y recibirás un nuevo código.
      </div>
    </div>
  </div>
</div>
