import './App.css'
import AppHeader from './components/AppHeader'
import ProductsView from './components/ProductsView'
import SalesView from './components/SalesView'
import SellView from './components/SellView'
import { usePosData } from './hooks/usePosData'

function App() {
  const pos = usePosData()

  function handleProductSubmit(event) {
    event.preventDefault()
    void pos.submitProductForm()
  }

  function updateProductForm(field, value) {
    pos.setProductForm((current) => ({ ...current, [field]: value }))
  }

  return (
    <div className={`app-shell ${pos.isSellPage ? 'app-shell-sell' : ''}`}>
      <AppHeader
        activeTab={pos.activeTab}
        onChangeTab={pos.setActiveTab}
        onLoadSampleProducts={() => void pos.loadSampleProducts()}
        onClearAllData={() => void pos.clearAllData()}
      />

      <main className="layout">
        {pos.activeTab === 'sell' ? (
          <SellView
            cart={pos.cart}
            cashReceived={pos.cashReceived}
            categories={pos.categories}
            change={pos.change}
            filteredProducts={pos.filteredProducts}
            isBusy={pos.isBusy}
            saleMessage={pos.saleMessage}
            searchTerm={pos.searchTerm}
            selectedCategory={pos.selectedCategory}
            subtotal={pos.subtotal}
            totalItems={pos.totalItems}
            onAddToCart={pos.addToCart}
            onCashReceivedChange={pos.setCashReceived}
            onCategoryChange={pos.setSelectedCategory}
            onCheckout={() => void pos.checkout()}
            onPrintBill={pos.printBill}
            onRemoveCartItem={pos.removeCartItem}
            onResetCart={pos.resetCart}
            onSearchChange={pos.setSearchTerm}
            onUpdateCartQuantity={pos.updateCartQuantity}
          />
        ) : null}

        {pos.activeTab === 'products' ? (
          <ProductsView
            isBusy={pos.isBusy}
            productForm={pos.productForm}
            productMessage={pos.productMessage}
            products={pos.products}
            onDeleteProduct={(productId) => void pos.removeProduct(productId)}
            onEditProduct={pos.startEditingProduct}
            onProductFormChange={updateProductForm}
            onResetProductForm={pos.resetProductForm}
            onSubmit={handleProductSubmit}
          />
        ) : null}

        {pos.activeTab === 'sales' ? (
          <SalesView
            sales={pos.sales}
            totalSalesValue={pos.totalSalesValue}
          />
        ) : null}
      </main>
    </div>
  )
}

export default App
