<script lang="ts">
  import { tick } from 'svelte'
  import { fade } from 'svelte/transition'
  import type { ActionResult } from '@sveltejs/kit'
  import { applyAction, enhance } from '$app/forms'
  import { Button } from 'noph-ui'
  import { Input, Label, Radio } from 'flowbite-svelte'
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
    rows: number
    row?: {
      id: string
      firstName: string
      lastName: string
      email: string
      isActive: boolean
    } | null
  } = $props()
  // const uid = $props.id()
  let firstName = $state('')
  let firstNameErr = $state('')
  let lastName = $state('')
  let lastNameErr = $state('')
  let email = $state('')
  let emailErr = $state('')
  let status = $state('true')
  let firstNameRef = $state() as HTMLInputElement

  $effect(() => {
    if (props.row && props.type === 'editing') {
      firstName = props.row.firstName
      lastName = props.row.lastName
      email = props.row.email
      status = String(props.row.isActive)
    }
  })

  $effect(() => {
    if (isOpen && props.type === 'adding') {
      tick().then(() => firstNameRef.focus())
    }
  })
</script>

<Overlay type="dialog" isActive={isOpen} width="max-w-[500px]">
  <Modal
    title={props.type === 'editing' ? 'Edición de usuario' : 'Nuevo usuario'}
    close={() => (isOpen = false)}
  >
    {#if isOpen === true}
      <form
        id="user"
        class="space-y-5"
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
            if ('data' in result && result.data?.error) {
              let isToast = false
              if (result.data.error.firstName) {
                firstNameErr = result.data.error.firstName
                isToast = true
              }
              if (result.data.error.lastName) {
                lastNameErr = result.data.error.lastName
                isToast = true
              }
              if (result.data.error.email) {
                emailErr = result.data.error.email
                isToast = true
              }
              if (isToast) {
                toast.error('Por favor, corrige el formulario.', { closable: true })
              } else if (result.data.error.userId) {
                toast.error('Hubo un error. Por favor, recarga la página para corregirlo.', {
                  closable: true,
                })
              }
              if (result.data?.error?.server) {
                toast.error(result.data.error.server, { closable: true, infinite: true })
              }
              return
            }
            isOpen = false
            refreshTable(props.table, sort, filter, props.search, props.rows)
          }
        }}
      >
        {#if props.type === 'editing'}
          <input type="hidden" name="userId" value={props.row!.id} />
        {/if}
        <section class="">
          <Label for="firstName" class="mb-1 text-base" color={firstNameErr ? 'red' : 'gray'}>
            Nombre(s)
          </Label>
          <!-- clearable -->
          <!-- clearableClass="cursor-pointer hover:text-(--o-text-primary-color)" -->
          <Input
            type="text"
            id="firstName"
            name="firstName"
            size="lg"
            color={firstNameErr ? 'red' : 'default'}
          >
            {#snippet children(props)}
              <input
                {...props}
                bind:this={firstNameRef}
                bind:value={firstName}
                class="{props.class} bg-white ring-(--o-input-border-focus-color)"
                onfocus={() => {
                  firstNameErr = ''
                }}
              />
            {/snippet}
            {#snippet right()}
              {#if firstNameErr}
                <ExclamationCircleSolid class="size-6 text-red-400" />
              {:else if firstName.length > 0}
                <button
                  type="button"
                  class="flex size-6 items-center justify-center rounded-md hover:bg-slate-200 hover:text-(--o-btn-primary-bg-color)"
                  onclick={() => {
                    firstName = ''
                  }}
                >
                  <XMark class="size-5 shrink-0 cursor-pointer" />
                </button>
              {/if}
            {/snippet}
          </Input>
          {#if firstNameErr}
            <p in:fade class="mt-1 text-xs text-red-500">
              {firstNameErr}
            </p>
          {/if}
        </section>
        <section class="">
          <Label for="lastName" class="mb-1 text-base" color={lastNameErr ? 'red' : 'gray'}>
            Apellidos(s)
          </Label>
          <!-- clearable -->
          <!-- clearableClass="cursor-pointer hover:text-(--o-text-primary-color)" -->
          <Input
            type="text"
            id="lastName"
            name="lastName"
            size="lg"
            color={lastNameErr ? 'red' : 'default'}
          >
            {#snippet children(props)}
              <input
                {...props}
                bind:value={lastName}
                class="{props.class} bg-white ring-(--o-input-border-focus-color)"
                onfocus={() => {
                  lastNameErr = ''
                }}
              />
            {/snippet}
            {#snippet right()}
              {#if lastNameErr}
                <ExclamationCircleSolid class="size-6 text-red-400" />
              {:else if lastName?.length > 0}
                <button
                  type="button"
                  class="flex size-6 items-center justify-center rounded-md hover:bg-slate-200 hover:text-(--o-btn-primary-bg-color)"
                  onclick={() => {
                    lastName = ''
                  }}
                >
                  <XMark class="size-5 shrink-0 cursor-pointer" />
                </button>
              {/if}
            {/snippet}
          </Input>
          {#if lastNameErr}
            <p in:fade class="mt-1 text-xs text-red-500">
              {lastNameErr}
            </p>
          {/if}
        </section>
        <section class="">
          <Label for="email" class="mb-1 text-base" color={emailErr ? 'red' : 'gray'}>Email</Label>
          <!-- clearable -->
          <!-- clearableClass="cursor-pointer hover:text-(--o-text-primary-color)" -->
          <Input
            type="email"
            id="email"
            name="email"
            size="lg"
            color={emailErr ? 'red' : 'default'}
          >
            {#snippet children(props)}
              <input
                {...props}
                bind:value={email}
                class="{props.class} bg-white ring-(--o-input-border-focus-color)"
                onfocus={() => {
                  emailErr = ''
                }}
              />
            {/snippet}
            {#snippet right()}
              {#if emailErr}
                <ExclamationCircleSolid class="size-6 text-red-400" />
              {:else if email.length > 0}
                <button
                  type="button"
                  class="flex size-6 items-center justify-center rounded-md hover:bg-slate-200 hover:text-(--o-btn-primary-bg-color)"
                  onclick={() => {
                    email = ''
                  }}
                >
                  <XMark class="size-5 shrink-0 cursor-pointer" />
                </button>
              {/if}
            {/snippet}
          </Input>
          {#if emailErr}
            <p in:fade class="mt-1 text-xs text-red-500">
              {emailErr}
            </p>
          {/if}
        </section>
        <section>
          <Label class="text-base">Estado</Label>
          <section class="flex gap-6 pt-2">
            <Radio
              name="status"
              bind:group={status}
              color="green"
              value="true"
              class="*:text-green-400 *:focus:ring-green-400!"
            >
              Activo
            </Radio>
            <Radio
              name="status"
              bind:group={status}
              color="red"
              value="false"
              class="*:text-red-400 *:focus:ring-red-400!"
            >
              Inactivo
            </Radio>
          </section>
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
          form="user"
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
