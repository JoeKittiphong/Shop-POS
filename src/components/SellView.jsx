import { currencyFormatter, formatThaiDate, formatThaiDateTime } from '../utils/format'

function hasProductPhoto(image) {
  return typeof image === 'string' && /^(data:image\/|https?:\/\/|blob:|\/)/.test(image)
}

function getProductCardStyle(image) {
  if (!hasProductPhoto(image)) {
    return undefined
  }

  return {
    backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.18) 0%, rgba(15, 23, 42, 0.04) 40%, rgba(15, 23, 42, 0.45) 100%), url("${image}")`,
  }
}

function SellView({
  cart,
  cashReceived,
  categories,
  change,
  filteredProducts,
  isBusy,
  saleMessage,
  searchTerm,
  selectedCategory,
  subtotal,
  totalItems,
  onAddToCart,
  onCashReceivedChange,
  onCategoryChange,
  onCheckout,
  onPrintBill,
  onRemoveCartItem,
  onResetCart,
  onSearchChange,
  onUpdateCartQuantity,
}) {
  return (
    <>
      <section className="panel sell-catalog-panel">
        <div className="catalog-toolbar">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="ค้นหาสินค้า"
            className="catalog-search"
          />
          <span className="tag compact-tag">{filteredProducts.length}</span>
        </div>

        <div className="category-row compact-category-row">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={`category-chip ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => onCategoryChange(category)}
            >
              {category === 'all' ? 'ทั้งหมด' : category}
            </button>
          ))}
        </div>

        <div className="product-grid dense-product-grid">
          {filteredProducts.length === 0 ? (
            <div className="empty-state">
              {isBusy ? 'กำลังโหลดข้อมูล...' : 'ยังไม่มีสินค้าในระบบ'}
            </div>
          ) : (
            filteredProducts.map((product) => {
              const hasPhoto = hasProductPhoto(product.image)
              const fallbackLabel = !hasPhoto && product.image ? product.image : product.name.slice(0, 1)

              return (
                <button
                  key={product.id}
                  type="button"
                  className={`product-card dense-product-card product-showcase-card ${hasPhoto ? 'has-photo' : 'no-photo'}`}
                  onClick={() => onAddToCart(product)}
                  style={getProductCardStyle(product.image)}
                >
                  <strong className="product-showcase-name">{product.name}</strong>
                  <div className="product-showcase-media">
                    {!hasPhoto ? (
                      <div className="product-card-fallback product-showcase-fallback">
                        {fallbackLabel}
                      </div>
                    ) : null}
                  </div>
                  <strong className="product-showcase-price">{currencyFormatter.format(product.price)}</strong>
                </button>
              )
            })
          )}
        </div>
      </section>

      <section className="panel bill-panel compact-bill-panel">
        <div className="panel-header">
          <div>
            <h2>{totalItems} ชิ้น</h2>
            <p className="bill-date">{formatThaiDate(new Date())}</p>
          </div>
          <div className="bill-header-actions">
            <button type="button" className="ghost-button" onClick={onPrintBill}>
              พิมพ์บิล
            </button>
            <button type="button" className="ghost-button" onClick={onResetCart}>
              ล้างบิล
            </button>
          </div>
        </div>

        <div className="bill-sheet">
          <div className="receipt-head">
            <strong>Shop POS</strong>
            <p>{formatThaiDateTime(new Date())}</p>
          </div>

          <div className="cart-list">
            {cart.length === 0 ? (
              <div className="empty-state">ยังไม่มีสินค้าในบิล</div>
            ) : (
              cart.map((item) => (
                <article className="cart-item receipt-item" key={item.productId}>
                  <div className="receipt-item-main">
                    <strong>{item.name}</strong>
                    <p>
                      {currencyFormatter.format(item.price)} x {item.quantity}
                    </p>
                  </div>
                  <div className="cart-actions">
                    <button
                      type="button"
                      className="qty-button"
                      onClick={() => onUpdateCartQuantity(item.productId, -1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      className="qty-button"
                      onClick={() => onUpdateCartQuantity(item.productId, 1)}
                    >
                      +
                    </button>
                    <strong>{currencyFormatter.format(item.price * item.quantity)}</strong>
                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => onRemoveCartItem(item.productId)}
                    >
                      ลบ
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="summary-card">
            <div className="summary-row">
              <span>ยอดรวม</span>
              <strong>{currencyFormatter.format(subtotal)}</strong>
            </div>
            <label className="field">
              รับเงิน
              <input
                type="number"
                min="0"
                step="0.01"
                value={cashReceived}
                onChange={(event) => onCashReceivedChange(event.target.value)}
                placeholder="0.00"
              />
            </label>
            <div className="summary-row">
              <span>เงินทอน</span>
              <strong>{currencyFormatter.format(change)}</strong>
            </div>
            <button type="button" className="primary-button full-width" onClick={onCheckout}>
              บันทึกการขาย
            </button>
            <p className="helper-text">{saleMessage}</p>
          </div>
        </div>
      </section>
    </>
  )
}

export default SellView
