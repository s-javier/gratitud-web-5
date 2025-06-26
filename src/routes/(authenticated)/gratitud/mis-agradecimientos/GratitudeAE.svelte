<script lang="ts">
  import { tick } from 'svelte'
  import type { ActionResult } from '@sveltejs/kit'
  import { applyAction, enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import { Button, TextField } from 'noph-ui'
  import { toast } from 'svoast'
  import Icon from '@iconify/svelte'

  import { overlayLoader } from '~/stores/loader.svelte'
  import Overlay from '~/components/Overlay.svelte'
  import Modal from '~/components/Modal.svelte'
  import { autoResize } from '~/lib'

  let {
    isOpen = $bindable(),
    ...props
  }: {
    type: string /* adding o editing */
    isOpen: boolean
    data?: {
      id: string
      title: string
      description: string
    } | null
  } = $props()

  let titleErr = $state('')
  let descriptionRef = $state() as HTMLTextAreaElement
  let descriptionErr = $state('')

  /* ▼ Exclusivo de la edición */
  let title = $state('')
  let description = $state('')

  $effect(() => {
    if (props.data && props.type === 'editing') {
      title = props.data.title
      description = props.data.description
    }
  })
  /* ▲ Exclusivo de la edición */

  $effect(() => {
    if (isOpen && props.type === 'adding') {
      tick().then(() => descriptionRef.focus())
    }
  })
</script>

<Overlay type="dialog" status={isOpen} width="max-w-[500px]">
  <Modal
    title={props.type === 'editing' ? 'Edición de agradecimiento' : 'Nuevo agradecimiento'}
    close={() => (isOpen = false)}
  >
    {#if isOpen}
      <form
        id="form-gratitude-ae"
        class=""
        method="POST"
        action={props.type === 'adding' ? '?/add' : '?/edit'}
        use:enhance={() => {
          toast.removeAll()
          overlayLoader.is = true
          return async ({ result }: { result: ActionResult }) => {
            // const sort = props.table.getState().sort
            // const filter = props.table.getState().filter
            await applyAction(result) /* Para que redirija en caso de no tener permiso */
            await invalidateAll()
            overlayLoader.is = false
            if ('data' in result && result.data?.error) {
              if (result.data?.error?.title) {
                titleErr = result.data.error.title
              }
              if (result.data?.error?.description) {
                descriptionErr = result.data.error.description
              }
              if (result.data?.error?.title || result.data?.error?.description) {
                toast.error('Por favor, corrige el formulario.', { closable: true })
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
            // refreshTable(props.table, sort, filter, props.search, props.rows)
          }
        }}
      >
        {#if props.type === 'editing'}
          <input type="hidden" name="id" value={props.data!.id} />
        {/if}
        <TextField
          bind:value={title}
          type="text"
          label="Título"
          name="title"
          variant="outlined"
          class="mb-6 w-full"
          error={titleErr.length > 0}
          errorText={titleErr}
          --np-outlined-text-field-label-text-color="var(--o-input-label-focus-color)"
          --np-outlined-text-field-focus-outline-color="var(--o-input-border-focus-color)"
          onfocus={() => {
            titleErr = ''
          }}
        >
          {#snippet end()}
            {#if titleErr}
              <Icon icon="mdi:alert-circle-outline" class="size-6 shrink-0" />
            {/if}
          {/snippet}
        </TextField>
        <TextField
          bind:value={description}
          bind:inputElement={descriptionRef}
          oninput={() => autoResize(descriptionRef)}
          class="w-full"
          error={descriptionErr.length > 0}
          errorText={descriptionErr}
          label="Descripción*"
          name="description"
          type="textarea"
          variant="outlined"
          --np-outlined-text-field-label-text-color="var(--o-input-label-focus-color)"
          --np-outlined-text-field-focus-outline-color="var(--o-input-border-focus-color)"
          onfocus={() => {
            descriptionErr = ''
          }}
        >
          {#snippet end()}
            {#if descriptionErr}
              <Icon icon="mdi:alert-circle-outline" class="size-6 shrink-0" />
            {/if}
          {/snippet}
        </TextField>
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
          form="form-gratitude-ae"
          variant="filled"
          class="text-center! text-base!"
          --np-filled-button-container-color="var(--o-btn-primary-bg-color)"
          --np-filled-button-container-shape="4px"
        >
          {props.type === 'editing' ? 'Editar' : 'Agregar'}
        </Button>
      </div>
    {/snippet}
  </Modal>
</Overlay>
