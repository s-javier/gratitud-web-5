import filterAllTableByText from './filter-all-table-by-text'

export default function (
  table: any,
  initSort: any[],
  initFilter: any,
  search: string,
  rows: number,
) {
  // console.log('1. ***', sort)
  if (initSort.length > 0) {
    for (let element of initSort) {
      table.exec('sort-rows', {
        key: element.key,
        order: element.order,
      })
      table.exec('sort-rows', {
        key: element.key,
        order: element.order,
      })
    }
  }
  // console.log('2. ***', table.getState().sort)

  if (initFilter) {
    table.exec('filter-rows', { filet: initFilter })
  }

  if (search) {
    filterAllTableByText(table, search, rows)
  }
}
