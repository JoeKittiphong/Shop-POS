const tabs = [
  { id: 'sell', label: 'หน้าขาย' },
  { id: 'products', label: 'สินค้า' },
  { id: 'sales', label: 'ประวัติการขาย' },
]

function AppTabs({ activeTab, isSellPage, onChange }) {
  return (
    <div className={`tab-row ${isSellPage ? 'tab-row-compact' : ''}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default AppTabs
