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
    isOpen: boolean
    table: any
    search: string
    rows: number
    id: string
    title: string
    permissions: {
      id: string
      path: string
      type: string
    }[]
  } = $props()
  let permissionId = $state('')
  let permissionIdErr = $state('')

  const missingPermissions = $derived(
    props.permissions.map((permission) => {
      return {
        name: `${permission.type} - ${permission.path}`,
        value: permission.id,
      }
    }),
  )
</script>

<Overlay type="dialog" isActive={isOpen} width="max-w-[500px]">
  <Modal title="Nuevaj relación con permiso" close={() => (isOpen = false)}>
    <form
      id="permission"
      class="space-y-4"
      method="POST"
      action="?/add"
      use:enhance={() => {
        toast.removeAll()
        overlayLoader.is = true
        return async ({ result }: { result: ActionResult }) => {
          const sort = props.table.getState().sort
          const filter = props.table.getState().filter
          await applyAction(result)
          overlayLoader.is = false
          if ('data' in result && result.data?.error) {
            if (result.data?.error?.permissionId) {
              permissionIdErr = result.data.error.permissionId
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
      <input type="hidden" name="roleId" value={props.id} />
      <section><b>Rol</b>: {props.title}.</section>
      <section>
        <Label for="type" class="mb-1 text-base" color={permissionIdErr ? 'red' : 'gray'}>
          Permiso
        </Label>
        <Select
          name="type"
          class="*:bg-white *:ring-(--o-input-border-focus-color)"
          color={permissionIdErr ? 'red' : 'default'}
          size="lg"
          items={missingPermissions}
          placeholder=""
          bind:value={permissionId}
          clearable
          onfocus={() => {
            permissionIdErr = ''
          }}
        />
        {#if permissionIdErr}
          <p in:fade class="mt-1 text-xs text-red-500">
            {permissionIdErr}
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
          form="permission"
          variant="filled"
          class="text-center! text-base!"
          --np-filled-button-container-color="var(--o-btn-primary-bg-color)"
          --np-filled-button-container-shape="4px"
        >
          Agregar
        </Button>
      </div>
    {/snippet}
  </Modal>
</Overlay>
