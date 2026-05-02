const tabs = [
  { id: 'sell', label: 'หน้าขาย' },
  { id: 'products', label: 'สินค้า' },
  { id: 'sales', label: 'ประวัติการขาย' },
]

function AppHeader({
  activeTab,
  onChangeTab,
  onLoadSampleProducts,
  onClearAllData,
}) {
  return (
    <header className="app-navbar">
      <nav className="navbar-tabs" aria-label="Main navigation">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onChangeTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="navbar-actions">
        <button type="button" className="ghost-button" onClick={onLoadSampleProducts}>
          โหลดข้อมูลตัวอย่าง
        </button>
        <button type="button" className="danger-button" onClick={onClearAllData}>
          ล้างข้อมูลทั้งหมด
        </button>
      </div>
    </header>
  )
}

export default AppHeader
