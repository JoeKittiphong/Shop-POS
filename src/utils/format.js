export const currencyFormatter = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
})

export function formatThaiDate(date) {
  return new Date(date).toLocaleDateString('th-TH', { dateStyle: 'full' })
}

export function formatThaiDateTime(date) {
  return new Date(date).toLocaleString('th-TH')
}
