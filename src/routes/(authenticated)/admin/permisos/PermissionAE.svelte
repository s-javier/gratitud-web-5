<script lang="ts">
  import { tick } from 'svelte'
  import { fade } from 'svelte/transition'
  import type { ActionResult } from '@sveltejs/kit'
  import { applyAction, enhance } from '$app/forms'
  import { Button } from 'noph-ui'
  import { ExclamationCircleSolid } from 'flowbite-svelte-icons'
  import { Input, Label, Select } from 'flowbite-svelte'
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
      path: string
      type: string
    } | null
  } = $props()
  let path = $state('')
  let pathErr = $state('')
  let pathRef = $state() as HTMLInputElement
  let permissionType = $state('')
  let permissionTypeErr = $state('')

  $effect(() => {
    if (props.row && props.type === 'editing') {
      path = props.row!.path
      permissionType = props.row!.type
    }
  })

  $effect(() => {
    if (isOpen && props.type === 'adding') {
      tick().then(() => pathRef.focus())
    }
  })
</script>

<Overlay type="dialog" isActive={isOpen} width="max-w-[500px]">
  <Modal
    title={props.type === 'editing' ? 'Edición de permiso' : 'Nuevo permiso'}
    close={() => (isOpen = false)}
  >
    {#if isOpen === true}
      <form
        id="permission"
        class="space-y-4"
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
              if (result.data?.error?.path) {
                pathErr = result.data.error.path
              }
              if (result.data?.error?.type) {
                permissionTypeErr = result.data.error.type
              }
              if (result.data?.error?.path || result.data?.error?.type) {
                toast.error('Por favor, corrige el formulario.', { closable: true })
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
          <input type="hidden" name="permissionId" value={props.row!.id} />
        {/if}
        <section>
          <Label for="path" class="mb-1 text-base" color={pathErr ? 'red' : 'gray'}>Ruta</Label>
          <Input type="text" id="path" name="path" size="lg" color={pathErr ? 'red' : 'default'}>
            {#snippet children(props)}
              <input
                {...props}
                bind:this={pathRef}
                bind:value={path}
                class="{props.class} bg-white ring-(--o-input-border-focus-color)"
                onfocus={() => {
                  pathErr = ''
                }}
              />
            {/snippet}
            {#snippet right()}
              {#if pathErr}
                <ExclamationCircleSolid class="size-6 text-red-400" />
              {:else if path.length > 0}
                <button
                  type="button"
                  class="flex size-6 items-center justify-center rounded-md hover:bg-slate-200 hover:text-(--o-btn-primary-bg-color)"
                  onclick={() => {
                    path = ''
                  }}
                >
                  <XMark class="size-5 shrink-0 cursor-pointer" />
                </button>
              {/if}
            {/snippet}
          </Input>
          {#if pathErr}
            <p in:fade class="mt-1 text-xs text-red-500">
              {pathErr}
            </p>
          {/if}
        </section>
        <section>
          <Label for="type" class="mb-1 text-base" color={permissionTypeErr ? 'red' : 'gray'}
            >Tipo</Label
          >
          <Select
            name="type"
            class="*:bg-white *:ring-(--o-input-border-focus-color)"
            color={permissionTypeErr ? 'red' : 'default'}
            size="lg"
            items={[
              { name: 'API', value: 'api' },
              { name: 'Vista', value: 'view' },
            ]}
            placeholder=""
            bind:value={permissionType}
            clearable
            onfocus={() => {
              permissionTypeErr = ''
            }}
          />
          {#if permissionTypeErr}
            <p in:fade class="mt-1 text-xs text-red-500">
              {permissionTypeErr}
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
          form="permission"
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
