import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, CheckCircle2, ShieldCheck, UserPlus, Edit2, Trash2, X, Users, Shield, Mail, Key } from 'lucide-react'

import { createUser, listUsers, updateUser, deleteUser } from '../lib/api.js'
import { useAuth } from '../hooks/useAuth.js'

export default function Admin() {
  const { token, user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
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

  // Verificar que el usuario es ADMIN
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 px-6 py-12">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl bg-red-500/10 border border-red-400/40 p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Acceso Denegado</h2>
            <p className="text-red-100">No tienes permisos para acceder a esta página.</p>
          </div>
        </div>
      </div>
    )
  }

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleCreateUser = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, error: null, success: null })
    try {
      await createUser(form, token)
      setStatus({ loading: false, error: null, success: 'Usuario creado correctamente.' })
      setForm({ full_name: '', email: '', password: '', role: 'USER' })
      setShowCreateModal(false)
      loadUsers()
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: null })
    }
  }

  const handleEditClick = (userToEdit) => {
    setEditingUser(userToEdit)
    setForm({
      full_name: userToEdit.full_name,
      email: userToEdit.email,
      password: '',
      role: userToEdit.role
    })
    setShowEditModal(true)
    setStatus({ loading: false, error: null, success: null })
  }

  const handleUpdateUser = async (event) => {
    event.preventDefault()
    setStatus({ loading: true, error: null, success: null })
    try {
      const updateData = {
        full_name: form.full_name,
        email: form.email,
        role: form.role
      }
      if (form.password) {
        updateData.password = form.password
      }
      await updateUser(editingUser.id, updateData, token)
      setStatus({ loading: false, error: null, success: 'Usuario actualizado correctamente.' })
      setForm({ full_name: '', email: '', password: '', role: 'USER' })
      setShowEditModal(false)
      setEditingUser(null)
      loadUsers()
    } catch (err) {
      setStatus({ loading: false, error: err.message, success: null })
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario? Esta acción no se puede deshacer.')) {
      return
    }
    try {
      await deleteUser(userId, token)
      loadUsers()
    } catch (err) {
      alert(`Error al eliminar: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 px-6 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <ShieldCheck className="h-10 w-10 text-cyan-400" />
                Panel de Administración
              </h1>
              <p className="mt-2 text-white/70">
                Gestiona usuarios y permisos del sistema
              </p>
            </div>
            <button
              onClick={() => {
                setForm({ full_name: '', email: '', password: '', role: 'USER' })
                setStatus({ loading: false, error: null, success: null })
                setShowCreateModal(true)
              }}
              className="flex items-center gap-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 px-6 py-3 text-sm font-medium text-white transition"
            >
              <UserPlus className="h-5 w-5" />
              Nuevo Usuario
            </button>
          </div>
        </section>

        {/* Error general */}
        {error && (
          <div className="rounded-2xl bg-red-500/10 border border-red-400/40 p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="text-red-100">{error}</p>
          </div>
        )}

        {/* Tabla de usuarios */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                <Users className="h-6 w-6 text-cyan-400" />
                Usuarios del Sistema
              </h2>
              <p className="text-sm text-white/60 mt-1">
                Total: {users.length} usuario{users.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                    Fecha Creación
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/5">
                    <td className="px-4 py-4 text-sm font-medium text-white">
                      {u.full_name}
                    </td>
                    <td className="px-4 py-4 text-sm text-white/70">
                      {u.email}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {u.role === 'ADMIN' ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/20 border border-purple-400/40 px-3 py-1 text-xs font-semibold text-purple-200">
                          <Shield className="h-3 w-3" />
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/20 border border-blue-400/40 px-3 py-1 text-xs font-semibold text-blue-200">
                          Usuario
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-white/70 text-center">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('es-BO') : '-'}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(u)}
                          className="rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 p-2 text-cyan-300 transition"
                          title="Editar usuario"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u.id)}
                          disabled={u.id === user?.id}
                          className="rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 p-2 text-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                          title={u.id === user?.id ? 'No puedes eliminarte a ti mismo' : 'Eliminar usuario'}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {users.length === 0 && (
              <div className="text-center py-12 text-white/50">
                No hay usuarios registrados.
              </div>
            )}
          </div>
        </section>

        {/* Modal Crear Usuario */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-8 shadow-2xl">
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute right-4 top-4 rounded-lg bg-white/10 hover:bg-white/20 p-2 text-white transition"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <UserPlus className="h-6 w-6 text-cyan-400" />
                Crear Usuario
              </h2>

              {status.error && (
                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-400/40 p-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-sm text-red-100">{status.error}</p>
                </div>
              )}

              {status.success && (
                <div className="mb-4 rounded-lg bg-green-500/10 border border-green-400/40 p-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <p className="text-sm text-green-100">{status.success}</p>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                    placeholder="Juan Pérez"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                    placeholder="usuario@empresa.com"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                    <Key className="h-4 w-4" />
                    Contraseña
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                    placeholder="••••••••"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                    <Shield className="h-4 w-4" />
                    Rol
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-2.5 text-white focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                  >
                    <option value="USER">Usuario</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 text-sm font-semibold text-white transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={status.loading}
                    className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-white shadow-lg transition"
                  >
                    {status.loading ? 'Creando...' : 'Crear Usuario'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Editar Usuario */}
        {showEditModal && editingUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 p-8 shadow-2xl">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingUser(null)
                }}
                className="absolute right-4 top-4 rounded-lg bg-white/10 hover:bg-white/20 p-2 text-white transition"
              >
                <X className="h-5 w-5" />
              </button>

              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <Edit2 className="h-6 w-6 text-cyan-400" />
                Editar Usuario
              </h2>

              {status.error && (
                <div className="mb-4 rounded-lg bg-red-500/10 border border-red-400/40 p-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-sm text-red-100">{status.error}</p>
                </div>
              )}

              {status.success && (
                <div className="mb-4 rounded-lg bg-green-500/10 border border-green-400/40 p-3 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                  <p className="text-sm text-green-100">{status.success}</p>
                </div>
              )}

              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleInputChange}
                    required
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                    <Key className="h-4 w-4" />
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleInputChange}
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-2.5 text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
                    placeholder="Dejar vacío para mantener la actual"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-white/70 mb-2">
                    <Shield className="h-4 w-4" />
                    Rol
                  </label>
                  <select
                    name="role"
                    value={form.role}
                    onChange={handleInputChange}
                    disabled={editingUser.id === user?.id}
                    className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-2.5 text-white focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="USER">Usuario</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                  {editingUser.id === user?.id && (
                    <p className="text-xs text-white/50 mt-1">No puedes cambiar tu propio rol</p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingUser(null)
                    }}
                    className="flex-1 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-3 text-sm font-semibold text-white transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={status.loading}
                    className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed px-4 py-3 text-sm font-semibold text-white shadow-lg transition"
                  >
                    {status.loading ? 'Actualizando...' : 'Actualizar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


