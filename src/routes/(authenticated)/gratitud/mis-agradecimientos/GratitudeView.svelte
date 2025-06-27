<script lang="ts">
  import { Button } from 'noph-ui'
  // @ts-ignore
  import { DateTime } from 'luxon'

  import Overlay from '~/components/Overlay.svelte'
  import Modal from '~/components/Modal.svelte'
  import { input } from 'flowbite-svelte'

  let {
    isOpen = $bindable(),
    ...props
  }: {
    isOpen: boolean
    data: {
      title: string
      description: string
      created_at: string
      updated_at: string
    } | null
  } = $props()
</script>

<Overlay type="dialog" status={isOpen} width="max-w-[500px]">
  <Modal title="Agradecimiento" close={() => (isOpen = false)}>
    {#if props.data}
      <div class="border-t border-gray-100">
        <dl class="divide-y divide-gray-100">
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">Título</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              {props.data?.title || 'Sin título'}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">Agradecimiento</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              {props.data?.description}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">Creación</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              {DateTime.fromISO(props.data?.created_at).toFormat('yyyy-MM-dd HH:mm')}
            </dd>
          </div>
          <div class="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
            <dt class="text-sm/6 font-medium text-gray-900">Actualización</dt>
            <dd class="mt-1 text-sm/6 text-gray-700 sm:col-span-2 sm:mt-0">
              {props.data?.updated_at
                ? DateTime.fromISO(props.data?.updated_at).toFormat('yyyy-MM-dd HH:mm')
                : 'Sin actualización'}
            </dd>
          </div>
        </dl>
      </div>
    {/if}
    {#snippet footer()}
      <div class="flex w-full items-center justify-center">
        <Button
          variant="outlined"
          onclick={() => (isOpen = false)}
          --np-outlined-button-container-shape="4px"
          --np-outlined-button-label-text-color="var(--color-gray-500)"
        >
          Cerrar
        </Button>
      </div>
    {/snippet}
  </Modal>
</Overlay>
