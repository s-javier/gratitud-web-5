<script lang="ts">
  import { toast } from 'svoast'
  // @ts-ignore
  import { Grid, Material } from 'wx-svelte-grid'

  let { data }: any = $props()

  $effect(() => {
    if ('error' in data && data.error?.server) {
      toast.error(data.error.server, { closable: true, infinite: true })
    }
  })

  const columns = [
    {
      id: 'id',
      header: 'ID',
      // footer: 'ID',
      width: 300,
    },
    {
      id: 'title',
      header: [
        'Organización',
        {
          filter: {
            type: 'text',
            config: {
              icon: 'wxi-search', // Optional icon for the filter input
              clear: true, // Allow clearing the input
            },
          },
        },
      ],
      sort: true,
    },
    {
      id: 'isActive',
      header: 'Activa?',
    },
  ]
</script>

<h1 class="text-2xl/8 font-semibold text-zinc-950 sm:text-xl/8 dark:text-white">Organizaciones</h1>
<hr
  role="presentation"
  class="mt-6 mb-10 w-full border-t border-zinc-950/10 dark:border-white/10"
/>
<Material>
  <Grid data={data.organizations || []} {columns} />
</Material>
