<script lang="ts">
  import Overlay from '~/components/Overlay.svelte'
  import { loader } from '~/stores/loader.svelte'
</script>

<Overlay type="dialog" isActive={loader.is} zIndex="z-1600">
  <!-- ↓ pink-500 -->
  <svg viewBox="0 0 24 24" fill="#ec4899" class="max-w-36">
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
