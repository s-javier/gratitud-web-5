// @ts-ignore
import { type RowComponent } from 'tabulator-tables'

export function clearHighlight(selectedRow: RowComponent) {
  if (selectedRow) {
    selectedRow.getElement().style.backgroundColor = ''
    selectedRow = null
  }
}
