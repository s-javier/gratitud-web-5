<script lang="ts">
  import { onMount } from 'svelte'
  import { fade, fly } from 'svelte/transition'
  import { Dropdown, DropdownItem } from 'flowbite-svelte'
  import { BuildingOutline, ChevronDownOutline, ChevronUpOutline } from 'flowbite-svelte-icons'
  import { ArrowRightStartOnRectangle } from 'svelte-heros-v2'
  import { loader } from '~/stores/loader.svelte'
  import { toast } from 'svoast'
  import Icon from './Icon.svelte'

  let { data, children }: any = $props()
  let showMenu = $state(false)
  let showDropdown = $state(false)

  onMount(() => {
    loader.is = false
    console.log(data)
    if ('error' in data && data.error?.server) {
      toast.error(data.error.server, { closable: true, infinite: true })
    }
  })
</script>

<div class="min-h-screen">
  <!-- Off-canvas menu for mobile, show/hide based on off-canvas menu state. -->
  <div class="relative z-50 lg:hidden" role="dialog" aria-modal="true">
    {#if showMenu}
      <!--
      Off-canvas menu backdrop, show/hide based on off-canvas menu state.

      Entering: "transition-opacity ease-linear duration-300"
        From: "opacity-0"
        To: "opacity-100"
      Leaving: "transition-opacity ease-linear duration-300"
        From: "opacity-100"
        To: "opacity-0"
    -->
      <div
        class="fixed inset-0 bg-gray-900/80"
        aria-hidden="true"
        transition:fade={{ duration: 300, easing: (t) => t }}
      ></div>

      <div class="fixed inset-0 flex">
        <!--
        Off-canvas menu, show/hide based on off-canvas menu state.

        Entering: "transition ease-in-out duration-300 transform"
          From: "-translate-x-full"
          To: "translate-x-0"
        Leaving: "transition ease-in-out duration-300 transform"
          From: "translate-x-0"
          To: "-translate-x-full"
      -->
        <div
          class="relative mr-16 flex w-full max-w-xs flex-1"
          transition:fly={{ x: -400, duration: 300, easing: (t) => t }}
        >
          <!--
          Close button, show/hide based on off-canvas menu state.

          Entering: "ease-in-out duration-300"
            From: "opacity-0"
            To: "opacity-100"
          Leaving: "ease-in-out duration-300"
            From: "opacity-100"
            To: "opacity-0"
        -->
          <div
            class="absolute top-0 left-full flex w-16 justify-center pt-5"
            transition:fade={{ duration: 300, easing: (t) => t }}
          >
            <button
              type="button"
              class="-m-2.5 cursor-pointer p-2.5"
              onclick={() => (showMenu = false)}
            >
              <span class="sr-only">Close sidebar</span>
              <svg
                class="size-6 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                aria-hidden="true"
                data-slot="icon"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Sidebar component, swap this element with another sidebar if you like -->
          <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
            <div class="flex h-16 shrink-0 items-center">
              <img
                class="h-8 w-auto"
                src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                alt="Your Company"
              />
            </div>
            <nav class="flex flex-1 flex-col">
              <ul role="list" class="flex flex-1 flex-col gap-y-7">
                <li class="-mx-6">
                  <button
                    class="flex w-full cursor-pointer items-center justify-between px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
                    onclick={() => (showDropdown = !showDropdown)}
                  >
                    <div class="flex items-center gap-x-4">
                      <BuildingOutline class="size-6 text-gray-400" />
                      <span aria-hidden="true">
                        {data.organizationsToChange.find((element: any) => element.isSelected)
                          .title}
                      </span>
                    </div>
                    <ChevronDownOutline />
                  </button>
                  <Dropdown simple class="-mt-1">
                    {#each data.organizationsToChange.filter((element: any) => element.isSelected === false) as organization}
                      <DropdownItem class="flex cursor-pointer items-center gap-x-4">
                        {organization.title}
                      </DropdownItem>
                    {/each}
                  </Dropdown>
                </li>
                <li>
                  <ul role="list" class="-mx-2 space-y-1">
                    <!-- Current: "bg-gray-50 text-indigo-600", Default: "text-gray-700 hover:text-indigo-600 hover:bg-gray-50" -->
                    <!-- <li>
                      <a
                        href="#"
                        class="group flex gap-x-3 rounded-md bg-gray-50 p-2 text-sm/6 font-semibold text-indigo-600"
                      >
                        <svg
                          class="size-6 shrink-0 text-indigo-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke-width="1.5"
                          stroke="currentColor"
                          aria-hidden="true"
                          data-slot="icon"
                        >
                          <path
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                          />
                        </svg>
                        Dashboard
                      </a>
                    </li> -->
                    {#each data.menu as menu}
                      <li>
                        <a
                          href={menu.path}
                          class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
                        >
                          <Icon title={menu.title} />
                          {menu.title}
                        </a>
                      </li>
                    {/each}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Static sidebar for desktop -->
  <div class="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
    <!-- Sidebar component, swap this element with another sidebar if you like -->
    <div class="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
      <div class="flex h-16 shrink-0 items-center">
        <img
          class="h-8 w-auto"
          src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
          alt="Your Company"
        />
      </div>
      <nav class="flex flex-1 flex-col">
        <ul role="list" class="flex flex-1 flex-col gap-y-7">
          <li class="-mx-6">
            <button
              class="flex w-full cursor-pointer items-center justify-between px-6 py-3 text-sm/6 font-semibold text-gray-900 hover:bg-gray-50"
              onclick={() => (showDropdown = !showDropdown)}
            >
              <div class="flex items-center gap-x-4">
                <BuildingOutline class="size-6 text-gray-400" />
                <span aria-hidden="true">
                  {data.organizationsToChange.find((element: any) => element.isSelected).title}
                </span>
              </div>
              <ChevronDownOutline />
            </button>
            <Dropdown simple class="-mt-1">
              {#each data.organizationsToChange.filter((element: any) => element.isSelected === false) as organization}
                <DropdownItem class="flex cursor-pointer items-center gap-x-4">
                  {organization.title}
                </DropdownItem>
              {/each}
            </Dropdown>
          </li>
          <li>
            <ul role="list" class="-mx-2 space-y-1">
              <!-- Current: "bg-gray-50 text-indigo-600", Default: "text-gray-700 hover:text-indigo-600 hover:bg-gray-50" -->
              <!-- <li>
                <a
                  href="#"
                  class="group flex gap-x-3 rounded-md bg-gray-50 p-2 text-sm/6 font-semibold text-indigo-600"
                >
                  <svg
                    class="size-6 shrink-0 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                    data-slot="icon"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                    />
                  </svg>
                  Welcome
                </a>
              </li> -->
              {#each data.menu as menu}
                <li>
                  <a
                    href={menu.path}
                    class="group flex gap-x-3 rounded-md p-2 text-sm/6 font-semibold text-gray-700 hover:bg-gray-50 hover:text-indigo-600"
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
    </div>
  </div>

  <!-- Toolbar for mobile -->
  <div
    class="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-xs sm:px-6 lg:hidden"
  >
    <button
      type="button"
      class="-m-2.5 cursor-pointer p-2.5 text-gray-700 lg:hidden"
      onclick={() => (showMenu = true)}
    >
      <span class="sr-only">Open sidebar</span>
      <svg
        class="size-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        aria-hidden="true"
        data-slot="icon"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        />
      </svg>
    </button>
    <div class="flex-1 text-sm/6 font-semibold text-gray-900">Gratitud</div>
    <a href="/">
      <span class="sr-only">Your profile</span>
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
    </a>
  </div>

  <main class="min-h-screen bg-zinc-100 py-3 lg:pl-72">
    <div class="mx-3 rounded-lg bg-white px-4 py-7 pb-10 sm:px-6 lg:px-8">
      {@render children()}
    </div>
  </main>
</div>
