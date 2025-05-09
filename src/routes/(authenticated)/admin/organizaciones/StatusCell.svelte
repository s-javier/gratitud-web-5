<script>
  let { row } = $props()

  let status = $derived(row.isActive ? 'Activa' : 'Inactiva')
</script>

<div class="container flex justify-center">
  <div class="status {row.isActive ? 'active' : 'non-active'}">
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
    background: var(--wx-color-success);
  }
  .active {
    color: var(--wx-color-success);
  }
  .status.non-active::before,
  .non-active .dot {
    background: var(--wx-color-font-alt);
  }
  .non-active {
    color: var(--wx-color-font-alt);
  }
  .dot {
    height: 6px;
    width: 6px;
    border-radius: 50%;
  }
</style>
