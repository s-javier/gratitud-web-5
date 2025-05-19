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
  import RoleAE from './RoleAE.svelte'
  import RoleDelete from './RoleDelete.svelte'
  import { Page } from '~/enums'

  let Material: typeof SvelteComponent | null = $state(null)
  let { data }: any = $props()
  let table: any = $state()
  let search = $state('')
  let isAdding = $state(false)
  let isEditing = $state(false)
  let isDeleting = $state(false)
  let row = $state(null)

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
    filterAllTableByText(table, search, data?.roles?.length ?? 0)
  })

  const columns = [
    {
      id: 'id',
      header: 'ID',
      // footer: 'ID',
      width: 300,
    },
    {
      id: 'title',
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
      id: 'menu',
      header: '',
      width: 60,
      cell: TableMenuButton,
    },
  ]
</script>

<section class="flex items-center justify-between">
  <h1 class="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">Roles</h1>
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

<div class="mb-4 flex justify-end">
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
</div>

<div class="flex h-[60%] justify-center">
  {#if Material}
    <!-- ↓ dataKey vincula al elemento que gatilla el menú -->
    <!-- ↓ resolver alimenta el "context" que se obtiene en el onclick -->
    <Material>
      <ActionMenu
        options={[
          {
            id: 'permissions',
            text: 'Permisos',
            icon: 'wxi wxi-eye',
            css: 'text-blue-500 force-text-inherit',
          },
          {
            id: 'edit',
            text: 'Editar',
            icon: 'wxi wxi-edit',
            css: 'text-green-600 force-text-inherit',
          },
          {
            id: 'delete',
            text: 'Eliminar',
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
          } else if (event.action?.id === 'edit') {
            row = JSON.parse(event.context)
            isEditing = true
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
          bind:this={table}
          data={data.roles || []}
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

<RoleAE type="adding" bind:isOpen={isAdding} {table} {search} rows={data?.roles.length ?? 0} />
<RoleAE
  type="editing"
  bind:isOpen={isEditing}
  {table}
  {search}
  rows={data?.roles.length ?? 0}
  {row}
/>
<RoleDelete bind:isOpen={isDeleting} {table} {search} rows={data?.roles.length ?? 0} {row} />
