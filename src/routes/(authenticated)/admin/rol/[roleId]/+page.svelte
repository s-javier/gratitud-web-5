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

  let Material: typeof SvelteComponent | null = $state(null)
  let { data }: any = $props()
  let table: any = $state()
  let search = $state('')
  let isAdding = $state(false)
  let isEditing = $state(false)
  let isDeleting = $state(false)
  let row = $state(null)
</script>

<section class="flex items-center justify-between">
  <h1 class="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">Rol: X</h1>
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
