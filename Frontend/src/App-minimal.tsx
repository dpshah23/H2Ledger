import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { MainLayout } from './layouts/MainLayout'
import { ProtectedRoute } from './layouts/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import CreditsFixed from './pages/Credits-fixed'
import { Audit } from './pages/Audit'

function TestPage() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>H2Ledger - Testing All Pages</h1>
      <p>Testing all main components</p>
      <div style={{ marginTop: '10px' }}>
        <a href="/login" style={{ color: 'blue', marginRight: '20px' }}>Go to Login Page</a>
        <a href="/register" style={{ color: 'blue', marginRight: '20px' }}>Go to Register Page</a>
        <a href="/dashboard" style={{ color: 'blue', marginRight: '20px' }}>Go to Dashboard</a>
        <a href="/credits" style={{ color: 'blue', marginRight: '20px' }}>Go to Credits</a>
        <a href="/audit" style={{ color: 'blue' }}>Go to Audit</a>
      </div>
    </div>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="credits" element={<CreditsFixed />} />
              <Route path="audit" element={
                <ProtectedRoute requiredRole={['regulator', 'admin']}>
                  <Audit />
                </ProtectedRoute>
              } />
            </Route>

            {/* Test page */}
            <Route path="/test" element={<TestPage />} />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
