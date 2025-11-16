import { useEffect } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'

import Footer from './components/Footer.jsx'
import NavBar from './components/NavBar.jsx'
import { initializeSession } from './lib/forecastStorage.js'

export default function App() {
  useEffect(() => {
    // Limpiar localStorage al iniciar una nueva sesión del navegador
    initializeSession()
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <NavBar />
      <ScrollRestoration />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
