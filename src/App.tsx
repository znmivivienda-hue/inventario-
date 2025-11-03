import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { AuthGuard } from '@/components/AuthGuard'

// Pages
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import InventoryPage from '@/pages/InventoryPage'
import EntryPage from '@/pages/EntryPage'
import ExitPage from '@/pages/ExitPage'
import HistoryPage from '@/pages/HistoryPage'
import UserManagementPage from '@/pages/UserManagementPage'  // ← Nuevo import
import MainLayout from '@/layouts/MainLayout'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Ruta de autenticación */}
            <Route path="/login" element={<LoginPage />} />
            
            {/* Rutas principales protegidas */}
            <Route path="/" element={
              <AuthGuard>
                <MainLayout />
              </AuthGuard>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="inventory" element={<InventoryPage />} />
              <Route path="entry" element={<EntryPage />} />
              <Route path="exit" element={<ExitPage />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="users" element={<UserManagementPage />} />  {/* ← Nueva ruta */}
            </Route>
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App