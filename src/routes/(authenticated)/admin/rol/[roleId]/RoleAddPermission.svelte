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
    id: string
    title: string
    permissions: {
      id: string
      path: string
      type: string
    }[]
  } = $props()
  let permissionId = $state('')
  let permissionType = $state('')
  let permissionIdErr = $state('')
  let sort = $state(0)
  let sortErr = $state('')

  const missingPermissions = $derived(
    props.permissions.map((permission) => {
      return {
        label: `${permission.type === 'view' ? 'Vista' : 'API'} - ${permission.path}`,
        value: permission.id,
        type: permission.type,
      }
    }),
  )
  const selectedValue = $derived(missingPermissions.find((i) => i.value === permissionId)?.label)

  $effect(() => {
    if (open) {
      permissionIdErr = ''
    }
  })
</script>

<Overlay type="dialog" isActive={isOpen} width="max-w-[500px]">
  <Modal title="Nueva relación con permiso" close={() => (isOpen = false)}>
    <section class="mb-4">
      <p><b>Rol</b>: {props.title}.</p>
    </section>
    <form
      id="role-relation-permission"
      class="space-y-4"
      method="POST"
      action="?/add-relation-role-permission"
      use:enhance={() => {
        toast.removeAll()
        overlayLoader.is = true
        return async ({ result }: { result: ActionResult }) => {
          const sort = props.table.getState().sort
          const filter = props.table.getState().filter
          await applyAction(result)
          overlayLoader.is = false
          if ('data' in result && result.data?.error) {
            if (result.data.error.permissionId) {
              permissionIdErr = result.data.error.permissionId
            }
            if (result.data.error.sort) {
              sortErr = result.data.error.sort
            }
            if (result.data.error.permissionId || result.data.error.sort) {
              toast.error('Por favor, corrige el formulario.', { closable: true })
            } else if (result.data.error.permissionType || result.data.error.pathToRedirect) {
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
      <input type="hidden" name="roleId" value={props.id} />
      <input type="hidden" name="permissionId" value={permissionId} />
      <input type="hidden" name="path" value={page.url.pathname} />
      <input type="hidden" name="permissionType" value={permissionType} />
      <section>
        <Label for="type" class={cn('mb-1 text-base', permissionIdErr && 'text-red-500')}>
          Permiso
        </Label>
        <Popover.Root bind:open>
          <Popover.Trigger bind:ref={triggerRef}>
            {#snippet child({ props })}
              <div
                {...props}
                class={cn(
                  'mb-0 flex min-h-12.5 items-center justify-between',
                  'rounded-lg border-1 border-gray-300 py-3 pr-3 pl-4',
                  open && 'border-(--o-input-border-focus-color)',
                  permissionIdErr && 'border-red-500',
                )}
                aria-expanded={open}
              >
                <div>
                  {selectedValue || ''}
                </div>
                <div class="flex items-center gap-x-2">
                  {#if permissionId !== ''}
                    <button
                      type="button"
                      class="flex size-6 items-center justify-center rounded-md hover:bg-slate-200 hover:text-(--o-btn-primary-bg-color)"
                      onclick={(e) => {
                        e.stopPropagation()
                        permissionId = ''
                        permissionType = ''
                        open = false
                      }}
                    >
                      <XMark class="size-5 shrink-0 cursor-pointer" />
                    </button>
                  {/if}
                  <!-- <ChevronsUpDownIcon class="opacity-50"  /> -->
                </div>
              </div>
            {/snippet}
          </Popover.Trigger>
          <Popover.Content class="z-1400 w-full p-0">
            <Command.Root>
              <Command.Input
                placeholder="Buscar permiso..."
                class="border-none focus:border-none focus:ring-0"
              />
              <Command.List>
                <Command.Empty>Permiso no encontrado.</Command.Empty>
                <Command.Group>
                  {#each missingPermissions as item}
                    <Command.Item
                      value={item.label}
                      onSelect={() => {
                        permissionId = item.value
                        permissionType = item.type
                        closeAndFocusTrigger()
                      }}
                    >
                      <CheckIcon
                        class={cn('mr-2 size-4', permissionId !== item.value && 'text-transparent')}
                      />
                      {item.label}
                    </Command.Item>
                  {/each}
                </Command.Group>
              </Command.List>
            </Command.Root>
          </Popover.Content>
        </Popover.Root>
        {#if permissionIdErr}
          <p in:fade class="mt-1 text-xs text-red-500">
            {permissionIdErr}
          </p>
        {/if}
      </section>
      {#if permissionType === 'view'}
        <section in:fade>
          <Label for="sort" class="mb-1 text-base" color={sortErr ? 'red' : 'gray'}>Orden</Label>
          <Input type="number" id="sort" name="sort" size="lg" color={sortErr ? 'red' : 'default'}>
            {#snippet children(props)}
              <input
                {...props}
                bind:value={sort}
                class={cn(
                  props.class,
                  'bg-white ring-(--o-input-border-focus-color)',
                  sortErr && 'pr-10',
                )}
                onfocus={() => {
                  sortErr = ''
                }}
              />
            {/snippet}
            {#snippet right()}
              {#if sortErr}
                <ExclamationCircleSolid class="size-6 text-red-400" />
              {/if}
            {/snippet}
          </Input>
          {#if sortErr}
            <p in:fade class="mt-1 text-xs text-red-500">
              {sortErr}
            </p>
          {/if}
        </section>
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
          form="role-relation-permission"
          variant="filled"
          class="text-center! text-base!"
          --np-filled-button-container-color="var(--o-btn-primary-bg-color)"
          --np-filled-button-container-shape="4px"
        >
          Vincular
        </Button>
      </div>
    {/snippet}
  </Modal>
</Overlay>
