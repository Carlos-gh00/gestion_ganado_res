import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NAV_ITEMS } from './utils/constants'

// Layout
import Sidebar from './components/layout/Sidebar'
import MobileSidebar from './components/layout/MobileSidebar'
import MobileTopbar from './components/layout/MobileTopbar'
import MobileBottomNav from './components/layout/MobileBottomNav'

// Pages
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AnimalsPage from './pages/AnimalsPage'
import HealthPage from './pages/HealthPage'
import InventoryPage from './pages/InventoryPage'
import ReportsPage from './pages/ReportsPage'
import AdminPage from './pages/AdminPage'

function Shell() {
  const { user, logout } = useAuth()
  const [page, setPage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return <LoginPage />

  const visibleNav = NAV_ITEMS.filter((n) => n.roles.includes(user.rol))
  const currentPage = visibleNav.some((n) => n.id === page) ? page : (visibleNav[0]?.id || 'dashboard')

  const pages = {
    dashboard: <DashboardPage />,
    animals:   <AnimalsPage />,
    health:    <HealthPage />,
    inventory: <InventoryPage />,
    reports:   <ReportsPage />,
    admin:     <AdminPage />,
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: '#f7f2ea' }}>
      {/* Desktop Sidebar */}
      <Sidebar
        currentPage={currentPage}
        navItems={visibleNav}
        user={user}
        onNavigate={setPage}
        onLogout={logout}
      />

      {/* Mobile Sidebar Overlay */}
      <MobileSidebar
        isOpen={sidebarOpen}
        currentPage={currentPage}
        navItems={visibleNav}
        user={user}
        onClose={() => setSidebarOpen(false)}
        onNavigate={setPage}
        onLogout={logout}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Topbar */}
        <MobileTopbar
          user={user}
          onToggleSidebar={() => setSidebarOpen(true)}
        />

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto">
          {pages[currentPage]}
        </main>

        {/* Mobile Bottom Nav */}
        <MobileBottomNav
          currentPage={currentPage}
          navItems={visibleNav}
          onNavigate={setPage}
        />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  )
}
