import * as v from 'valibot'

type Input = {
  label: string
  value: string
  options: {
    isPossibleEmpty?: boolean
    minLength?: number
    maxLength?: number
  }
}

export const validateText = (input: Input) => {
  let valueErr: any

  if (input.options.isPossibleEmpty && input.value.length === 0) {
    valueErr = v.safeParse(
      v.pipe(v.string('El valor de este campo es inválido.'), v.trim()),
      input.value,
    )
  } else if (input.options.minLength && input.options.maxLength) {
    valueErr = v.safeParse(
      v.pipe(
        v.string('El valor de este campo es inválido.'),
        v.trim(),
        v.nonEmpty('El valor de este campo es inválido.'),
        v.minLength(input.options.minLength, 'Por favor, escribe un poco más.'),
        v.maxLength(input.options.maxLength, 'Mucho texto. Por favor, escribe menos.'),
      ),
      input.value,
    )
  }

  if (valueErr.issues) {
    const result: any = {}
    result[input.label] = valueErr.issues[0].message
    throw new Error(JSON.stringify(result))
  }
}
