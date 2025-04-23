<script lang="ts">
  let { children } = $props()
</script>

<div class="flex h-screen bg-gray-100">
  <!-- Sidebar -->
  <aside class="flex w-64 flex-col bg-gray-800">
    <div class="flex h-16 items-center justify-center bg-gray-900">
      <span class="text-xl font-bold tracking-wide text-white">Panel Admin</span>
    </div>
    <nav class="flex-1 space-y-1 px-2 py-4">
      <a
        href="/"
        class="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        <svg
          class="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-300"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7"></path></svg
        >
        Salir
      </a>
      <a
        href="/uno"
        class="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        <svg
          class="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-300"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></svg
        >
        Uno
      </a>
      <a
        href="/dos"
        class="group flex items-center rounded-md px-2 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
      >
        <svg
          class="mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-300"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="2"></rect></svg
        >
        Dos
      </a>
    </nav>
    <div class="p-4 text-xs text-gray-500">&copy; 2024 Gratitud</div>
  </aside>
  <!-- Main content -->
  <main class="flex-1 overflow-auto p-8">
    {@render children()}
  </main>
</div>
