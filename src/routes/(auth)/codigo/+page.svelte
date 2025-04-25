<script lang="ts">
  import { fade } from 'svelte/transition'
  import { goto } from '$app/navigation'
  import { Button } from 'noph-ui'
  import { OTPInput, OTPRoot } from '@jimmyverburgt/svelte-input-otp'
  import { MinusOutline } from 'flowbite-svelte-icons'
  import { loader } from '~/stores/loader.svelte'

  let value = $state('')

  function handleOtpComplete(code: string) {
    console.log('OTP Complete:', code)
  }

  function handleOtpChange(event: { detail: string }) {
    console.log('OTP changed:', event.detail)
  }

  function handleClick() {
    loader.is = true
    goto('/welcome')
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
        <p class="mb-4">¡Gracias por iniciar sesión en Gratitud!</p>
        <p class="mb-4">No cierres ni actulices esta página.</p>
        <p class="mb-4">Se te ha enviado un email con un código para que lo ingreses más abajo.</p>
        <p class="">
          Si el email no lo ves en tu bandeja de entrada, por favor, revisa tu carpeta de spam.
        </p>
      </section>
      <div class="mb-10 flex justify-center">
        <OTPRoot
          maxLength={6}
          ariaLabel="Svelte OTP Code"
          on:change={handleOtpChange}
          bind:value
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

      <Button
        variant="filled"
        class="mb-10 w-full text-center!"
        --np-filled-button-container-color="var(--color-indigo-600)"
        --np-filled-button-container-height="42px"
        --np-filled-button-container-shape="4px"
        onclick={handleClick}
      >
        Ingresar
      </Button>

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
