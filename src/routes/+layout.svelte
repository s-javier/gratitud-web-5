<script lang="ts">
  import 'noph-ui/defaultTheme'
  import '../app.css'
  import { Toasts } from 'svoast'
  // import { loader } from '~/stores/loader.svelte'
  import LoaderOverlay from '~/components/LoaderOverlay.svelte'

  let { children } = $props()
</script>

<!-- <div class="text-right">{loader.is ? 'Cargando' : '~ cargando'}</div> -->
{@render children()}
<LoaderOverlay />
<Toasts position="top-right" />
