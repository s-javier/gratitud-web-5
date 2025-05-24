<script lang="ts">
  import { tick } from 'svelte'
  import { fade } from 'svelte/transition'
  import type { ActionResult } from '@sveltejs/kit'
  import { page } from '$app/state'
  import { applyAction, enhance } from '$app/forms'
  import { Button } from 'noph-ui'
  import { ExclamationCircleSolid } from 'flowbite-svelte-icons'
  import { Input, Label } from 'flowbite-svelte'
  import { toast } from 'svoast'
  import { XMark } from 'svelte-heros-v2'
  import { overlayLoader } from '~/stores/loader.svelte'
  import Overlay from '~/components/Overlay.svelte'
  import Modal from '~/components/Modal.svelte'
  import refreshTable from '~/lib/refresh-table'

  let {
    isOpen = $bindable(),
    ...props
  }: {
    isOpen: boolean
    table: any
    search: string
    rows: number
    row?: {
      id: string
      /* ↓ menupage. */
      menupageId: string
      menupageTitle: string
    } | null
  } = $props()
  let title = $state('')
  let titleErr = $state('')
  let titleRef = $state() as HTMLInputElement

  $effect(() => {
    if (props.row) {
      title = props.row.menupageTitle
    }
  })

  $effect(() => {
    if (isOpen) {
      tick().then(() => titleRef.focus())
    }
  })
</script>

<Overlay type="dialog" isActive={isOpen} width="max-w-[500px]">
  <Modal title="Edición de menú" close={() => (isOpen = false)}>
    <form
      id="edit-menu"
      method="POST"
      action="?/edit-menu"
      use:enhance={() => {
        toast.removeAll()
        overlayLoader.is = true
        return async ({ result }: { result: ActionResult }) => {
          const sort = props.table.getState().sort
          const filter = props.table.getState().filter
          await applyAction(result)
          overlayLoader.is = false
          if ('data' in result && result.data?.error) {
            if (result.data?.error?.title) {
              titleErr = result.data.error.title
              toast.error('Por favor, corrige el error.', { closable: true })
            }
            if (result.data?.error?.server) {
              toast.error(result.data.error.server, { closable: true, infinite: true })
            }
            return
          }
          isOpen = false
          refreshTable(props.table, sort, filter, props.search, props.rows)
        }
      }}
    >
      <input type="hidden" name="permissionId" value={props.row?.id || ''} />
      <input type="hidden" name="menupageId" value={props.row?.menupageId || ''} />
      <input type="hidden" name="path" value={page.url.pathname} />
      <section>
        <Label for="title" class="mb-1 text-base" color={titleErr ? 'red' : 'gray'}>
          Título de menú
        </Label>
        <Input
          type="text"
          id="title"
          name="menupageTitle"
          size="lg"
          color={titleErr ? 'red' : 'default'}
        >
          {#snippet children(props)}
            <input
              {...props}
              bind:this={titleRef}
              bind:value={title}
              class="{props.class} bg-white ring-(--o-input-border-focus-color)"
              onfocus={() => {
                titleErr = ''
              }}
            />
          {/snippet}
          {#snippet right()}
            {#if titleErr}
              <ExclamationCircleSolid class="size-6 text-red-400" />
            {:else if title.length > 0}
              <button
                type="button"
                class="flex size-6 items-center justify-center rounded-md hover:bg-slate-200 hover:text-(--o-btn-primary-bg-color)"
                onclick={() => {
                  title = ''
                }}
              >
                <XMark class="size-5 shrink-0 cursor-pointer" />
              </button>
            {/if}
          {/snippet}
        </Input>
        {#if titleErr}
          <p in:fade class="mt-1 text-xs text-red-500">
            {titleErr}
          </p>
        {/if}
      </section>
    </form>
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
          form="edit-menu"
          variant="filled"
          class="text-center! text-base!"
          --np-filled-button-container-color="var(--o-btn-primary-bg-color)"
          --np-filled-button-container-shape="4px"
        >
          Editar
        </Button>
      </div>
    {/snippet}
  </Modal>
</Overlay>
