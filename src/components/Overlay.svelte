<script lang="ts">
  import { animate } from 'motion'
  import type { Snippet } from 'svelte'

  const props: {
    isActive: boolean
    children: Snippet
    type: 'dialog' | 'sidebar'
    width?: string
    zIndex?: string
    close?: () => void
    panelTitle?: string
  } = $props()
  let overlayBackdropRef = $state<HTMLDivElement | null>(null)
  let overlayDialogRef = $state<HTMLDivElement | null>(null)
  let overlaySidebarRef = $state<HTMLDivElement | null>(null)
  let is = $state<boolean>(false)

  const openOverlay = () => {
    animate(overlayBackdropRef!, { opacity: 1 }, { duration: 0.3 })
    if (props.type === 'dialog') {
      animate(overlayDialogRef!, { transform: 'translateY(0px)', opacity: 1 }, { duration: 0.3 })
    } else {
      animate(overlaySidebarRef!, { transform: 'translateX(0px)' }, { duration: 0.3 })
    }
  }

  const closeOverlay = async () => {
    if (props.type === 'dialog') {
      await animate([
        [overlayBackdropRef!, { opacity: 0 }, { duration: 0.2 }],
        [
          overlayDialogRef!,
          { transform: 'translateY(-200px)', opacity: 0 },
          { at: '<', duration: 0.2 },
        ],
      ])
    } else {
      await animate([
        [overlaySidebarRef!, { transform: 'translateX(100%)' }, { duration: 0.3 }],
        [overlayBackdropRef!, { opacity: 0 }, { at: 0.1, duration: 0.2 }],
      ])
    }
  }

  $effect(() => {
    if (props.isActive) {
      is = true
      openOverlay()
    } else {
      closeOverlay().then(() => {
        is = false
      })
    }
  })
</script>

<div
  class="relative {props.zIndex ?? 'z-1400'} {is === false && 'hidden'}"
  aria-labelledby="Elemento para mostrar que está cargando"
  aria-modal="true"
>
  <div
    bind:this={overlayBackdropRef}
    class="fixed inset-0 bg-gray-500/75 opacity-0"
    aria-hidden="true"
  ></div>

  {#if props.type === 'dialog'}
    <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
      <div class="flex min-h-full items-center justify-center p-4 text-center">
        <div
          bind:this={overlayDialogRef}
          class={[
            'relative w-full transform overflow-hidden rounded-lg text-left opacity-0',
            props.width ?? 'sm:max-w-sm',
            is === false && 'hidden',
          ]}
        >
          <!-- ↓ Contenedor de modal, no del contenido -->
          <main class="flex flex-row items-center justify-center">{@render props.children()}</main>
        </div>
      </div>
    </div>
  {:else}
    <div class="fixed inset-0 overflow-hidden">
      <div class="absolute inset-0 overflow-hidden">
        <div class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
          <!-- Slide-over panel, show/hide based on slide-over state.

          Entering: "transform transition ease-in-out duration-500 sm:duration-700"
            From: "translate-x-full"
            To: "translate-x-0"
          Leaving: "transform transition ease-in-out duration-500 sm:duration-700"
            From: "translate-x-0"
            To: "translate-x-full" -->
          <div
            bind:this={overlaySidebarRef}
            class={[
              'pointer-events-auto w-screen translate-x-full transform',
              props.width ?? 'sm:max-w-md',
              is === false && 'hidden',
            ]}
          >
            <div class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl">
              <div class="px-4 sm:px-6">
                <div class="flex items-start justify-between">
                  <h2 class="text-base leading-6 font-semibold text-gray-900" id="slide-over-title">
                    {props.panelTitle}
                  </h2>
                  <div class="ml-3 flex h-7 items-center">
                    <button
                      type="button"
                      class="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
                      onclick={props.close}
                    >
                      <span class="absolute -inset-2.5"></span>
                      <span class="sr-only">Close panel</span>
                      <svg
                        class="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke-width="1.5"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div class="relative mt-6 flex-1 px-4 sm:px-6">{@render props.children()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}
</div>
