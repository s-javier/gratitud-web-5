<script lang="ts">
  import type { ActionResult } from '@sveltejs/kit'
  import { applyAction, enhance } from '$app/forms'
  import { invalidateAll } from '$app/navigation'
  import { onMount } from 'svelte'
  import { Button } from 'noph-ui'
  import {
    TabulatorFull as Tabulator,
    type RowComponent,
    // type CellComponent,
    // @ts-ignore
  } from 'tabulator-tables'
  // @ts-ignore
  import { DateTime } from 'luxon'
  import { toast } from 'svoast'

  import { overlayLoader } from '~/stores/loader.svelte'
  import GratitudeView from '~/routes/(authenticated)/gratitud/mis-agradecimientos/GratitudeView.svelte'

  const props: any = $props()

  let tableStatus = false
  let tableElement: HTMLDivElement | null = null
  let table: Tabulator | null = null
  let selectedRow: RowComponent | null = $state(null)

  let isOpen = $state(false)
  let isViewing = $state(false)

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
    })
    table.on('tableBuilt', function () {
      tableStatus = true
    })
    table.on('rowDblClick', function (e: Event, row: RowComponent) {
      selectedRow = row
      isViewing = true
    })
  })

  $effect(() => {
    if (props.data.gratitude && tableStatus) {
      table.replaceData(props.data.gratitude)
    }
  })
</script>

<div class="flex items-center justify-between">
  <h1 class="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">Recuerdo</h1>
  <form
    id="form-gratitude-delete"
    method="POST"
    action="?/remember"
    use:enhance={() => {
      isOpen = true
      toast.removeAll()
      overlayLoader.is = true
      return async ({ result }: { result: ActionResult }) => {
        await applyAction(result)
        await invalidateAll()
        overlayLoader.is = false
        if ('data' in result) {
          if (result.data?.error?.server) {
            toast.error(result.data.error.server, { closable: true, infinite: true })
            /* ↓ Caso de éxito. */
          } else {
            toast.success(result.data?.success.server, { closable: true, infinite: true })
          }
        }
      }
    }}
  >
    <input type="hidden" name="memories" value={JSON.stringify(props.data.gratitude)} />
    <Button
      type="submit"
      onclick={() => {}}
      variant="filled"
      class="text-center! text-base!"
      --np-filled-button-container-color="var(--o-btn-primary-bg-color)"
      --np-filled-button-container-height="32px"
      --np-filled-button-container-shape="4px"
    >
      Recordé
    </Button>
  </form>
</div>
<hr
  role="presentation"
  class="mt-6 mb-10 w-full border-t border-zinc-950/10 dark:border-white/10"
/>

<div class="flex justify-center">
  <div bind:this={tableElement}>Cargando...</div>
</div>

<GratitudeView bind:isOpen={isViewing} title="Agradecimiento" data={selectedRow?.getData()} />
