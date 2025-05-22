<script lang="ts">
  import { onMount, type SvelteComponent } from 'svelte'
  import { fade } from 'svelte/transition'
  import { goto } from '$app/navigation'
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
  import { Page } from '~/enums'
  import PermissionDeleteRelation from './PermissionDeleteRelation.svelte'
  import RoleAddPermission from './RoleAddPermission.svelte'

  let Material: typeof SvelteComponent | null = $state(null)
  let { data }: any = $props()
  let table: any = $state()
  let search = $state('')
  let isAdding = $state(false)
  let isDeleting = $state(false)
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
    filterAllTableByText(table, search, data?.roleAndPermissions?.permissions?.length ?? 0)
  })

  const initTable = (api: any) => {
    api.getReactiveState().flatData.subscribe((value: any) => {
      filteredRows = value.length
    })
  }

  const columns = [
    // {
    //   id: 'id',
    //   header: 'ID',
    //   // footer: 'ID',
    //   width: 300,
    // },
    {
      id: 'path',
      header: [
        'Ruta',
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
      width: 320,
      sort: true,
    },
    {
      id: 'type',
      header: [
        'Tipo',
        {
          filter: {
            type: 'richselect',
            config: {
              // template: (option: any) => {
              //   return option.label ? 'Activa' : 'Inactiva'
              // },
              options: [
                { id: 'api', label: 'API' },
                { id: 'view', label: 'Vista' },
              ],
              handler: (value: string, filter: string) => {
                if (!filter) {
                  return true
                }
                return (
                  (value === 'api' && filter === 'api') || (value === 'view' && filter === 'view')
                )
              },
            },
          },
        },
      ],
      width: 90,
      sort: true,
      template: (type: string) => (type ? (type === 'api' ? 'API' : 'Vista') : ''),
    },
    {
      id: 'sort',
      header: 'Orden',
      width: 70,
      sort: true,
    },
    {
      id: 'menupageTitle',
      header: 'Menú',
      width: 150,
      sort: true,
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
    Rol: {data?.roleAndPermissions?.title || 'Hubo un error'}
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
    Vincular a permiso
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
          {data?.roleAndPermissions?.id || 'Hubo un error'}
        </dd>
      </div>
      <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
        <dt class="text-sm font-medium text-gray-900">Rol</dt>
        <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
          {data?.roleAndPermissions?.title || 'Hubo un error'}
        </dd>
      </div>
    </dl>
  </div>
</section>

<section class="items-top mb-4 flex justify-between">
  <div class="text-sm text-gray-500">
    <p>
      {data?.roleAndPermissions?.permissions?.length === 1 ? 'Existe' : 'Existen'}
      {data?.roleAndPermissions?.permissions?.length ?? 0}
      {data?.roleAndPermissions?.permissions?.length === 1 ? 'permiso' : 'permisos'}.
    </p>
    {#if table && filteredRows < data?.roleAndPermissions?.permissions?.length}
      <p transition:fade>
        Estás viendo {filteredRows}
        {filteredRows === 1 ? 'permiso' : 'permisos'}.
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
              class="flex size-6 items-center justify-center rounded-md hover:bg-slate-200 hover:text-(--o-btn-primary-bg-color)"
              onclick={() => {
                search = ''
              }}
            >
              <XMark class="size-5 shrink-0 cursor-pointer" />
            </button>
          </div>
        {/if}
      {/snippet}
    </Input>
  </div>
</section>

<div class="flex h-[60%] justify-center">
  {#if Material}
    <!-- ↓ dataKey vincula al elemento que gatilla el menú -->
    <!-- ↓ resolver alimenta el "context" que se obtiene en el onclick -->
    <Material>
      <ActionMenu
        options={[
          {
            id: 'edit-menu',
            text: 'Editar menú',
            icon: 'wxi wxi-edit',
            css: 'text-green-600 force-text-inherit',
          },
          {
            id: 'delete-menu',
            text: 'Eliminar menú',
            icon: 'wxi wxi-delete',
            css: 'text-red-500 force-text-inherit',
          },
          {
            id: 'delete-relation',
            text: 'Eliminar relación',
            icon: 'wxi wxi-delete',
            css: 'text-red-500 force-text-inherit',
          },
        ]}
        at="point"
        dataKey="actionId"
        resolver={(row: string) => row}
        onclick={(event: any) => {
          if (event.action?.id === 'permissions') {
            goto(`${Page.ADMIN_ROLE}/${JSON.parse(event.context).id}`)
          } else if (event.action?.id === 'delete') {
            row = JSON.parse(event.context)
            isDeleting = true
          } else {
            row = null
          }
        }}
        api={table}
      >
        <Grid
          init={initTable}
          bind:this={table}
          data={data?.roleAndPermissions?.permissions || []}
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

<PermissionDeleteRelation
  bind:isOpen={isDeleting}
  {table}
  {search}
  rows={data?.roleAndPermissions?.permissions?.length ?? 0}
  {row}
/>
<RoleAddPermission
  bind:isOpen={isAdding}
  {table}
  {search}
  rows={data?.roleAndPermissions?.permissions?.length ?? 0}
  id={data?.roleAndPermissions?.id}
  title={data?.roleAndPermissions?.title}
  permissions={data?.roleAndPermissions?.missingPermissions}
/>
