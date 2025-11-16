
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertCircle, CheckCircle2, CloudUpload, Layers, RefreshCw } from 'lucide-react'

import { listForecastBatches, uploadForecastCsv } from '../lib/api.js'
import { getStoredBatchId, setStoredBatchId } from '../lib/forecastStorage.js'
import { useAuth } from '../hooks/useAuth.js'

export default function Uploads() {
  const { token } = useAuth()
  const [batches, setBatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeBatchId, setActiveBatchId] = useState(getStoredBatchId)
  const [form, setForm] = useState({ datasetName: '', semesters: 2, file: null })
  const [uploadStatus, setUploadStatus] = useState({ loading: false, error: null, success: null })
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0, phase: '' })

  const loadBatches = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(null)
    try {
      const payload = await listForecastBatches(token, { limit: 50 })
      setBatches(payload.results || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    loadBatches()
  }, [loadBatches])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] ?? null
    setForm((prev) => ({ ...prev, file }))
  }

  const handleUpload = async (event) => {
    event.preventDefault()
    if (!form.file) {
      setUploadStatus({ loading: false, error: 'Selecciona un archivo CSV', success: null })
      return
    }
    
    setUploadStatus({ loading: true, error: null, success: null })
    setUploadProgress({ current: 0, total: 100, phase: 'Subiendo archivo...' })
    
    try {
      const semesters = Number(form.semesters) || 2
      const periods = semesters * 6  // Convertir semestres a meses
      
      // Simular progreso mientras se procesa
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev.current < 90) {
            const newCurrent = prev.current + 5
            let phase = 'Subiendo archivo...'
            if (newCurrent > 20 && newCurrent <= 40) phase = 'Analizando datos...'
            else if (newCurrent > 40 && newCurrent <= 70) phase = 'Generando pronósticos...'
            else if (newCurrent > 70) phase = 'Guardando resultados...'
            
            return { ...prev, current: newCurrent, phase }
          }
          return prev
        })
      }, 800)
      
      const result = await uploadForecastCsv(
        {
          file: form.file,
          periods: periods,
          seasonality: 12,
          datasetName: form.datasetName.trim(),
        },
        token,
      )
      
      clearInterval(progressInterval)
      setUploadProgress({ current: 100, total: 100, phase: 'Completado' })
      
      // Si el backend devuelve el ID del batch, activarlo automáticamente
      if (result?.id) {
        setActiveBatchId(result.id)
        setStoredBatchId(result.id)
      }
      
      setUploadStatus({ loading: false, error: null, success: 'Forecast publicado correctamente.' })
      setForm((prev) => ({ ...prev, file: null }))
      
      // Resetear progreso después de un momento
      setTimeout(() => {
        setUploadProgress({ current: 0, total: 0, phase: '' })
      }, 2000)
      
      loadBatches()
    } catch (err) {
      setUploadStatus({ loading: false, error: err.message, success: null })
      setUploadProgress({ current: 0, total: 0, phase: '' })
    }
  }

  const handleActivate = (batchId) => {
    setActiveBatchId(batchId)
    setStoredBatchId(batchId)
  }

  return (
    <div className="bg-gray-50 px-6 py-12 text-gray-900 min-h-screen">
      <div className="mx-auto flex max-w-5xl flex-col gap-10">
        <section className="rounded-sm border border-gray-200 bg-white p-6 shadow-md">
          <div className="flex items-center gap-3">
            <CloudUpload className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-600 font-semibold">Carga de datasets</p>
              <h1 className="text-2xl font-semibold text-gray-900">Publicar nuevo CSV nombrado</h1>
            </div>
          </div>
          <form onSubmit={handleUpload} className="mt-6 flex flex-col gap-4">
            <label className="text-sm text-gray-900 font-semibold">
              Nombre del dataset
              <input
                type="text"
                name="datasetName"
                value={form.datasetName}
                onChange={handleInputChange}
                placeholder="Ej. Sensibilidad TOTALPEC Q2"
                className="mt-2 w-full rounded-sm border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 font-medium placeholder:text-gray-400 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                required
              />
            </label>
            <label className="text-sm text-gray-900 font-semibold">
              Archivo CSV
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="mt-2 block w-full rounded-sm border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm text-gray-900 font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                required
              />
            </label>
            <label className="text-sm text-gray-900 font-semibold">
              Periodos a proyectar (semestres)
              <input
                type="number"
                min="1"
                max="4"
                name="semesters"
                value={form.semesters}
                onChange={handleInputChange}
                className="mt-2 w-full rounded-sm border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 font-medium focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-600">
                1 semestre = 6 meses. Ejemplo: 2 semestres = 12 meses (1 año)
              </p>
            </label>
            {uploadStatus.error && (
              <div className="flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="h-4 w-4" />
                {uploadStatus.error}
              </div>
            )}
            {uploadStatus.loading && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-sm border border-blue-300 bg-blue-50 px-4 py-3 text-sm text-blue-700 font-medium">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span>{uploadProgress.phase}</span>
                      <span className="text-xs">{uploadProgress.current}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-full transition-all duration-500 ease-out"
                        style={{ width: `${uploadProgress.current}%` }}
                      />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center">
                  Este proceso puede tomar varios minutos dependiendo del tamaño del archivo...
                </p>
              </div>
            )}
            {uploadStatus.success && (
              <div className="flex items-center gap-2 rounded-sm border border-teal-300 bg-teal-50 px-4 py-3 text-sm text-teal-700 font-medium">
                <CheckCircle2 className="h-4 w-4" />
                {uploadStatus.success}
              </div>
            )}
            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-sm bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={uploadStatus.loading}
              >
                {uploadStatus.loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Procesando…
                  </>
                ) : (
                  'Publicar forecast'
                )}
              </button>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-5 py-3 text-sm text-gray-700 font-semibold shadow-sm transition hover:border-gray-400 hover:bg-gray-50"
              >
                Ver dashboard
              </Link>
            </div>
          </form>
        </section>

        <section className="rounded-sm border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Layers className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-600 font-semibold">Histórico de lotes</p>
              <h2 className="text-xl font-semibold text-gray-900">Tus CSV procesados</h2>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            Selecciona un dataset para activarlo en el dashboard sin volver a parsear el archivo.
          </p>
          {loading && <p className="mt-4 animate-pulse text-sm text-gray-700">Cargando lotes�</p>}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="mt-4 overflow-x-auto rounded-sm border border-gray-200 bg-white">
            <table className="w-full min-w-[600px] text-sm text-gray-900">
              <thead className="text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Nombre</th>
                  <th className="px-4 py-3 text-left">Due�o</th>
                  <th className="px-4 py-3 text-right">Productos</th>
                  <th className="px-4 py-3 text-right">Filas</th>
                  <th className="px-4 py-3 text-right">Fecha</th>
                  <th className="px-4 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((batch) => (
                  <tr key={batch.id} className="border-t border-white/5">
                    <td className="px-4 py-3 font-semibold">#{batch.id} � {batch.name}</td>
                    <td className="px-4 py-3">{batch.owner || '�'}</td>
                    <td className="px-4 py-3 text-right">{batch.products_count}</td>
                    <td className="px-4 py-3 text-right">{batch.rows}</td>
                    <td className="px-4 py-3 text-right">
                      {batch.created_at ? new Date(batch.created_at).toLocaleString('es-PE') : '�'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleActivate(batch.id)}
                        className={`rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-wider ${
                          activeBatchId === batch.id
                            ? 'border border-emerald-400/60 bg-teal-50 text-teal-700'
                            : 'border border-gray-300 bg-white text-white hover:border-gray-400 hover:bg-gray-50'
                        }`}
                      >
                        {activeBatchId === batch.id ? 'Activo' : 'Activar'}
                      </button>
                    </td>
                  </tr>
                ))}
                {!batches.length && !loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                      A�n no has publicado CSV.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={loadBatches}
            className="mt-4 inline-flex items-center gap-2 rounded-sm border border-gray-300 bg-white px-5 py-2 text-sm text-gray-700 font-semibold shadow-sm transition hover:border-gray-400 hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar listado
          </button>
        </section>
      </div>
    </div>
  )
}


