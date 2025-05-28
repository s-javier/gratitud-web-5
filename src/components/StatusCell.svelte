<script>
  let props = $props()

  let status = $derived(props.row.isActive || props.row.isSelected ? 'Sí' : 'No')
</script>

<div class="container flex justify-center">
  <div class="status {props.row.isActive || props.row.isSelected ? 'active' : 'non-active'}">
    <div class="dot"></div>
    {status}
  </div>
</div>

<style>
  .container {
    height: 100%;
  }
  .container,
  .status {
    display: flex;
    align-items: center;
  }
  .status {
    justify-content: center;
    border-radius: 12px;
    padding: 0 8px;
    gap: 4px;
    position: relative;
  }
  .status:before {
    position: absolute;
    height: 100%;
    width: 100%;
    content: '';
    border-radius: 18px;
    opacity: 0.15;
  }
  .status.active::before,
  .active .dot {
    /* background: var(--wx-color-success); */
    background: var(--color-green-500);
  }
  .active {
    /* color: var(--wx-color-success); */
    color: var(--color-green-500);
  }
  .status.non-active::before,
  .non-active .dot {
    /* background: var(--wx-color-font-alt); */
    background: var(--color-red-400);
  }
  .non-active {
    /* color: var(--wx-color-font-alt); */
    color: var(--color-red-400);
  }
  .dot {
    height: 6px;
    width: 6px;
    border-radius: 50%;
  }
</style>
