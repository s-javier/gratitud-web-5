<script lang="ts">
  import { fade } from 'svelte/transition'
  import type { ActionResult } from '@sveltejs/kit'
  import { page } from '$app/state'
  import { applyAction, enhance } from '$app/forms'
  import { Button } from 'noph-ui'
  import { Checkbox } from 'flowbite-svelte'
  import { toast } from 'svoast'
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
    row: {
      title: string
      rolePermissionId: string
    } | null
  } = $props()
  let title = $state('')
  let isConfirmed = $state(false)
  let isConfirmedErr = $state('')

  $effect(() => {
    if (props.row) {
      isConfirmed = false
      isConfirmedErr = ''
    }
  })

  $effect(() => {
    isConfirmedErr = isConfirmed ? '' : ''
  })
</script>

<Overlay type="dialog" isActive={isOpen} width="max-w-[500px]">
  <Modal title="Eliminación de relación con rol" close={() => (isOpen = false)}>
    <section class="mb-6">
      <p class="mb-2 text-base leading-relaxed text-gray-500 dark:text-gray-400">
        ¿Estás seguro de eliminar la relación con el rol <b>{title}</b>?
      </p>
      <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
        Considere que esta acción no se puede deshacer.
      </p>
    </section>
    <form
      id="permission-delete-relation-role"
      method="POST"
      action="?/delete-relation-role-permission"
      use:enhance={() => {
        toast.removeAll()
        overlayLoader.is = true
        return async ({ result }: { result: ActionResult }) => {
          const sort = props.table.getState().sort
          const filter = props.table.getState().filter
          await applyAction(result)
          overlayLoader.is = false
          if ('data' in result && result.data?.error) {
            if (result.data.error?.isConfirmed) {
              isConfirmedErr = result.data.error.isConfirmed
              toast.error('Por favor, corrige el error.', { closable: true })
            } else if (result.data.error?.rolePermissionId) {
              toast.error('Hubo un error. Por favor, recarga la página para corregirlo.', {
                closable: true,
              })
            }
            if (result.data.error.server) {
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
      <input type="hidden" name="path" value={page.url.pathname} />
      <section class="rounded-sm border {isConfirmedErr ? 'border-red-400' : 'border-gray-300'}">
        <Checkbox
          name="isConfirmed"
          bind:checked={isConfirmed}
          value="true"
          divClass="w-full p-4"
          class="size-5 text-(--o-btn-primary-bg-hover-color)! focus:ring-(--o-btn-primary-bg-hover-color)!"
        >
          Confirmo que deseo eliminar la relación.
        </Checkbox>
      </section>
      {#if isConfirmedErr}
        <p in:fade class="text-sm text-red-500">{isConfirmedErr}</p>
      {/if}
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
          form="permission-delete-relation-role"
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
