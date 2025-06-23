<script lang="ts">
  import { onMount } from 'svelte'
  import {
    TabulatorFull as Tabulator,
    type RowComponent,
    type CellComponent,
    // @ts-ignore
  } from 'tabulator-tables'

  let tableElement: HTMLDivElement
  let selectedRow: any = $state(null)
  let tabulatorMenu: any = $state(null)

  const tabledata = [
    { id: 1, name: 'Oli Bob', age: '12', col: 'red', dob: '' },
    { id: 2, name: 'Mary May', age: '1', col: 'blue', dob: '14/05/1982' },
    { id: 3, name: 'Christine Lobowski', age: '42', col: 'green', dob: '22/05/1982' },
    { id: 4, name: 'Brendon Philips', age: '125', col: 'orange', dob: '01/08/1980' },
    { id: 5, name: 'Margret Marmajuke', age: '16', col: 'yellow', dob: '31/01/1999' },
  ]

  const tableColumns = [
    { title: 'Name', field: 'name', width: 150, resizable: false },
    { title: 'Age', field: 'age', hozAlign: 'left', formatter: 'progress', resizable: false },
    { title: 'Favourite Color', field: 'col', resizable: false },
    { title: 'Date Of Birth', field: 'dob', sorter: 'date', hozAlign: 'center', resizable: false },
    {
      hozAlign: 'center',
      headerSort: false,
      resizable: false,
      formatter: function (
        cell: CellComponent,
        formatterParams: any,
        onRendered: (callback: () => void) => void,
      ) {
        return `<div id="row-${cell.getRow().getData().id}" class="bg-red-500">${cell.getRow().getData().id}</div>`
      },
      clickMenu: [
        {
          label: 'Reset Value',
          action: function (e: Event, cell: CellComponent) {
            cell.setValue('')
          },
        },
        {
          label: 'Set Value',
        },
      ],
    },
  ]

  onMount(async () => {
    const table = new Tabulator(tableElement, {
      data: tabledata,
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
</script>

<h1 class="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">
  Mis agradecimientos
</h1>
<hr
  role="presentation"
  class="mt-6 mb-10 w-full border-t border-zinc-950/10 dark:border-white/10"
/>
<p>Hola.</p>

<div class="flex justify-center">
  <div bind:this={tableElement}></div>
</div>
