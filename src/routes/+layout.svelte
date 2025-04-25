<script lang="ts">
  import 'noph-ui/defaultTheme'
  import '../app.css'
  import { loader } from '~/stores/loader.svelte'

  let { children } = $props()
</script>

<div class="text-right">{loader.is ? 'Cargando' : '~ cargando'}</div>
{@render children()}
