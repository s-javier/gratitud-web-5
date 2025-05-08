<script lang="ts">
  import { Button } from 'noph-ui'
  import { EllipsisHorizontal } from 'svelte-heros-v2'

  let { row } = $props()
</script>

<div class="flex items-center justify-center">
  <!-- <button class="btn btn-circle">
    <EllipsisHorizontal class="size-6 shrink-0 text-gray-400 hover:text-indigo-600" />
  </button> -->
  <Button
    data-action-id={row.id}
    variant="text"
    class="h-6! w-10! px-0! text-gray-400 hover:text-indigo-400!"
  >
    <EllipsisHorizontal class="m-auto size-6 shrink-0" />
  </Button>
</div>
