<script lang="ts">
  import Overlay from '~/components/Overlay.svelte'
  import { overlayLoader } from '~/stores/loader.svelte'
</script>

<Overlay type="dialog" isActive={overlayLoader.is} zIndex="z-1600">
  <svg viewBox="0 0 24 24" class="max-w-36 fill-(--o-overlay-loader)">
    <path
      class="spinner_Uvk8"
      d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"
      transform="translate(12, 12) scale(0)"
    ></path>
    <path
      class="spinner_Uvk8 spinner_ypeD"
      d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"
      transform="translate(12, 12) scale(0)"
    ></path>
    <path
      class="spinner_Uvk8 spinner_y0Rj"
      d="M12,1A11,11,0,1,0,23,12,11,11,0,0,0,12,1Zm0,20a9,9,0,1,1,9-9A9,9,0,0,1,12,21Z"
      transform="translate(12, 12) scale(0)"
    ></path>
  </svg>
</Overlay>
