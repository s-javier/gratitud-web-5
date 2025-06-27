<script lang="ts">
  import { fade } from 'svelte/transition'
  import type { ActionResult } from '@sveltejs/kit'
  import { applyAction, enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import { Button } from 'noph-ui'
  import { Checkbox } from 'flowbite-svelte'
  import { toast } from 'svoast'
  import { overlayLoader } from '~/stores/loader.svelte'
  import Overlay from '~/components/Overlay.svelte'
  import Modal from '~/components/Modal.svelte'

  let {
    isOpen = $bindable(),
    ...props
  }: {
    isOpen: boolean
    title: string
    data: {
      id: string
      title: string
      description: string
    } | null
  } = $props()

  let isConfirmed = $state(false)
  let isConfirmedErr = $state('')

  $effect(() => {
    if (props.data) {
      isConfirmed = false
      isConfirmedErr = ''
    }
  })

  $effect(() => {
    isConfirmedErr = isConfirmed ? '' : ''
  })
</script>

<Overlay type="dialog" status={isOpen} width="max-w-[500px]">
  <Modal title={props.title} close={() => (isOpen = false)}>
    {#if props.data}
      <section class="mb-6">
        <p class="mb-2 text-base leading-relaxed text-gray-500 dark:text-gray-400">
          ¿Estás seguro de eliminar el siguientes agradecimiento?
        </p>
        <p class="mb-2 text-base leading-relaxed text-gray-500 dark:text-gray-400">
          <b>{props.data?.description}</b>
        </p>
        {#if props.data?.title}
          <p class="mb-2 text-base leading-relaxed text-gray-500 dark:text-gray-400">
            El título del agradecimiento es <b>{props.data?.title}</b>.
          </p>
        {/if}
        <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
          Considere que esta acción no se puede deshacer.
        </p>
      </section>
      <form
        id="form-gratitude-delete"
        method="POST"
        action="?/delete"
        use:enhance={() => {
          toast.removeAll()
          overlayLoader.is = true
          return async ({ result }: { result: ActionResult }) => {
            await applyAction(result)
            await invalidateAll()
            overlayLoader.is = false
            if ('data' in result && result.data?.error) {
              if (result.data.error?.isConfirmed) {
                isConfirmedErr = result.data.error.isConfirmed
                toast.error('Por favor, corrige el error.', { closable: true })
              } else if (result.data.error?.gratitudeId) {
                toast.error('Hubo un error. Por favor, recarga la página para corregirlo.', {
                  closable: true,
                })
              }
              if (result.data?.error?.server) {
                toast.error(result.data.error.server, { closable: true, infinite: true })
              }
              return
            }
            isOpen = false
          }
        }}
      >
        <input type="hidden" name="id" value={props.data?.id} />
        <div class="rounded-sm border {isConfirmedErr ? 'border-red-400' : 'border-gray-300'}">
          <Checkbox
            name="isConfirmed"
            bind:checked={isConfirmed}
            value="true"
            divClass="w-full p-4"
            class="size-5 text-(--o-btn-primary-bg-hover-color)! focus:ring-(--o-btn-primary-bg-hover-color)!"
          >
            Confirmo que deseo eliminar la organización.
          </Checkbox>
        </div>
        {#if isConfirmedErr}
          <p in:fade class="text-sm text-red-500">{isConfirmedErr}</p>
        {/if}
      </form>
    {/if}
    {#snippet footer()}
      <div class="flex w-full items-center justify-between gap-2">
        <Button
          variant="outlined"
          onclick={() => (isOpen = false)}
          --np-outlined-button-container-shape="4px"
          --np-outlined-button-label-text-color="var(--color-gray-500)"
        >
          Cerrar
        </Button>
        <Button
          type="submit"
          form="form-gratitude-delete"
          variant="filled"
          class="text-center! text-base!"
          --np-filled-button-container-color="var(--o-btn-primary-bg-color)"
          --np-filled-button-container-shape="4px"
        >
          Eliminar
        </Button>
      </div>
    {/snippet}
  </Modal>
</Overlay>
