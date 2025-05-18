export default function filterAllTableByText(table: any, text: string, rows: number) {
  if (!table) {
    return
  }
  if (text.length === 0) {
    if (table.getReactiveState().data.length === rows) {
      return
    }
    table.exec('filter-rows', { filter: () => true })
    return
  }
  const value = text.toLowerCase()
  table.exec('filter-rows', {
    filter: (row: any) => {
      // console.log('-> Fila')
      const keys = Object.keys(row)
      let rowResult = false
      for (let key of keys) {
        // console.log(
        //   `Revisando la llave ${key} con el valor ${row[key]} y con el filtro: #${value}#`,
        // )
        switch (typeof row[key]) {
          case 'string':
            if (row[key].toLowerCase().includes(value)) {
              rowResult ||= true
            }
            break
          case 'boolean':
            if (row[key] === true && 'activa'.includes(value)) {
              rowResult ||= true
            } else if (row[key] === false && 'activa'.includes(value)) {
              rowResult ||= true
            }
            break
        }
        /* ↓ Si el rowResult ya es true, no hace falta seguir revisando */
        if (rowResult) {
          return true
        }
      }
      return false
    },
  })
}
