<script lang="ts">
  import { onMount } from 'svelte'
  import { page } from '$app/state'
  import { BuildingOutline, ChevronDownOutline, ChevronUpOutline } from 'flowbite-svelte-icons'
  import { ArrowRightStartOnRectangle } from 'svelte-heros-v2'
  import { overlayLoader } from '~/stores/loader.svelte'
  import { toast } from 'svoast'
  import { applyAction, enhance } from '$app/forms'
  import type { ActionResult } from '@sveltejs/kit'
  import Icon from './Icon.svelte'
  import { fade, scale } from 'svelte/transition'

  let { organizationsToChange, menu, userFirstName } = $props()
  let isOpenOrganizations = $state(false)
  let organizationsRef: HTMLElement | null = $state(null)
  let isOpenUser = $state(false)
  let userRef: HTMLElement | null = $state(null)
  let selectedOrganization = $derived(
    organizationsToChange.find((element: any) => element.isSelected),
  )

  function handleClickOutside(event: any) {
    if (organizationsRef && !organizationsRef.contains(event.target)) {
      isOpenOrganizations = false
    }
    if (userRef && !userRef.contains(event.target)) {
      isOpenUser = false
    }
  }

  onMount(() => {
    window.addEventListener('click', handleClickOutside)
    return () => {
      window.removeEventListener('click', handleClickOutside)
    }
  })
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
        <div class="relative" bind:this={organizationsRef}>
          <button
            type="button"
            class="flex w-full cursor-pointer items-center justify-between px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
            id="menu-button"
            aria-expanded={isOpenOrganizations}
            aria-haspopup="true"
            onclick={() => (isOpenOrganizations = !isOpenOrganizations)}
          >
            <div class="flex items-center gap-x-4">
              <BuildingOutline class="size-6 text-gray-400" />
              <span aria-hidden="true">
                {selectedOrganization
                  ? `${selectedOrganization.organizationTitle} - ${selectedOrganization.roleTitle}`
                  : ''}
              </span>
            </div>
            <ChevronDownOutline />
          </button>
          {#if isOpenOrganizations}
            <div
              class="absolute left-6 z-10 mt-2 w-56 origin-top-left rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
              role="menu"
              aria-orientation="vertical"
              aria-labelledby="menu-button"
              tabindex="-1"
              in:scale={{ duration: 100 }}
              out:fade={{ duration: 200 }}
            >
              <div class="py-1" role="none">
                <!-- <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700"
                  role="menuitem"
                  tabindex="-1"
                  id="menu-item-0"
                >
                  Account settings
                </a> -->
                {#each organizationsToChange.filter((element: any) => element.isSelected === false) as item}
                  <form
                    method="POST"
                    action="/admin/organizaciones?/change"
                    use:enhance={() => {
                      toast.removeAll()
                      overlayLoader.is = true
                      return async ({ result }: { result: ActionResult }) => {
                        await applyAction(result)
                        overlayLoader.is = false
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
                    <input type="hidden" name="organizationId" value={item.organizationId} />
                    <input type="hidden" name="roleId" value={item.roleId} />
                    <button
                      type="submit"
                      class="block w-full cursor-pointer px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                      onclick={() => (isOpenOrganizations = false)}
                    >
                      {item.organizationTitle} - {item.roleTitle}
                    </button>
                  </form>
                {/each}
              </div>
            </div>
          {/if}
        </div>
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
                ? 'bg-gray-50 text-(--o-btn-primary-bg-color)'
                : 'text-gray-700 hover:bg-gray-50 hover:text-(--o-btn-primary-bg-color)'}"
            >
              <Icon title={menu.title} />
              {menu.title}
            </a>
          </li>
        {/each}
      </ul>
    </li>
    <li class="-mx-6 mt-auto">
      <div class="relative" bind:this={userRef}>
        {#if isOpenUser}
          <div
            class="absolute bottom-full left-6 z-10 mb-2 w-56 origin-bottom-left rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="menu-button"
            tabindex="-1"
            in:scale={{ duration: 100 }}
            out:fade={{ duration: 200 }}
          >
            <div class="py-1" role="none">
              <!-- <a
                  href="#"
                  class="block px-4 py-2 text-sm text-gray-700"
                  role="menuitem"
                  tabindex="-1"
                  id="menu-item-0"
                >
                  Account settings
                </a> -->
              <form
                method="POST"
                action="/logout"
                use:enhance={() => {
                  toast.removeAll()
                  overlayLoader.is = true
                  return async ({ result }: { result: ActionResult }) => {
                    await applyAction(result)
                    overlayLoader.is = false
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
                <button
                  type="submit"
                  class="flex w-full cursor-pointer items-center gap-x-4 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                  onclick={() => (isOpenUser = false)}
                >
                  <ArrowRightStartOnRectangle class="size-5" />Salir
                </button>
              </form>
            </div>
          </div>
        {/if}
        <button
          type="button"
          class="flex w-full cursor-pointer items-center justify-between px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
          id="menu-button"
          aria-expanded={isOpenUser}
          aria-haspopup="true"
          onclick={() => (isOpenUser = !isOpenUser)}
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
            <span aria-hidden="true">{userFirstName}</span>
          </div>
          <ChevronUpOutline />
        </button>
      </div>
    </li>
  </ul>
</nav>
