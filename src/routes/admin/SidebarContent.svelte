<script lang="ts">
  import { page } from '$app/state'
  import { Dropdown, DropdownItem } from 'flowbite-svelte'
  import { BuildingOutline, ChevronDownOutline, ChevronUpOutline } from 'flowbite-svelte-icons'
  import { ArrowRightStartOnRectangle } from 'svelte-heros-v2'
  import { loader } from '~/stores/loader.svelte'
  import { toast } from 'svoast'
  import { applyAction, enhance } from '$app/forms'
  import type { ActionResult } from '@sveltejs/kit'
  import Icon from './Icon.svelte'

  let { organizationsToChange, menu } = $props()
  let showDropdown = $state(false)
</script>

<div class="flex h-16 shrink-0 items-center">
  <img
    class="h-8 w-auto"
    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
    alt="Your Company"
  />
</div>
<nav class="flex flex-1 flex-col">
  <ul role="list" class="flex flex-1 flex-col gap-y-7">
    {#if organizationsToChange.length > 1}
      <li class="-mx-6">
        <button
          class="flex w-full cursor-pointer items-center justify-between px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
          onclick={() => (showDropdown = !showDropdown)}
        >
          <div class="flex items-center gap-x-4">
            <BuildingOutline class="size-6 text-gray-400" />
            <span aria-hidden="true">
              {organizationsToChange.find((element: any) => element.isSelected).title}
            </span>
          </div>
          <ChevronDownOutline />
        </button>
        <Dropdown simple class="-mt-1">
          {#each organizationsToChange.filter((element: any) => element.isSelected === false) as organization}
            <DropdownItem class="flex cursor-pointer items-center gap-x-4">
              <form
                method="POST"
                action="/admin/organizaciones?/change"
                use:enhance={() => {
                  toast.removeAll()
                  loader.is = true
                  return async ({ result }: { result: ActionResult }) => {
                    await applyAction(result)
                    loader.is = false
                    if ('data' in result && result.data?.error?.server) {
                      // @ts-ignore
                      toast.error(result.error.server, {
                        closable: true,
                        infinite: true,
                      })
                    }
                  }
                }}
              >
                <input type="hidden" name="organizationId" value={organization.id} />
                <button class="cursor-pointer">{organization.title}</button>
              </form>
            </DropdownItem>
          {/each}
        </Dropdown>
      </li>
    {/if}
    <li>
      <ul role="list" class="-mx-2 space-y-1">
        {#each menu as menu}
          <li>
            <a
              href={menu.path}
              class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold {page.url
                .pathname === menu.path
                ? 'bg-gray-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-600'}"
            >
              <Icon title={menu.title} />
              {menu.title}
            </a>
          </li>
        {/each}
      </ul>
    </li>
    <li class="-mx-6 mt-auto">
      <button
        class="flex w-full cursor-pointer items-center justify-between px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
        onclick={() => (showDropdown = !showDropdown)}
      >
        <div class="flex items-center gap-x-4">
          <svg
            class="size-8 rounded-full bg-gray-50"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="16" cy="16" r="16" fill="#E5E7EB" />
            <circle cx="16" cy="13" r="6" fill="#A3A3A3" />
            <path d="M6 26c0-3.3137 4.4772-6 10-6s10 2.6863 10 6" fill="#A3A3A3" />
          </svg>
          <span aria-hidden="true">Tom Cookkk</span>
        </div>
        <ChevronUpOutline />
      </button>
      <Dropdown simple>
        <DropdownItem href="/ingreso" class="flex items-center gap-x-4">
          <ArrowRightStartOnRectangle class="size-5" />Salir
        </DropdownItem>
      </Dropdown>
    </li>
  </ul>
</nav>
