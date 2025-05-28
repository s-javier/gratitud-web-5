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
    firstName: string
    lastName: string
    email: string
    isActive: boolean
    relations: {
      organizationId: string
      organizationTitle: string
      roleId: string
      roleTitle: string
    }[]
  } = $props()
  let organizationId = $state('')
  let roleId = $state('')
  let relationErr = $state('')

  const missingRelations = $derived(
    props.relations.map((relation) => {
      return {
        label: `${relation.organizationTitle} - ${relation.roleTitle}`,
        value: `${relation.organizationId} - ${relation.roleId}`,
        organizationId: relation.organizationId,
        roleId: relation.roleId,
      }
    }),
  )
  const selectedValue = $derived(
    missingRelations.find((i) => i.value === `${organizationId} - ${roleId}`)?.label,
  )

  $effect(() => {
    if (open) {
      relationErr = ''
    }
  })
</script>

<Overlay type="dialog" isActive={isOpen} width="max-w-[500px]">
  <Modal title="Nueva relación con organización y rol" close={() => (isOpen = false)}>
    <section class="mb-4">
      <p><b>Nombre(s)</b>: {props.firstName}.</p>
      <p><b>Apellido(s)</b>: {props.lastName}.</p>
      <p><b>Email</b>: {props.email}.</p>
      <p><b>Estado</b>: {props.isActive ? 'Activo' : 'Inactivo'}.</p>
    </section>
    <form
      id="add-relation"
      class="space-y-4"
      method="POST"
      action="?/add-relation"
      use:enhance={() => {
        toast.removeAll()
        overlayLoader.is = true
        return async ({ result }: { result: ActionResult }) => {
          const sort = props.table.getState().sort
          const filter = props.table.getState().filter
          await applyAction(result)
          overlayLoader.is = false
          if ('data' in result && result.data?.error) {
            if (result.data.error.organizationId || result.data.error.roleId) {
              relationErr = result.data.error.organizationId || result.data.error.roleId
              toast.error('Por favor, corrige el formulario.', { closable: true })
            } else if (result.data.error.pathToRedirect) {
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
      <input type="hidden" name="userId" value={props.id} />
      <input type="hidden" name="organizationId" value={organizationId} />
      <input type="hidden" name="roleId" value={roleId} />
      <input type="hidden" name="path" value={page.url.pathname} />
      <section>
        <Label for="type" class={cn('mb-1 text-base', relationErr && 'text-red-500')}>
          Organización - Rol
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
                  relationErr && 'border-red-500',
                )}
                aria-expanded={open}
              >
                <div>
                  {selectedValue || ''}
                </div>
                <div class="flex items-center gap-x-2">
                  {#if relationErr !== ''}
                    <button
                      type="button"
                      class="flex size-6 items-center justify-center rounded-md hover:bg-slate-200 hover:text-(--o-btn-primary-bg-color)"
                      onclick={(e) => {
                        e.stopPropagation()
                        organizationId = ''
                        roleId = ''
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
                  {#each missingRelations as item}
                    <Command.Item
                      value={item.label}
                      onSelect={() => {
                        organizationId = item.organizationId
                        roleId = item.roleId
                        closeAndFocusTrigger()
                      }}
                    >
                      <CheckIcon
                        class={cn('mr-2 size-4', relationErr !== item.value && 'text-transparent')}
                      />
                      {item.label}
                    </Command.Item>
                  {/each}
                </Command.Group>
              </Command.List>
            </Command.Root>
          </Popover.Content>
        </Popover.Root>
        {#if relationErr}
          <p in:fade class="mt-1 text-xs text-red-500">
            {relationErr}
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
          form="add-relation"
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
