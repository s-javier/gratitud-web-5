<script lang="ts">
  import { tick } from 'svelte'
  import { fade } from 'svelte/transition'
  import type { ActionResult } from '@sveltejs/kit'
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
    type: string
    isOpen: boolean
    table: any
    search: string
    rows: number
    row?: {
      id: string
      title: string
    } | null
  } = $props()
  let title = $state('')
  let titleErr = $state('')
  let titleRef = $state() as HTMLInputElement

  $effect(() => {
    if (props.row && props.type === 'editing') {
      title = props.row!.title
    }
  })

  $effect(() => {
    if (isOpen && props.type === 'adding') {
      tick().then(() => titleRef.focus())
    }
  })
</script>

<Overlay type="dialog" isActive={isOpen} width="max-w-[500px]">
  <Modal
    title={props.type === 'editing' ? 'Edición de rol' : 'Nuevo rol'}
    close={() => (isOpen = false)}
  >
    {#if isOpen === true}
      <form
        id="role"
        method="POST"
        action={props.type === 'adding' ? '?/add' : '?/edit'}
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
        {#if props.type === 'editing'}
          <input type="hidden" name="roleId" value={props.row!.id} />
        {/if}
        <section>
          <Label for="title" class="mb-1 text-base" color={titleErr ? 'red' : 'gray'}>Título</Label>
          <Input type="text" id="title" name="title" size="lg" color={titleErr ? 'red' : 'default'}>
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
          form="role"
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
