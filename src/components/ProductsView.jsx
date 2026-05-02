import { currencyFormatter } from '../utils/format'

function hasProductPhoto(image) {
  return typeof image === 'string' && /^(data:image\/|https?:\/\/|blob:|\/)/.test(image)
}

function handleImageUpload(event, onProductFormChange) {
  const file = event.target.files?.[0]

  if (!file) {
    return
  }

  const reader = new FileReader()
  reader.onload = () => {
    onProductFormChange('image', typeof reader.result === 'string' ? reader.result : '')
  }
  reader.readAsDataURL(file)
}

function ProductsView({
  isBusy,
  productForm,
  productMessage,
  products,
  onDeleteProduct,
  onEditProduct,
  onProductFormChange,
  onResetProductForm,
  onSubmit,
}) {
  const formHasPhoto = hasProductPhoto(productForm.image)

  return (
    <>
      <section className="panel products-catalog-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">รายการสินค้า</p>
            <h2>{products.length} รายการ</h2>
          </div>
        </div>

        <div className="product-grid products-management-grid">
          {products.length === 0 ? (
            <div className="empty-state">
              {isBusy ? 'กำลังโหลดข้อมูล...' : 'ยังไม่มีสินค้าในระบบ'}
            </div>
          ) : (
            products.map((product) => (
              <article className="product-card product-management-card" key={product.id}>
                <div className="product-management-thumb">
                  {hasProductPhoto(product.image) ? (
                    <img src={product.image} alt={product.name} className="product-management-image" />
                  ) : (
                    <div className="product-card-fallback product-management-fallback">
                      {product.image || product.name.slice(0, 1)}
                    </div>
                  )}
                </div>
                <strong>{product.name}</strong>
                <strong>{currencyFormatter.format(product.price)}</strong>
                <div className="product-management-actions">
                  <button type="button" className="ghost-button" onClick={() => onEditProduct(product)}>
                    แก้ไข
                  </button>
                  <button type="button" className="remove-button" onClick={() => onDeleteProduct(product.id)}>
                    ลบ
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="panel product-sidebar-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">จัดการสินค้า</p>
            <h2>{productForm.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้า'}</h2>
          </div>
        </div>

        <form className="product-form" onSubmit={onSubmit}>
          <div className="form-grid single-column-grid">
            <label className="field">
              ชื่อสินค้า
              <input
                type="text"
                value={productForm.name}
                onChange={(event) => onProductFormChange('name', event.target.value)}
                placeholder="เช่น น้ำเปล่า 600ml"
              />
            </label>
            <label className="field">
              ราคา
              <input
                type="number"
                min="0"
                step="0.01"
                value={productForm.price}
                onChange={(event) => onProductFormChange('price', event.target.value)}
                placeholder="20"
              />
            </label>
            <label className="field">
              หมวดหมู่
              <input
                type="text"
                value={productForm.category}
                onChange={(event) => onProductFormChange('category', event.target.value)}
                placeholder="เครื่องดื่ม"
              />
            </label>
            <label className="field">
              รูปสินค้า
              <input
                type="file"
                accept="image/*"
                onChange={(event) => handleImageUpload(event, onProductFormChange)}
              />
            </label>
          </div>

          {productForm.image ? (
            <div className="image-upload-preview">
              {formHasPhoto ? (
                <div className="image-preview-card">
                  <img src={productForm.image} alt={productForm.name || 'ตัวอย่างรูปสินค้า'} />
                </div>
              ) : (
                <div className="image-preview-card image-preview-fallback">
                  <div className="product-card-fallback product-management-fallback">
                    {productForm.image}
                  </div>
                </div>
              )}
              <button
                type="button"
                className="ghost-button"
                onClick={() => onProductFormChange('image', '')}
              >
                ลบรูป
              </button>
            </div>
          ) : null}

          <label className="checkbox-field">
            <input
              type="checkbox"
              checked={productForm.featured}
              onChange={(event) => onProductFormChange('featured', event.target.checked)}
            />
            แสดงในหน้าขาย
          </label>

          <div className="form-actions">
            <button type="submit" className="primary-button">
              {productForm.id ? 'อัปเดตสินค้า' : 'บันทึกสินค้า'}
            </button>
            <button type="button" className="ghost-button" onClick={onResetProductForm}>
              ยกเลิก
            </button>
          </div>
          <p className="helper-text">{productMessage}</p>
        </form>
      </section>
    </>
  )
}

export default ProductsView
