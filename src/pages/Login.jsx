import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle, Loader2, LockKeyhole, ShieldCheck, Sparkles } from 'lucide-react'

import { useAuth } from '../hooks/useAuth.js'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [status, setStatus] = useState({ loading: false, error: null, success: null })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, error: null, success: null })
    try {
      await login({ email: form.email, password: form.password })
      setStatus({ loading: false, error: null, success: 'Sesion iniciada correctamente.' })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setStatus({ loading: false, error: error.message, success: null })
    }
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 px-6 py-16">
      <div className="grid w-full max-w-5xl gap-8 rounded-sm border border-gray-200 bg-white p-8 shadow-lg text-gray-900 md:grid-cols-2">
        <div className="rounded-sm bg-gray-50 p-6 border border-gray-200">
          <div className="inline-flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-4 py-2 text-xs uppercase tracking-wider text-gray-700 font-semibold">
            Servicio privado TOTAL PEC
          </div>
          <h2 className="mt-6 text-3xl font-light text-gray-900">Autenticacion <span className="font-semibold text-blue-600">corporativa</span></h2>
          <p className="mt-3 text-sm text-gray-600">
            El acceso esta limitado al equipo de INNOVAHACK 2025. Un unico administrador origina cuentas
            ADMIN y USER para operar los tableros, flujos de carga y forecast.
          </p>
          <ul className="mt-8 space-y-4 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-5 w-5 text-teal-600" />
              <span>Tokens firmados y expiracion controlable para sesiones de alta sensibilidad.</span>
            </li>
            <li className="flex items-start gap-3">
              <LockKeyhole className="mt-1 h-5 w-5 text-blue-600" />
              <span>Solo el rol ADMIN puede crear, editar o suspender cuentas.</span>
            </li>
            <li className="flex items-start gap-3">
              <Sparkles className="mt-1 h-5 w-5 text-indigo-600" />
              <span>Experiencia empresarial profesional con feedback inmediato.</span>
            </li>
          </ul>
          <div className="mt-8 rounded-sm border border-gray-200 bg-white p-4 text-xs text-gray-600">
            No tienes credenciales? Contacta al administrador en{' '}
            <a href="mailto:innovation@totalpec.com" className="text-blue-600 underline">
              innovation@totalpec.com
            </a>
            .
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-lg font-semibold text-gray-900">Iniciar sesion privada</p>
          <div className="mt-6">
            <label className="text-xs uppercase tracking-wider text-gray-600 font-semibold">Correo corporativo</label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="nombre@totalpec.com"
              className="mt-2 w-full rounded-sm border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>
          <div className="mt-6">
            <label className="text-xs uppercase tracking-wider text-gray-600 font-semibold">Contrasena</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="********"
              className="mt-2 w-full rounded-sm border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
              required
            />
          </div>
          {status.error && (
            <div className="mt-6 flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span>{status.error}</span>
            </div>
          )}
          {status.success && (
            <div className="mt-6 rounded-sm border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-700">
              {status.success}
            </div>
          )}
          <button
            type="submit"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-sm bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-blue-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
            disabled={status.loading}
          >
            {status.loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Entrar a dashboard
          </button>
          <p className="mt-4 text-center text-xs text-gray-600">
            Al continuar aceptas el{' '}
            <Link to="/" className="text-blue-600 underline">
              manifiesto de innovacion TOTAL PEC
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  )
}
