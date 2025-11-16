import { Link } from 'react-router-dom'
import { LayoutDashboard, LogIn, LogOut, ShieldCheck, TrendingUp, GitCompare } from 'lucide-react'
import { useState } from 'react'

import { useAuth } from '../hooks/useAuth.js'

export default function NavBar() {
  const { isAuthenticated, user, logout } = useAuth()
  const [showScenarioMenu, setShowScenarioMenu] = useState(false)

  const handleLogout = () => {
    logout()
  }

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-3 text-gray-900 group">
          <img
            src="/LOGO-TOTALPEC-ALTA.png"
            alt="TOTAL PEC Logo"
            className="h-12 w-auto object-contain transition-transform group-hover:scale-105"
          />
          <div className="border-l-2 border-blue-600 pl-3">
            <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">INNOVAHACK 2025</p>
            <p className="text-lg font-semibold text-gray-900">Data Forecast Suite</p>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <Link
                to="/"
                className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                Inicio
              </Link>
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
              
              {/* Menú desplegable de Escenarios */}
              <div className="relative">
                <button 
                  onClick={() => setShowScenarioMenu(!showScenarioMenu)}
                  className="text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors flex items-center gap-1"
                >
                  Escenarios
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showScenarioMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowScenarioMenu(false)}
                    />
                    <div className="absolute top-full left-0 mt-1 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        to="/scenarios/comparison"
                        onClick={() => setShowScenarioMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <GitCompare className="h-4 w-4" />
                        Comparativa de Escenarios
                      </Link>
                      <Link
                        to="/scenarios/builder"
                        onClick={() => setShowScenarioMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <TrendingUp className="h-4 w-4" />
                        Crear Escenario Personalizado
                      </Link>
                    </div>
                  </>
                )}
              </div>
              
              {/* Botón Admin - Solo visible para ADMIN */}
              {user.role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-2 rounded-sm bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-purple-700"
                >
                  <ShieldCheck className="h-4 w-4" />
                  Admin
                </Link>
              )}
              
              <div className="h-6 w-px bg-gray-300"></div>
              <span className="text-sm font-medium text-gray-900">
                {user.full_name.split(' ')[0]}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-sm bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-200"
              >
                <LogOut className="h-4 w-4" />
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-2 rounded-sm bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4" />
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
