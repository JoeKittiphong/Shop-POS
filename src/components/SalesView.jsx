import { currencyFormatter, formatThaiDateTime } from '../utils/format'

function SalesView({ sales, totalSalesValue }) {
  return (
    <section className="panel panel-full">
      <div className="panel-header">
        <div>
          <p className="eyebrow">ประวัติการขาย</p>
          <h2>{sales.length} บิล</h2>
        </div>
        <span className="tag">{currencyFormatter.format(totalSalesValue)}</span>
      </div>

      <div className="sales-list">
        {sales.length === 0 ? (
          <div className="empty-state">ยังไม่มีประวัติการขาย</div>
        ) : (
          sales.map((sale) => (
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
  )
}

export default SalesView
