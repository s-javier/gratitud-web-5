<script lang="ts">
  import { fade } from 'svelte/transition'
  // import { redirect } from '@sveltejs/kit'
  import { goto } from '$app/navigation'

  let email = $state('')
  let emailErr = $state('')

  function handleClick() {
    emailErr = ''
    if (!email) {
      emailErr = 'El correo electrónico no puede estar vacío.'
      return
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (emailRegex.test(email) === false) {
      emailErr = 'Por favor, introduce un correo electrónico válido.'
      return
    }
    // redirect(303, '/uno')
    goto('/uno')
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
      <div class="space-y-6">
        <div>
          <label
            for="email"
            class="block text-sm/6 font-medium text-gray-900 {emailErr && 'text-red-600'}"
            >Email</label
          >
          <div class="mt-2 {emailErr && 'grid grid-cols-1'}">
            <input
              type="email"
              name="email"
              id="email"
              autocomplete="email"
              class={emailErr
                ? 'col-start-1 row-start-1 block w-full rounded-md bg-white py-1.5 pr-10 pl-3 text-base text-red-900 outline-1 -outline-offset-1 outline-red-300 placeholder:text-red-300 focus:outline-2 focus:-outline-offset-2 focus:outline-red-600 sm:pr-9 sm:text-sm/6'
                : 'block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6'}
              bind:value={email}
              onfocus={() => (emailErr = '')}
              aria-invalid={emailErr ? 'true' : 'false'}
              aria-describedby={emailErr ? 'email-error' : ''}
            />
            {#if emailErr}
              <svg
                class="pointer-events-none col-start-1 row-start-1 mr-3 size-5 self-center justify-self-end text-red-500 sm:size-4"
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
          </div>
          {#if emailErr}
            <p in:fade class="mt-2 text-sm text-red-600" id="email-error">{emailErr}</p>
          {/if}
        </div>

        <div class="pt-4">
          <button
            type="submit"
            class="pointer flex w-full cursor-pointer justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            onclick={handleClick}>Ingresar</button
          >
        </div>
      </div>
    </div>
  </div>
</div>
