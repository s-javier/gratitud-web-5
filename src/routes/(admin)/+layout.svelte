<script lang="ts">
  let { children } = $props()
</script>

<nav class="bg-gray-800 p-4">
  <ul class="flex space-x-4">
    <li>
      <a href="/" class="text-white hover:text-gray-300">Salir</a>
    </li>
    <li>
      <a href="/uno" class="text-white hover:text-gray-300">Uno</a>
    </li>
    <li>
      <a href="/dos" class="text-white hover:text-gray-300">Dos</a>
    </li>
  </ul>
</nav>

{@render children()}
