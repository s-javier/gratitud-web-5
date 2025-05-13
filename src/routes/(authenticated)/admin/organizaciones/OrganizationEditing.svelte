<script lang="ts">
  import type { ActionResult } from '@sveltejs/kit'
  import { applyAction, enhance } from '$app/forms'
  import { Button, Radio } from 'noph-ui'
  import { Helper, Input, Label } from 'flowbite-svelte'
  import { ExclamationCircleSolid } from 'flowbite-svelte-icons'
  import { toast } from 'svoast'
  import { loader } from '~/stores/loader.svelte'
  import Overlay from '~/components/Overlay.svelte'
  import Modal from '~/components/Modal.svelte'

  let { isOpen = $bindable(), row } = $props()
  let title = $state('')
  let titleErr = $state('')
  let status = $state('true')

  $effect(() => {
    title = row.title
    status = String(row.isActive)
  })
</script>

<Overlay type="dialog" isActive={isOpen} width="max-w-[500px]">
  <Modal title="Edición de organización" close={() => (isOpen = false)}>
    <!-- <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
      With less than a month to go before the European Union enacts new consumer privacy laws for
      its citizens, companies around the world are updating their terms of service agreements to
      comply.
    </p> -->
    <form
      id="organization-edit"
      class="mt-1"
      method="POST"
      action="?/edit"
      use:enhance={() => {
        toast.removeAll()
        loader.is = true
        return async ({ result }: { result: ActionResult }) => {
          await applyAction(result)
          loader.is = false
          if ('data' in result && result.data?.error?.title) {
            titleErr = result.data.error.title
            toast.error('Por favor, corrige el error.', { closable: true })
            return
          }
          if ('data' in result && result.data?.error?.server) {
            toast.error(result.data.error.server, { closable: true, infinite: true })
          }
          isOpen = false
        }
      }}
    >
      <input type="hidden" name="organizationId" value={row.id} />
      <section class="mb-5">
        <Label for="first_name" class="mb-1 text-base" color={titleErr ? 'red' : 'gray'}
          >Título</Label
        >
        <Input
          bind:value={title}
          type="text"
          id="first_name"
          name="title"
          clearable
          size="lg"
          class="bg-white ring-(--o-input-border-focus-color)"
          color={titleErr ? 'red' : 'default'}
          onfocus={() => {
            titleErr = ''
          }}
        />
        {#if titleErr}
          <Helper class="mt-1" color="red">
            <!-- <span class="font-medium">Oh, snapp!</span> -->
            {titleErr}
          </Helper>
        {/if}
      </section>
      <h3 class="text-base">Estado</h3>
      <section class="flex gap-6">
        <div class="flex items-center">
          <Radio
            bind:group={status}
            name="status"
            value="true"
            id="active"
            checked
            defaultChecked={true}
            --np-radio-icon-color="var(--color-gray-400)"
            --np-radio-selected-icon-color="var(--o-btn-primary-bg-hover-color)"
          />
          <label for="active">Activa</label>
        </div>
        <div class="flex items-center">
          <Radio
            bind:group={status}
            name="status"
            value="false"
            id="inactive"
            --np-radio-icon-color="var(--color-gray-400)"
            --np-radio-selected-icon-color="var(--o-btn-primary-bg-hover-color)"
          />
          <label for="inactive">Inactiva</label>
        </div>
      </section>
    </form>
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
          class="text-center!"
          --np-filled-button-container-color="var(--o-btn-primary-bg-color)"
          --np-filled-button-container-shape="4px"
        >
          Editar
        </Button>
      </div>
    {/snippet}
  </Modal>
</Overlay>
