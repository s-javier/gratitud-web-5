<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'
  import { Button, TextField } from 'noph-ui'
  import Icon from '@iconify/svelte'
  import {
    TabulatorFull as Tabulator,
    type RowComponent,
    // type CellComponent,
    // @ts-ignore
  } from 'tabulator-tables'
  // @ts-ignore
  import { DateTime } from 'luxon'

  import { clearHighlight } from '~/lib'
  import GratitudeView from '~/routes/(authenticated)/gratitud/mis-agradecimientos/GratitudeView.svelte'
  import GratitudeAE from '~/routes/(authenticated)/gratitud/mis-agradecimientos/GratitudeAE.svelte'
  import GratitudeDelete from '~/routes/(authenticated)/gratitud/mis-agradecimientos/GratitudeDelete.svelte'

  const props: any = $props()

  let search = $state('')
  let tableStatus = false
  let tableElement: HTMLDivElement | null = null
  let table: Tabulator | null = null
  let rowsDisplayed = $state(0)
  let selectedRow: RowComponent | null = $state(null)
  let tabulatorMenu: any = $state(null)
  let isFilter = $state(false)

  let isViewing = $state(false)
  let isAdding = $state(false)
  let isEditing = $state(false)
  let isDeleting = $state(false)

  const tableColumns = [
    {
      resizable: false,
      formatter: 'rownum',
      headerSort: false,
      hozAlign: 'right',
      vertAlign: 'middle',
    },
    { resizable: true, title: 'Título', field: 'title', minWidth: 150, vertAlign: 'middle' },
    {
      resizable: false,
      title: 'Description',
      field: 'description',
      formatter: 'textarea',
      minWidth: 300,
      maxWidth: 400,
    },
    {
      resizable: false,
      title: 'Creación',
      field: 'created_at',
      width: 160,
      formatter: 'datetime',
      formatterParams: {
        inputFormat: 'iso',
        outputFormat: 'dd MMM yyyy HH:mm',
        invalidPlaceholder: 'Fecha inválida',
        timezone: 'local',
      },
    },
  ]

  onMount(async () => {
    table = new Tabulator(tableElement, {
      dependencies: {
        DateTime: DateTime,
      },
      height: '450px',
      layout: 'fitData',
      responsiveLayout: 'collapse',
      placeholder: 'Sin agradecimientos por materializar',
      reactiveData: true,
      data: props.data.gratitude ?? [],

      headerSortClickElement: 'icon',
      initialSort: [{ column: 'created_at', dir: 'desc' }],

      selectableRange: 1,
      selectableRangeColumns: true,
      selectableRangeRows: true,
      selectableRangeClearCells: true,

      clipboard: true,
      clipboardCopyStyled: false,
      clipboardCopyConfig: {
        rowHeaders: false,
        columnHeaders: false,
      },
      clipboardCopyRowRange: 'range',

      columns: tableColumns,
      rowContextMenu: [
        {
          label: 'Editar',
          action: function (e: Event, row: RowComponent) {
            isEditing = true
          },
        },
        {
          label: 'Eliminar',
          action: function (e: Event, row: RowComponent) {
            // row.delete()
            isDeleting = true
          },
        },
      ],
    })
    table.on('rowContext', function (e: Event, row: RowComponent) {
      clearHighlight(selectedRow) /* Por si había una fila antes seleccionada */
      row.getElement().style.backgroundColor = '#ced5e1'
      selectedRow = row
    })
    table.on('rowDblClick', function (e: Event, row: RowComponent) {
      selectedRow = row
      isViewing = true
    })
    table.on('tableBuilt', function () {
      tableStatus = true
    })
    table.on('dataFiltered', function (_: any, rows: RowComponent[]) {
      rowsDisplayed = rows.length
    })
  })

  $effect(() => {
    if (selectedRow) {
      tabulatorMenu = setInterval(() => {
        if (!document.querySelector('.tabulator-menu-item')) {
          clearInterval(tabulatorMenu) /* Para que no siga el intervalo */
          tabulatorMenu = null /* Para que no limpie el interval al desmontar. */
          clearHighlight(selectedRow)
        }
      }, 300)
    }
    return () => {
      if (tabulatorMenu) {
        clearInterval(tabulatorMenu)
      }
    }
  })

  $effect(() => {
    if (isFilter || tableStatus) {
      let columns = table.getColumnDefinitions()
      columns = columns.map((col: any) => {
        if ('field' in col) {
          if (['description', 'created_at'].includes(col.field) && isFilter) {
            return { ...col, headerFilter: 'input' }
          }
          return { ...col, headerFilter: isFilter }
        } else {
          return col
        }
      })
      table.setColumns(columns)
    }
  })

  $effect(() => {
    if (search.length >= 0 && tableStatus) {
      table.setFilter([
        [
          { field: 'title', type: 'like', value: search },
          { field: 'description', type: 'like', value: search },
          { field: 'created_at', type: 'like', value: search },
        ],
      ])
    }
  })

  $effect(() => {
    if (props.data.gratitude && tableStatus) {
      table.replaceData(props.data.gratitude)
    }
  })
</script>

<div class="flex items-center justify-between">
  <h1 class="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">
    Pide y se te dará
  </h1>
  <Button
    variant="filled"
    class="text-center! text-base!"
    --np-filled-button-container-color="var(--o-btn-primary-bg-color)"
    --np-filled-button-container-height="32px"
    --np-filled-button-container-shape="4px"
    onclick={() => (isAdding = true)}
  >
    Agregar
  </Button>
</div>
<hr
  role="presentation"
  class="mt-6 mb-10 w-full border-t border-zinc-950/10 dark:border-white/10"
/>

<div class="mb-4 flex items-center justify-between gap-x-4">
  <div class="text-sm text-gray-500">
    <p>
      {props.data?.gratitude?.length === 1 ? 'Existe' : 'Existen'}
      {props.data?.gratitude?.length ?? 0}
      {props.data?.gratitude?.length === 1 ? 'agradecimiento' : 'agradecimientos'}.
    </p>
    {#if rowsDisplayed < props.data?.gratitude?.length && tableStatus}
      <p transition:fade>
        Estás viendo {rowsDisplayed}
        {table.getRows().length === 1 ? 'agradecimiento' : 'agradecimientos'}.
      </p>
    {/if}
  </div>
  <div class="flex items-center justify-between gap-x-4">
    <TextField
      bind:value={search}
      type="text"
      label="Buscar"
      variant="outlined"
      class="max-w-[300px]"
      --np-outlined-text-field-label-text-color="var(--o-input-label-focus-color)"
      --np-outlined-text-field-focus-outline-color="var(--o-input-border-focus-color)"
    >
      {#snippet end()}
        {#if search.length > 0}
          <div transition:fade>
            <button
              class="flex size-6 items-center justify-center rounded-md text-gray-400 hover:bg-slate-200 hover:text-(--o-btn-primary-bg-color)"
              onclick={() => {
                search = ''
              }}
            >
              <Icon icon="mdi:window-close" class="size-5 shrink-0 cursor-pointer" />
            </button>
          </div>
        {/if}
      {/snippet}
    </TextField>
    <Button
      onclick={() => (isFilter = !isFilter)}
      variant="filled"
      class="px-1! text-center!"
      --np-filled-button-container-color="var(--o-btn-primary-bg-hover-color)"
      --np-filled-button-container-height="32px"
      --np-filled-button-container-shape="4px"
    >
      <div transition:fade>
        {#if isFilter}
          <Icon
            icon="mdi:filter-remove-outline"
            class="size-5 shrink-0  group-hover:text-(--o-btn-primary-bg-color)"
          />
        {:else}
          <Icon
            icon="mdi:filter-outline"
            class="size-5 shrink-0  group-hover:text-(--o-btn-primary-bg-color)"
          />
        {/if}
      </div>
    </Button>
  </div>
</div>

<div class="flex justify-center">
  <div bind:this={tableElement}>Cargando...</div>
</div>

<GratitudeView
  bind:isOpen={isViewing}
  title="Agradecimiento sin materializar"
  data={selectedRow?.getData()}
/>
<GratitudeAE type="adding" bind:isOpen={isAdding} title="Nuevo agradecimiento sin materializar" />
<GratitudeAE
  type="editing"
  bind:isOpen={isEditing}
  title="Edición deagradecimiento sin materializar"
  data={selectedRow?.getData()}
/>
<GratitudeDelete
  bind:isOpen={isDeleting}
  title="Eliminación de agradecimiento sin materializar"
  data={selectedRow?.getData()}
/>
