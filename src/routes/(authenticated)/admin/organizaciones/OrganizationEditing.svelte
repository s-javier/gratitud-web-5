<script lang="ts">
  import type { ActionResult } from '@sveltejs/kit'
  import { fade } from 'svelte/transition'
  import { applyAction, enhance } from '$app/forms'
  import { Button, Radio, TextField } from 'noph-ui'
  import { ExclamationCircle } from 'svelte-heros-v2'
  import { toast } from 'svoast'
  import { loader } from '~/stores/loader.svelte'
  import Overlay from '~/components/Overlay.svelte'
  import Modal from '~/components/Modal.svelte'

  let { isOpen = $bindable(), row } = $props()
  let title = $state('')
  let titleErr = $state('')
  let status = $state('true')
  let statusErr = $state('')

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
          // if ('data' in result && result.data?.error?.email) {
          //   emailErr = result.data.error.email
          //   return
          // }
          if ('data' in result && result.data?.error?.server) {
            toast.error(result.data.error.server, { closable: true, infinite: true })
          }
        }
      }}
    >
      <input type="hidden" name="organizationId" value={row.id} />
      <TextField
        bind:value={title}
        type="text"
        label="Título"
        name="title"
        variant="outlined"
        class="mb-4 w-full"
        error={titleErr.length > 0}
        errorText={titleErr}
        --np-outlined-text-field-label-text-color="var(--color-indigo-600)"
        --np-outlined-text-field-focus-outline-color="var(--color-indigo-400)"
        onfocus={() => {
          titleErr = ''
        }}
      >
        {#snippet end()}
          {#if titleErr}
            <ExclamationCircle class="size-5 shrink-0 text-red-500" />
          {/if}
        {/snippet}
      </TextField>
      <h3>Estado</h3>
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
            --np-radio-selected-icon-color="var(--color-indigo-400)"
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
            --np-radio-selected-icon-color="var(--color-indigo-400)"
          />
          <label for="inactive">Inactiva</label>
        </div>
      </section>
    </form>
    {#snippet footer()}
      <div class="flex w-full items-center justify-between gap-2">
        <Button
          onclick={() => (isOpen = false)}
          --np-filled-button-container-color="var(--color-indigo-600)"
        >
          Cerrar
        </Button>
        <Button
          type="submit"
          form="organization-edit"
          variant="filled"
          class="text-center!"
          --np-filled-button-container-color="var(--color-indigo-600)"
          --np-filled-button-container-height="42px"
          --np-filled-button-container-shape="4px"
        >
          Editar
        </Button>
      </div>
    {/snippet}
  </Modal>
</Overlay>
