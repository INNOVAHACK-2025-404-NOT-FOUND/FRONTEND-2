
import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, ShieldCheck, UserPlus } from 'lucide-react'

import { createUser, listUsers } from '../lib/api.js'
import { useAuth } from '../hooks/useAuth.js'

export default function Admin() {
  const { token } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({ full_name: '', email: '', password: '', role: 'USER' })
  const [status, setStatus] = useState({ loading: false, error: null, success: null })

  const loadUsers = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const payload = await listUsers(token)
      setUsers(payload.results || payload.users || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, error: null, success: null })
    try {
      await createUser(form, token)
      setStatus({ loading: false, error: null, success: 'Usuario creado correctamente.' })
      setForm({ full_name: '', email: '', password: '', role: 'USER' })
      loadUsers()
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: null })
    }
  }

  return (
    <div className="bg-gray-50 min-h-screen px-6 py-12 text-gray-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-10">
        <section className="rounded-sm border border-gray-200 bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-teal-600" />
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-600">Administraci�n</p>
              <h1 className="text-2xl font-semibold">Gestionar cuentas</h1>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
            <label className="text-sm text-gray-900 font-semibold">
              Nombre completo
              <input
                type="text"
                name="full_name"
                value={form.full_name}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none"
                required
              />
            </label>
            <label className="text-sm text-gray-900 font-semibold">
              Correo
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none"
                required
              />
            </label>
            <label className="text-sm text-gray-900 font-semibold">
              Contrase�a
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none"
                required
              />
            </label>
            <label className="text-sm text-gray-900 font-semibold">
              Rol
              <select
                name="role"
                value={form.role}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 focus:outline-none"
              >
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
              </select>
            </label>
            {status.error && (
              <div className="md:col-span-2 flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                {status.error}
              </div>
            )}
            {status.success && (
              <div className="md:col-span-2 flex items-center gap-2 rounded-sm border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-700">
                <CheckCircle2 className="h-4 w-4" />
                {status.success}
              </div>
            )}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-sm bg-teal-600 hover:bg-teal-700 hover:shadow-lg shadow-md px-6 py-3 text-sm font-semibold text-gray-900 transition disabled:opacity-60"
                disabled={status.loading}
              >
                <UserPlus className="h-4 w-4" />
                Crear usuario
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-sm border border-gray-200 bg-white p-6">
          <p className="text-sm uppercase tracking-wider text-gray-600">Usuarios existentes</p>
          {loading && <p className="mt-4 animate-pulse text-sm text-gray-700">Cargando usuarios�</p>}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="mt-4 overflow-x-auto rounded-sm border border-gray-200 bg-white">
            <table className="w-full min-w-[520px] text-sm text-gray-900">
              <thead className="text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Correo</th>
                  <th className="px-4 py-3 text-left">Rol</th>
                  <th className="px-4 py-3 text-right">Creado</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t border-gray-200">
                    <td className="px-4 py-3 font-semibold">{user.full_name}</td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">{user.role}</td>
                    <td className="px-4 py-3 text-right">
                      {user.created_at ? new Date(user.created_at).toLocaleString('es-PE') : '�'}
                    </td>
                  </tr>
                ))}
                {!users.length && !loading && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      Sin usuarios registrados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  )
}


