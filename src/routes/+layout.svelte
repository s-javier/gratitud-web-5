<script lang="ts">
  import 'noph-ui/defaultTheme'
  import '../app.css'
  import { beforeNavigate, afterNavigate } from '$app/navigation'
  import { toast, Toasts } from 'svoast'
  // @ts-ignore
  // import { Willow } from 'wx-svelte-core'
  import { loader } from '~/stores/loader.svelte'
  import LoaderOverlay from '~/components/LoaderOverlay.svelte'

  beforeNavigate(() => {
    loader.is = true
  })

  afterNavigate(() => {
    loader.is = false
  })

  let isShowError = $state(false)

  let { data, children } = $props()

  $effect(() => {
    console.info('/src/routes/+layout.svelte - Datos:', data)
    if ('error' in data && data.error?.server && isShowError === false) {
      isShowError = true
      toast.error(data.error.server, {
        closable: true,
        infinite: true,
        onRemove: () => (isShowError = false),
      })
    }
  })
</script>

<!-- <div class="text-right">{loader.is ? 'Cargando' : '~ cargando'}</div> -->
{@render children()}
<!-- <Willow></Willow> -->
<LoaderOverlay />
<Toasts position="top-right" />
