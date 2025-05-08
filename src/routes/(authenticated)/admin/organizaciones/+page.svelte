<script lang="ts">
  import { toast } from 'svoast'
  // @ts-ignore
  import { Grid, Material } from 'wx-svelte-grid'
  // @ts-ignore
  import { ActionMenu } from 'wx-svelte-menu'
  import EditButton from './EditButton.svelte'

  let { data }: any = $props()
  let table: any = $state()

  $effect(() => {
    if ('error' in data && data.error?.server) {
      toast.error(data.error.server, { closable: true, infinite: true })
    }
  })

  const columns = [
    {
      id: 'menu',
      header: '',
      width: 60,
      cell: EditButton,
    },
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
      header: 'Activa',
      width: 100,
      sort: true,
      template: (isActive: boolean) => (isActive ? 'Sí' : 'No'),
    },
  ]

  const handleClick = (event: any) => {
    console.log(event)
    // event.action // {id: 'edit', text: 'Editar'}
    // event.context // row.id
    // { action: null }
  }
</script>

<h1 class="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">Organizaciones</h1>
<hr
  role="presentation"
  class="mt-6 mb-10 w-full border-t border-zinc-950/10 dark:border-white/10"
/>
<div class="h-[60%] w-full">
  <!-- dataKey vincula al elemento que gatilla el menú -->
  <!-- resolver alimenta el "context" que se obtiene en el onclick -->
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
    resolver={(id: string) => id}
    api={table}
    onclick={handleClick}
  >
    <Material>
      <Grid
        bind:this={table}
        data={data.organizations || []}
        {columns}
        rowStyle={(row: any) => 'hover:bg-gray-100!'}
        columnStyle={(col: any) => (col.id === 'isActive' ? 'text-center' : '')}
      />
    </Material>
  </ActionMenu>
</div>
