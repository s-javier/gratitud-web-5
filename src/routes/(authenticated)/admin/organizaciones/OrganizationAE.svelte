<script lang="ts">
  import { tick } from 'svelte'
  import type { ActionResult } from '@sveltejs/kit'
  import { applyAction, enhance } from '$app/forms'
  import { Button } from 'noph-ui'
  import { Helper, Input, Label, Radio } from 'flowbite-svelte'
  import { ExclamationCircleSolid } from 'flowbite-svelte-icons'
  import { toast } from 'svoast'
  import { XMark } from 'svelte-heros-v2'
  import { overlayLoader } from '~/stores/loader.svelte'
  import Overlay from '~/components/Overlay.svelte'
  import Modal from '~/components/Modal.svelte'
  import refreshTable from '~/lib/refresh-table'

  let {
    isOpen = $bindable(),
    ...props
  }: {
    type: string
    isOpen: boolean
    table: any
    search: string
    filterAllTable: () => void
    row?: any
  } = $props()
  // const uid = $props.id()
  let title = $state('')
  let titleErr = $state('')
  let status = $state('true')
  let titleRef = $state() as HTMLInputElement

  $effect(() => {
    if (props.type === 'editing') {
      title = props.row.title
      status = String(props.row.isActive)
    }
  })

  $effect(() => {
    if (isOpen && props.type === 'adding') {
      tick().then(() => titleRef.focus())
    }
  })
</script>

<Overlay type="dialog" isActive={isOpen} width="max-w-[500px]">
  <Modal
    title={props.type === 'editing' ? 'Edición de organización' : 'Nueva organización'}
    close={() => (isOpen = false)}
  >
    {#if isOpen === true}
      <!-- <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
      With less than a month to go before the European Union enacts new consumer privacy laws for
      its citizens, companies around the world are updating their terms of service agreements to
      comply.
    </p> -->
      <form
        id="organization-edit"
        class="mt-1"
        method="POST"
        action={props.type === 'adding' ? '?/add' : '?/edit'}
        use:enhance={() => {
          toast.removeAll()
          overlayLoader.is = true
          return async ({ result }: { result: ActionResult }) => {
            const sort = props.table.getState().sort
            const filter = props.table.getState().filter
            await applyAction(result)
            overlayLoader.is = false
            if ('data' in result && result.data?.error?.title) {
              titleErr = result.data.error.title
              toast.error('Por favor, corrige el error.', { closable: true })
              return
            }
            if ('data' in result && result.data?.error?.server) {
              toast.error(result.data.error.server, { closable: true, infinite: true })
            }
            isOpen = false
            refreshTable(props.table, sort, filter, props.search, props.filterAllTable)
          }
        }}
      >
        {#if props.type === 'editing'}
          <input type="hidden" name="organizationId" value={props.row.id} />
        {/if}
        <section class="mb-5">
          <Label for="first_name" class="mb-1 text-base" color={titleErr ? 'red' : 'gray'}>
            Título
          </Label>
          <!-- clearable -->
          <!-- clearableClass="cursor-pointer hover:text-(--o-text-primary-color)" -->
          <Input
            type="text"
            id="first_name"
            name="title"
            size="lg"
            color={titleErr ? 'red' : 'default'}
          >
            {#snippet children(props)}
              <input
                bind:this={titleRef}
                bind:value={title}
                {...props}
                class="{props.class} bg-white ring-(--o-input-border-focus-color)"
                onfocus={() => {
                  titleErr = ''
                }}
              />
            {/snippet}
            {#snippet right()}
              {#if titleErr}
                <ExclamationCircleSolid class="size-6 text-red-400" />
              {:else if title.length > 0}
                <button
                  type="button"
                  class="flex size-6 items-center justify-center rounded-md hover:bg-slate-200 hover:text-(--o-btn-primary-bg-color)"
                  onclick={() => {
                    title = ''
                  }}
                >
                  <XMark class="size-5 shrink-0 cursor-pointer" />
                </button>
              {/if}
            {/snippet}
          </Input>
          {#if titleErr}
            <Helper class="mt-1" color="red">
              <!-- <span class="font-medium">Oh, snapp!</span> -->
              {titleErr}
            </Helper>
          {/if}
        </section>
        <Label class="text-base">Estado</Label>
        <section class="flex gap-6 pt-2">
          <Radio
            name="status"
            bind:group={status}
            color="green"
            value="true"
            class="*:text-green-400 *:focus:ring-green-400!"
          >
            Activa
          </Radio>
          <Radio
            name="status"
            bind:group={status}
            color="red"
            value="false"
            class="*:text-red-400 *:focus:ring-red-400!"
          >
            Inactiva
          </Radio>
        </section>
      </form>
    {/if}
    {#snippet footer()}
      <div class="flex w-full items-center justify-between gap-2">
        <Button
          variant="outlined"
          onclick={() => (isOpen = false)}
          --np-outlined-button-container-shape="4px"
          --np-outlined-button-label-text-color="var(--color-gray-500)"
        >
          Cerrar
        </Button>
        <Button
          type="submit"
          form="organization-edit"
          variant="filled"
          class="text-center! text-base!"
          --np-filled-button-container-color="var(--o-btn-primary-bg-color)"
          --np-filled-button-container-shape="4px"
        >
          {props.type === 'editing' ? 'Editar' : 'Agregar'}
        </Button>
      </div>
    {/snippet}
  </Modal>
</Overlay>
