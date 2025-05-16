<script lang="ts">
  import {
    BuildingOffice2,
    Clock,
    Gift,
    Heart,
    Identification,
    LockOpen,
    Users,
    Window,
  } from 'svelte-heros-v2'

  let { title } = $props()
</script>

{#if title === 'Organizaciones'}
  <BuildingOffice2
    class="size-6 shrink-0 text-gray-400 group-hover:text-(--o-btn-primary-bg-color)"
  />
{:else if title === 'Roles'}
  <Identification
    class="size-6 shrink-0 text-gray-400 group-hover:text-(--o-btn-primary-bg-color)"
  />
{:else if title === 'Permisos'}
  <LockOpen class="size-6 shrink-0 text-gray-400 group-hover:text-(--o-btn-primary-bg-color)" />
{:else if title === 'Usuarios'}
  <Users class="size-6 shrink-0 text-gray-400 group-hover:text-(--o-btn-primary-bg-color)" />
{:else if title === 'Páginas de menú'}
  <Window class="size-6 shrink-0 text-gray-400 group-hover:text-(--o-btn-primary-bg-color)" />
{:else if title === 'Mis agradecimientos'}
  <Heart class="size-6 shrink-0 text-gray-400 group-hover:text-(--o-btn-primary-bg-color)" />
{:else if title === 'Recordar'}
  <Clock class="size-6 shrink-0 text-gray-400 group-hover:text-(--o-btn-primary-bg-color)" />
{:else if title === 'Pide y se te dará'}
  <Gift class="size-6 shrink-0 text-gray-400 group-hover:text-(--o-btn-primary-bg-color)" />
{/if}
