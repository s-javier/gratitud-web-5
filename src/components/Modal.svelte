<script lang="ts">
  import type { Snippet } from 'svelte'
  import Icon from '@iconify/svelte'

  const props: {
    close: () => void
    title: string
    children: Snippet
    footer: Snippet
  } = $props()
</script>

<div
  class={[
    'o-dialog',
    'pointer-events-auto flex w-full flex-col overflow-hidden rounded-xl',
    'bg-white shadow-sm',
  ]}
  style="max-height: calc(100vh - 32px)"
>
  <header
    class={['bg-(--o-dialog-header-bg-color)', 'flex items-center justify-between', 'px-4 py-3']}
  >
    <h3 id="hire-modal-label" class="text-lg font-semibold text-white">
      {props.title}
    </h3>
    <div class="flex min-w-12 flex-row justify-end">
      <button
        type="button"
        class={[
          'text-(--o-dialog-header-btn-close-text-color)',
          'bg-(--o-dialog-header-btn-close-bg-color)',
          'hover:bg-(--o-dialog-header-btn-close-bg-hover-color)',
          'inline-flex size-8 items-center justify-center gap-x-2 rounded-full',
          'cursor-pointer border border-transparent',
          'focus:outline-none',
          'disabled:pointer-events-none disabled:opacity-50',
        ]}
        aria-label="Close"
        onclick={() => props.close()}
      >
        <span class="sr-only">Close</span>
        <Icon icon="mdi:window-close" class="size-4 shrink-0" />
      </button>
    </div>
  </header>
  <main class="overflow-y-auto p-4 pb-8">{@render props.children()}</main>
  <footer class="flex items-center justify-between gap-x-2 border-t border-gray-300 px-4 py-3">
    {@render props.footer()}
  </footer>
</div>
