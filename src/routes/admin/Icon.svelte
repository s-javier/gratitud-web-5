<script lang="ts">
  import { BuildingOffice2, Identification, LockOpen, Users, Window } from 'svelte-heros-v2'

  let { title } = $props()
</script>

{#if title === 'Organizaciones'}
  <BuildingOffice2 class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
{:else if title === 'Roles'}
  <Identification class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
{:else if title === 'Permisos'}
  <LockOpen class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
{:else if title === 'Usuarios'}
  <Users class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
{:else if title === 'Páginas de menú'}
  <Window class="size-6 shrink-0 text-gray-400 group-hover:text-indigo-600" />
{/if}
