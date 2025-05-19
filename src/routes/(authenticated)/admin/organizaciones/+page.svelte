<script lang="ts">
  import { onMount, type SvelteComponent } from 'svelte'
  import { fade } from 'svelte/transition'
  import { toast } from 'svoast'
  // @ts-ignore
  import { Grid } from 'wx-svelte-grid'
  // import { Grid, Material } from 'wx-svelte-grid'
  // @ts-ignore
  import { ActionMenu } from 'wx-svelte-menu'
  import { Input } from 'flowbite-svelte'
  import { Button } from 'noph-ui'
  import { MagnifyingGlass, XMark } from 'svelte-heros-v2'
  import TableMenuButton from '~/components/TableMenuButton.svelte'
  import StatusCell from '~/components/StatusCell.svelte'
  import OrganizationAE from './OrganizationAE.svelte'
  import OrganizationDelete from './OrganizationDelete.svelte'
  import filterAllTableByText from '~/lib/filter-all-table-by-text'

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
    filterAllTableByText(table, search, data.organizations.length)
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
      id: 'isActive',
      // header: ['Activa?', { css: 'flex justify-center' }],
      header: [
        'Estatus',
        {
          filter: {
            type: 'richselect',
            config: {
              // template: (option: any) => {
              //   return option.label ? 'Activa' : 'Inactiva'
              // },
              options: [
                { id: 'active', label: 'Activa' },
                { id: 'inactive', label: 'Inactiva' },
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
      width: 100,
      sort: true,
      cell: StatusCell,
      // text: 'Activa|Inactiva',
      // template: (isActive: boolean) => (isActive ? 'Sí' : 'No'),
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
    Organizaciones
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
                filterAllTableByText(table, search, data.organizations.length)
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
          // console.log(event)
          // event.action // Valor de opciones: {id: 'edit', text: 'Editar'}
          // event.context // Valor asociado a la fila: event.context = row.id
          // { action: null } // Cuando se clica fuera
          if (event.action?.id === 'edit') {
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
          data={data.organizations || []}
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

<OrganizationAE
  type="adding"
  bind:isOpen={isAdding}
  {table}
  {search}
  rows={data?.organizations.length ?? 0}
/>
<OrganizationAE
  type="editing"
  bind:isOpen={isEditing}
  {table}
  {search}
  rows={data?.organizations.length ?? 0}
  {row}
/>
<OrganizationDelete
  bind:isOpen={isDeleting}
  {table}
  {search}
  rows={data?.organizations.length ?? 0}
  {row}
/>
