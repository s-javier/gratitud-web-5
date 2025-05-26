<script lang="ts">
  import { tick } from 'svelte'
  import { fade } from 'svelte/transition'
  import type { ActionResult } from '@sveltejs/kit'
  import { page } from '$app/state'
  import { applyAction, enhance } from '$app/forms'
  import { Button } from 'noph-ui'
  import { Input, Label } from 'flowbite-svelte'
  import { ExclamationCircleSolid } from 'flowbite-svelte-icons'
  import { toast } from 'svoast'
  import { XMark } from 'svelte-heros-v2'
  import { overlayLoader } from '~/stores/loader.svelte'
  import Overlay from '~/components/Overlay.svelte'
  import Modal from '~/components/Modal.svelte'
  import refreshTable from '~/lib/refresh-table'

  import CheckIcon from '@lucide/svelte/icons/check'
  // import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down'
  import * as Command from '~/components/ui/command'
  import * as Popover from '~/components/ui/popover'
  import { cn } from '~/lib/utils'

  let open = $state(false)
  let triggerRef = $state<HTMLButtonElement>(null!)

  function closeAndFocusTrigger() {
    open = false
    tick().then(() => {
      triggerRef.focus()
    })
  }

  let {
    isOpen = $bindable(),
    ...props
  }: {
    isOpen: boolean
    table: any
    search: string
    rows: number
    roleTitle: string
    row?: {
      rolePermissionId: string
      path: string
      type: string
      sort: number
    } | null
  } = $props()
  let order = $state(0)
  let orderErr = $state('')

  const position = $derived(
    props.row && props.row.type === 'view'
      ? 'justify-start items-end'
      : 'justify-center items-center',
  )

  $effect(() => {
    if (props.row) {
      order = props.row.sort
    }
  })
</script>

<Overlay type="dialog" isActive={isOpen} width="max-w-[500px]" {position}>
  <Modal title="Orden de vista" close={() => (isOpen = false)}>
    <section class="mb-4">
      <p><b>Rol</b>: {props.roleTitle}.</p>
      <p><b>Ruta de permiso</b>: {props.row?.path}.</p>
      <p><b>Tipo de permiso</b>: {props.row?.type === 'view' ? 'vista' : 'API'}.</p>
    </section>
    <form
      id="edit-role-permission-order"
      class="space-y-4"
      method="POST"
      action="?/edit-role-permission-order"
      use:enhance={() => {
        toast.removeAll()
        overlayLoader.is = true
        return async ({ result }: { result: ActionResult }) => {
          const sort = props.table.getState().sort
          const filter = props.table.getState().filter
          await applyAction(result)
          overlayLoader.is = false
          if ('data' in result && result.data?.error) {
            if (result.data.error.order) {
              orderErr = result.data.error.order
              toast.error('Por favor, corrige el formulario.', { closable: true })
            } else if (
              result.data.error.rolePermissionId ||
              result.data.error.permissionType ||
              result.data.error.pathToRedirect
            ) {
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
          refreshTable(props.table, sort, filter, props.search, props.rows)
        }
      }}
    >
      <input type="hidden" name="rolePermissionId" value={props.row?.rolePermissionId} />
      <input type="hidden" name="permissionType" value={props.row?.type} />
      <input type="hidden" name="path" value={page.url.pathname} />
      <section in:fade>
        <Label for="order" class="mb-1 text-base" color={orderErr ? 'red' : 'gray'}>Orden</Label>
        <Input type="number" id="order" name="order" size="lg" color={orderErr ? 'red' : 'default'}>
          {#snippet children(props)}
            <input
              {...props}
              bind:value={order}
              class={cn(
                props.class,
                'bg-white ring-(--o-input-border-focus-color)',
                orderErr && 'pr-10',
              )}
              onfocus={() => {
                orderErr = ''
              }}
            />
          {/snippet}
          {#snippet right()}
            {#if orderErr}
              <ExclamationCircleSolid class="size-6 text-red-400" />
            {/if}
          {/snippet}
        </Input>
        {#if orderErr}
          <p in:fade class="mt-1 text-xs text-red-500">
            {orderErr}
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
          form="edit-role-permission-order"
          variant="filled"
          class="text-center! text-base!"
          --np-filled-button-container-color="var(--o-btn-primary-bg-color)"
          --np-filled-button-container-shape="4px"
        >
          Guardar
        </Button>
      </div>
    {/snippet}
  </Modal>
</Overlay>
