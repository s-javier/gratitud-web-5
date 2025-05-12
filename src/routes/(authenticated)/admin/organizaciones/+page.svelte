<script lang="ts">
  import { fade } from 'svelte/transition'
  import { toast } from 'svoast'
  // @ts-ignore
  import { Grid, Material } from 'wx-svelte-grid'
  // @ts-ignore
  import { ActionMenu } from 'wx-svelte-menu'
  import { Button, Input } from 'flowbite-svelte'
  import { MagnifyingGlass, XMark } from 'svelte-heros-v2'
  import EditButton from './EditButton.svelte'
  import StatusCell from './StatusCell.svelte'
  import OrganizationEditing from './OrganizationEditing.svelte'

  let { data }: any = $props()
  let table: any = $state()
  let search = $state('')
  let isEditing = $state(false)
  let row = $state({})

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
  ]

  const filterAllTable = () => {
    const value = search.toLowerCase()
    table.exec('filter-rows', {
      filter: (row: any) => {
        // console.log('-> Fila')
        const keys = Object.keys(row)
        let rowResult = false
        for (let key of keys) {
          // console.log(
          //   `Revisando la llave ${key} con el valor ${row[key]} y con el filtro: #${value}#`,
          // )
          switch (typeof row[key]) {
            case 'string':
              if (row[key].toLowerCase().includes(value)) {
                rowResult ||= true
              }
              break
            case 'boolean':
              if (row[key] === true && 'activa'.includes(value)) {
                rowResult ||= true
              } else if (row[key] === false && 'activa'.includes(value)) {
                rowResult ||= true
              }
              break
          }
          /* Si el rowResult ya es true, no hace falta seguir revisando */
          if (rowResult) {
            return true
          }
        }
        return false
      },
    })
  }

  const handleClick = (event: any) => {
    // console.log(event)
    // event.action // Valor de opciones: {id: 'edit', text: 'Editar'}
    // event.context // Valor asociado a la fila: event.context = row.id
    // { action: null } // Cuando se clica fuera
    if (event.action?.id === 'edit') {
      row = JSON.parse(event.context)
      isEditing = true
    } else {
      row = {}
    }
  }
</script>

<h1 class="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">Organizaciones</h1>
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
      oninput={(event: any) => {
        // const value = event.target.value.toLowerCase()
        filterAllTable()
      }}
    >
      {#snippet right()}
        {#if search && search.length > 0}
          <div in:fade>
            <Button
              class="cursor-pointer bg-indigo-500 p-1! hover:bg-indigo-400"
              size="sm"
              onclick={() => {
                search = ''
                filterAllTable()
              }}
            >
              <XMark class="size-4 shrink-0" />
            </Button>
          </div>
        {:else}
          <div in:fade>
            <MagnifyingGlass class="size-6 shrink-0 text-gray-400" />
          </div>
        {/if}
      {/snippet}
    </Input>
  </div>
</div>

<div class="flex h-[60%] justify-center">
  <!-- ↓ dataKey vincula al elemento que gatilla el menú -->
  <!-- ↓ resolver alimenta el "context" que se obtiene en el onclick -->
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

<OrganizationEditing bind:isOpen={isEditing} {row} />
