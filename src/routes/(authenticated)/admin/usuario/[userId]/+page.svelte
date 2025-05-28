<script lang="ts">
  import { onMount, type SvelteComponent } from 'svelte'
  import { fade } from 'svelte/transition'
  import { toast } from 'svoast'
  // @ts-ignore
  import { Grid } from 'wx-svelte-grid'
  // @ts-ignore
  import { ActionMenu } from 'wx-svelte-menu'
  import { Input } from 'flowbite-svelte'
  import { Button } from 'noph-ui'
  import { MagnifyingGlass, XMark } from 'svelte-heros-v2'
  import TableMenuButton from '~/components/TableMenuButton.svelte'
  import filterAllTableByText from '~/lib/filter-all-table-by-text'
  import RelationAdd from './RelationAdd.svelte'
  import RelationDelete from './RelationDelete.svelte'
  import StatusCell from '~/components/StatusCell.svelte'

  let Material: typeof SvelteComponent | null = $state(null)
  let { data }: any = $props()
  let table: any = $state()
  let search = $state('')
  let isAdding = $state(false)
  let isDeletingRelation = $state(false)
  let row = $state(null)
  let filteredRows = $state(0)

  onMount(async () => {
    // @ts-ignore
    const module = await import('wx-svelte-grid')
    Material = module.Material
  })

  $effect(() => {
    if ('error' in data && data.error?.server) {
      toast.error(data.error.server, { closable: true, infinite: true })
    }
  })

  $effect(() => {
    filterAllTableByText(
      table,
      search,
      data?.userAndOrganizationsAndRoles?.organizationsAndRoles?.length ?? 0,
    )
  })

  const initTable = (api: any) => {
    api.getReactiveState().flatData.subscribe((value: any) => {
      filteredRows = value.length
    })
  }

  const columns = [
    {
      id: 'organizationTitle',
      header: [
        'Organización',
        {
          filter: {
            type: 'text',
            config: {
              icon: 'wxi-search', // Optional icon for the filter input
              clear: true, // Allow clearing the input
            },
          },
        },
      ],
      sort: true,
    },
    {
      id: 'roleTitle',
      header: [
        'Rol',
        {
          filter: {
            type: 'text',
            config: {
              icon: 'wxi-search', // Optional icon for the filter input
              clear: true, // Allow clearing the input
            },
          },
        },
      ],
      sort: true,
    },
    {
      id: 'isSelected',
      // header: ['Activa?', { css: 'flex justify-center' }],
      header: [
        'Seleccionado',
        {
          filter: {
            type: 'richselect',
            config: {
              // template: (option: any) => {
              //   return option.label ? 'Activaa' : 'Inactivaa'
              // },
              options: [
                { id: 'active', label: 'Sí' },
                { id: 'inactive', label: 'No' },
              ],
              handler: (value: boolean, filter: string) => {
                if (!filter) {
                  return true
                }
                return (
                  (value === true && filter === 'active') ||
                  (value === false && filter === 'inactive')
                )
              },
            },
          },
        },
      ],
      width: 120,
      sort: true,
      cell: StatusCell,
      template: (option: any) => {
        return option.isSelected ? 'Sí' : 'No'
      },
    },
    {
      id: 'menu',
      header: '',
      width: 60,
      cell: TableMenuButton,
    },
  ]
</script>

<section class="flex items-center justify-between">
  <h1 class="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">
    Organizaciones y roles
  </h1>
  <Button
    type="button"
    form="organization-edit"
    variant="filled"
    class="text-center! text-sm!"
    --np-filled-button-container-color="var(--o-btn-primary-bg-color)"
    --np-filled-button-container-shape="4px"
    --np-filled-button-container-height="32px"
    onclick={() => (isAdding = true)}
  >
    Agregar
  </Button>
</section>
<hr
  role="presentation"
  class="mt-6 mb-10 w-full border-t border-zinc-950/10 dark:border-white/10"
/>

<section class="mb-10 overflow-hidden bg-white shadow-sm sm:rounded-lg">
  <div class="border-t border-gray-100">
    <dl class="divide-y divide-gray-100">
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt class="text-sm font-medium text-gray-900">ID</dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
          {data?.userAndOrganizationsAndRoles?.id || 'Hubo un error'}
        </dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt class="text-sm font-medium text-gray-900">Nombre(s)</dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
          {data?.userAndOrganizationsAndRoles?.firstName || 'Hubo un error'}
        </dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt class="text-sm font-medium text-gray-900">Apellido(s)</dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
          {data?.userAndOrganizationsAndRoles?.lastName || 'Sin apellido(s)'}
        </dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt class="text-sm font-medium text-gray-900">Email</dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
          {data?.userAndOrganizationsAndRoles?.email || 'Hubo un error'}
        </dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt class="text-sm font-medium text-gray-900">Estado</dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
          {data?.userAndOrganizationsAndRoles?.isActive ? 'Activo' : 'Inactivo'}
        </dd>
      </div>
    </dl>
  </div>
</section>

<section class="items-top mb-4 flex justify-between">
  <div class="text-sm text-gray-500">
    <p>
      {data?.userAndOrganizationsAndRoles?.organizationsAndRoles?.length === 1
        ? 'Existe'
        : 'Existen'}
      {data?.userAndOrganizationsAndRoles?.organizationsAndRoles?.length ?? 0}
      {data?.userAndOrganizationsAndRoles?.organizationsAndRoles?.length === 1
        ? 'relación'
        : 'relaciones'}.
    </p>
    {#if table && filteredRows < data?.userAndOrganizationsAndRoles?.organizationsAndRoles?.length}
      <p transition:fade>
        Estás viendo {filteredRows}
        {filteredRows === 1 ? 'relación' : 'relaciones'}.
      </p>
    {/if}
  </div>
  <div class="w-full max-w-[300px]">
    <Input
      bind:value={search}
      type="text"
      placeholder="Búsqueda en tabla"
      class="bg-white! px-9 ring-(--o-input-border-focus-color)"
    >
      {#snippet left()}
        <MagnifyingGlass class="size-5 shrink-0 text-gray-400" />
      {/snippet}
      {#snippet right()}
        {#if search.length > 0}
          <div transition:fade>
            <button
              class="flex size-6 cursor-pointer items-center justify-center rounded-md hover:bg-slate-200 hover:text-(--o-btn-primary-bg-color)"
              onclick={() => {
                search = ''
              }}
            >
              <XMark class="size-5 shrink-0" />
            </button>
          </div>
        {/if}
      {/snippet}
    </Input>
  </div>
</section>

<div class="flex h-[65vh] justify-center">
  {#if Material}
    <!-- ↓ dataKey vincula al elemento que gatilla el menú -->
    <!-- ↓ resolver alimenta el "context" que se obtiene en el onclick -->
    <Material>
      <ActionMenu
        at="bottom"
        options={[
          {
            id: 'delete-relation',
            text: 'Eliminar relación',
            icon: 'wxi wxi-delete',
            css: 'text-red-500 force-text-inherit',
          },
        ]}
        dataKey="actionId"
        resolver={(row: string) => row}
        onclick={(event: any) => {
          if (event.action?.id === 'delete-relation') {
            row = JSON.parse(event.context)
            isDeletingRelation = true
          } else {
            row = null
          }
        }}
        api={table}
      >
        <Grid
          init={initTable}
          bind:this={table}
          data={data?.userAndOrganizationsAndRoles?.organizationsAndRoles || []}
          {columns}
          rowStyle={(row: any) => 'hover:bg-gray-100!'}
          columnStyle={(col: any) => (col.id === 'isActive' ? 'text-center' : '')}
        />
      </ActionMenu>
    </Material>
  {:else}
    <div class="flex h-full items-center justify-center">Cargando...</div>
  {/if}
</div>

<RelationAdd
  bind:isOpen={isAdding}
  {table}
  {search}
  rows={data?.userAndOrganizationsAndRoles?.organizationsAndRoles?.length ?? 0}
  id={data?.userAndOrganizationsAndRoles?.id}
  firstName={data?.userAndOrganizationsAndRoles?.firstName}
  lastName={data?.userAndOrganizationsAndRoles?.lastName}
  email={data?.userAndOrganizationsAndRoles?.email}
  isActive={data?.userAndOrganizationsAndRoles?.isActive}
  relations={data?.userAndOrganizationsAndRoles?.missingOrganizationsAndRoles}
/>
<RelationDelete
  bind:isOpen={isDeletingRelation}
  {table}
  {search}
  rows={data?.userAndOrganizationsAndRoles?.organizationsAndRoles?.length ?? 0}
  {row}
/>
