import { useMemo, useState } from 'react'
import { currencyFormatter, formatThaiDateTime } from '../utils/format'

const rangeOptions = [
  { value: 'today', label: 'วันนี้' },
  { value: '7d', label: '7 วัน' },
  { value: '30d', label: '30 วัน' },
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'custom', label: 'กำหนดเอง' },
]

function toDateInputValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDateKey(date) {
  const value = new Date(date)
  return toDateInputValue(value)
}

function getStartOfDay(dateString) {
  return new Date(`${dateString}T00:00:00`)
}

function getEndOfDay(dateString) {
  return new Date(`${dateString}T23:59:59.999`)
}

function formatThaiShortDate(dateString) {
  return new Date(dateString).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function SalesView({ sales, totalSalesValue }) {
  const today = useMemo(() => new Date(), [])
  const [rangeType, setRangeType] = useState('30d')
  const [dateFrom, setDateFrom] = useState(toDateInputValue(new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6)))
  const [dateTo, setDateTo] = useState(toDateInputValue(today))

  const filteredSales = useMemo(() => {
    if (rangeType === 'all') {
      return sales
    }

    let startDate
    let endDate

    if (rangeType === 'today') {
      const todayValue = toDateInputValue(new Date())
      startDate = getStartOfDay(todayValue)
      endDate = getEndOfDay(todayValue)
    } else if (rangeType === '7d' || rangeType === '30d') {
      const end = new Date()
      const offset = rangeType === '7d' ? 6 : 29
      const start = new Date(end.getFullYear(), end.getMonth(), end.getDate() - offset)
      startDate = getStartOfDay(toDateInputValue(start))
      endDate = getEndOfDay(toDateInputValue(end))
    } else {
      if (!dateFrom || !dateTo) {
        return []
      }
      startDate = getStartOfDay(dateFrom)
      endDate = getEndOfDay(dateTo)
    }

    return sales.filter((sale) => {
      const createdAt = new Date(sale.createdAt)
      return createdAt >= startDate && createdAt <= endDate
    })
  }, [dateFrom, dateTo, rangeType, sales])

  const summary = useMemo(() => {
    const total = filteredSales.reduce((sum, sale) => sum + sale.total, 0)
    const bills = filteredSales.length
    const items = filteredSales.reduce(
      (sum, sale) => sum + sale.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
      0,
    )

    return {
      total,
      bills,
      items,
      averageBill: bills ? total / bills : 0,
    }
  }, [filteredSales])

  const dailySales = useMemo(() => {
    const grouped = new Map()

    filteredSales.forEach((sale) => {
      const key = getDateKey(sale.createdAt)
      const current = grouped.get(key) || { date: key, total: 0, bills: 0, items: 0 }
      current.total += sale.total
      current.bills += 1
      current.items += sale.items.reduce((sum, item) => sum + item.quantity, 0)
      grouped.set(key, current)
    })

    return Array.from(grouped.values()).sort((a, b) => b.date.localeCompare(a.date))
  }, [filteredSales])

  const topProducts = useMemo(() => {
    const grouped = new Map()

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const current = grouped.get(item.productId) || {
          productId: item.productId,
          name: item.name,
          quantity: 0,
          revenue: 0,
        }
        current.quantity += item.quantity
        current.revenue += item.price * item.quantity
        grouped.set(item.productId, current)
      })
    })

    return Array.from(grouped.values())
      .sort((a, b) => {
        if (b.quantity !== a.quantity) {
          return b.quantity - a.quantity
        }
        return b.revenue - a.revenue
      })
      .slice(0, 10)
  }, [filteredSales])

  return (
    <section className="panel panel-full sales-dashboard">
      <div className="panel-header">
        <div>
          <p className="eyebrow">สรุปยอดขาย</p>
          <h2>{filteredSales.length} บิลในช่วงที่เลือก</h2>
        </div>
        <span className="tag">{currencyFormatter.format(summary.total || totalSalesValue)}</span>
      </div>

      <div className="sales-filters">
        <div className="sales-filter-chips">
          {rangeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`filter-chip ${rangeType === option.value ? 'active' : ''}`}
              onClick={() => setRangeType(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="sales-date-inputs">
          <label className="field compact-field">
            จากวันที่
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value)
                setRangeType('custom')
              }}
            />
          </label>
          <label className="field compact-field">
            ถึงวันที่
            <input
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value)
                setRangeType('custom')
              }}
            />
          </label>
        </div>
      </div>

      <div className="sales-summary-grid">
        <article className="summary-tile">
          <span>ยอดขายรวม</span>
          <strong>{currencyFormatter.format(summary.total)}</strong>
        </article>
        <article className="summary-tile">
          <span>จำนวนบิล</span>
          <strong>{summary.bills}</strong>
        </article>
        <article className="summary-tile">
          <span>จำนวนชิ้นที่ขาย</span>
          <strong>{summary.items}</strong>
        </article>
        <article className="summary-tile">
          <span>ยอดเฉลี่ยต่อบิล</span>
          <strong>{currencyFormatter.format(summary.averageBill)}</strong>
        </article>
      </div>

      <div className="sales-report-grid">
        <section className="report-card">
          <div className="report-card-header">
            <h3>ยอดขายรายวัน</h3>
            <span className="tag">{dailySales.length} วัน</span>
          </div>
          <div className="report-list">
            {dailySales.length === 0 ? (
              <div className="empty-state">ยังไม่มียอดขายในช่วงเวลาที่เลือก</div>
            ) : (
              dailySales.map((day) => (
                <article className="report-row" key={day.date}>
                  <div>
                    <strong>{formatThaiShortDate(day.date)}</strong>
                    <p>{day.bills} บิล • {day.items} ชิ้น</p>
                  </div>
                  <strong>{currencyFormatter.format(day.total)}</strong>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="report-card">
          <div className="report-card-header">
            <h3>สินค้าขายดี</h3>
            <span className="tag">{topProducts.length} รายการ</span>
          </div>
          <div className="report-list">
            {topProducts.length === 0 ? (
              <div className="empty-state">ยังไม่มีสินค้าขายดีในช่วงเวลาที่เลือก</div>
            ) : (
              topProducts.map((product, index) => (
                <article className="report-row" key={product.productId}>
                  <div>
                    <strong>{index + 1}. {product.name}</strong>
                    <p>{product.quantity} ชิ้น</p>
                  </div>
                  <strong>{currencyFormatter.format(product.revenue)}</strong>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <section className="report-card">
        <div className="report-card-header">
          <h3>รายการบิลในช่วงที่เลือก</h3>
          <span className="tag">{filteredSales.length} บิล</span>
        </div>
        <div className="sales-list">
          {filteredSales.length === 0 ? (
            <div className="empty-state">ยังไม่มีประวัติการขายในช่วงเวลาที่เลือก</div>
          ) : (
            filteredSales.map((sale) => (
              <article className="sale-card" key={sale.id}>
                <div className="sale-card-header">
                  <div>
                    <strong>{sale.id}</strong>
                    <p>{formatThaiDateTime(sale.createdAt)}</p>
                  </div>
                  <strong>{currencyFormatter.format(sale.total)}</strong>
                </div>
                <p className="helper-text">
                  {sale.items.map((item) => `${item.name} x${item.quantity}`).join(', ')}
                </p>
              </article>
            ))
          )}
        </div>
      </section>
    </section>
  )
}

export default SalesView
