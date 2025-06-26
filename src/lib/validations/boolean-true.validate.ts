import * as v from 'valibot'

export const validateBooleanTrue = (input: { label: string; value: boolean }) => {
  const valueErr = v.safeParse(
    v.pipe(
      v.boolean('El valor de este campo es inválido.'),
      v.custom(() => {
        return input.value === true
      }, 'Por favor, confirma si vas a eliminar el registro.'),
    ),
    input.value,
  )
  if (valueErr.issues) {
    const result: any = {}
    result[input.label] = valueErr.issues[0].message
    throw new Error(JSON.stringify(result))
  }
}
