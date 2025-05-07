<script lang="ts">
  import 'noph-ui/defaultTheme'
  import '../app.css'
  import { beforeNavigate, afterNavigate } from '$app/navigation'
  import { Toasts } from 'svoast'
  import { loader } from '~/stores/loader.svelte'
  import LoaderOverlay from '~/components/LoaderOverlay.svelte'

  beforeNavigate(() => {
    loader.is = true
  })

  afterNavigate(() => {
    loader.is = false
  })

  let { children } = $props()
</script>

<!-- <div class="text-right">{loader.is ? 'Cargando' : '~ cargando'}</div> -->
{@render children()}
<LoaderOverlay />
<Toasts position="top-right" />
