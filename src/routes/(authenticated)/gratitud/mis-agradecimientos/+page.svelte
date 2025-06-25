<script lang="ts">
  import { onMount } from 'svelte'
  import { Button } from 'noph-ui'
  import Icon from '@iconify/svelte'
  import {
    TabulatorFull as Tabulator,
    type RowComponent,
    type CellComponent,
    // @ts-ignore
  } from 'tabulator-tables'

  let { data }: any = $props()
  let tableElement: HTMLDivElement
  let table: any
  let selectedRow: any = $state(null)
  let tabulatorMenu: any = $state(null)
  let isInitFilter = $state(false)
  let isFilter = $state(false)

  const tableColumns = [
    { resizable: false, title: 'Título', field: 'title' },
    {
      resizable: false,
      title: 'Description',
      field: 'description',
      width: 400,
      // headerFilter: true,
    },
    // {
    //   hozAlign: 'center',
    //   headerSort: false,
    //   resizable: false,
    //   formatter: function (
    //     cell: CellComponent,
    //     formatterParams: any,
    //     onRendered: (callback: () => void) => void,
    //   ) {
    //     return `<div id="row-${cell.getRow().getData().id}" class="bg-red-500">${cell.getRow().getData().id}</div>`
    //   },
    //   clickMenu: [
    //     {
    //       label: 'Reset Value',
    //       action: function (e: Event, cell: CellComponent) {
    //         cell.setValue('')
    //       },
    //     },
    //     {
    //       label: 'Set Value',
    //     },
    //   ],
    // },
  ]

  onMount(async () => {
    table = new Tabulator(tableElement, {
      data: data.gratitude ?? [],
      reactiveData: true, //enable data reactivity
      columns: tableColumns,
      responsiveLayout: true,
      rowContextMenu: [
        {
          label: 'Delete Row',
          action: function (e: Event, row: RowComponent) {
            row.delete()
            // clearHighlight()
          },
        },
      ],
    })
    table.on('rowContext', function (e: Event, row: RowComponent) {
      clearHighlight() /* Por si había una fila antes seleccionada */
      row.getElement().style.backgroundColor = 'green'
      selectedRow = row
    })
  })

  $effect(() => {
    if (selectedRow) {
      tabulatorMenu = setInterval(() => {
        if (!document.querySelector('.tabulator-menu-item')) {
          clearInterval(tabulatorMenu) /* Para que no siga el intervalo */
          tabulatorMenu = null /* Para que no limpie el interval al desmontar. */
          clearHighlight()
        }
      }, 300)
    }

    return () => {
      if (tabulatorMenu) {
        clearInterval(tabulatorMenu)
      }
    }
  })

  function clearHighlight() {
    if (selectedRow) {
      selectedRow.getElement().style.backgroundColor = ''
      selectedRow = null
    }
  }

  $effect(() => {
    if (isInitFilter === false) {
      return
    }
    let columns = table.getColumnDefinitions()
    columns = columns.map((col: any) => {
      return { ...col, headerFilter: isFilter }
    })
    table.setColumns(columns)
  })
</script>

<h1 class="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">
  Mis agradecimientos
</h1>
<hr
  role="presentation"
  class="mt-6 mb-10 w-full border-t border-zinc-950/10 dark:border-white/10"
/>

<div class="mb-4 flex items-center justify-end">
  <Button
    onclick={() => {
      isInitFilter = true
      isFilter = !isFilter
    }}
    variant="filled"
    class="px-1! text-center!"
    --np-filled-button-container-color="var(--o-btn-primary-bg-color)"
    --np-filled-button-container-height="32px"
    --np-filled-button-container-shape="4px"
  >
    <Icon
      icon="mdi:filter-outline"
      class="size-5 shrink-0  group-hover:text-(--o-btn-primary-bg-color)"
    />
  </Button>
</div>

<div class="flex justify-center">
  <div bind:this={tableElement}>Cargando...</div>
</div>
