<script lang="ts">
  const props: {
    id: string
    label: string
    labelClass?: string
    type: string
    name: string
    value?: string
    placeholder?: string
    inputClass?: string
  } = $props()
</script>

<label for={props.id} class={['block text-sm/6 font-medium text-gray-900', props.labelClass ?? '']}
  >{props.label}</label
>
<div class="mt-2">
  <input
    type={props.type}
    name={props.name}
    id={props.id}
    class={[
      'block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900',
      'outline-1 -outline-offset-1 outline-gray-300',
      'placeholder:text-gray-400',
      'focus:outline-2 focus:-outline-offset-2 focus:outline-(--o-input-border-focus-color) sm:text-sm/6',
      props.inputClass ?? '',
    ]}
    placeholder={props.placeholder ?? ''}
  />
</div>
