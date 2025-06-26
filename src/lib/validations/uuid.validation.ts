import * as v from 'valibot'

export const validateUUIDV4 = (input: { label: string; value: string }, error: any = undefined) => {
  const valueErr = v.safeParse(
    v.pipe(
      v.string('El valor de este campo es inválido.'),
      v.nonEmpty('Este campo es requerido.'),
      v.uuid('El valor de este campo es inválido.'),
    ),
    input.value,
  )
  if (valueErr.issues) {
    const result: any = {}
    result.error[input.label] = error || valueErr.issues[0].message
    throw new Error(JSON.stringify(result))
  }
}
