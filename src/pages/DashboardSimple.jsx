import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowDownToLine,
  BarChart3,
  RefreshCw,
  TrendingUp,
  DollarSign,
  Package,
} from 'lucide-react'

import { fetchForecastBatch, fetchLatestForecast, listForecastBatches } from '../lib/api.js'
import { getStoredBatchId, setStoredBatchId } from '../lib/forecastStorage.js'
import { useAuth } from '../hooks/useAuth.js'

const numberFormatter = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 })
const currencyFormatter = new Intl.NumberFormat('es-PE', { 
  style: 'currency', 
  currency: 'PEN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})
const percentFormatter = new Intl.NumberFormat('es-PE', { 
  style: 'percent', 
  maximumFractionDigits: 1 
})

const normalizeForecast = (payload = {}) => ({
  dataset_name: payload.dataset_name || 'Sin datos',
  source_file: payload.source_file || null,
  uploaded_at: payload.uploaded_at || null,
  uploaded_by: payload.uploaded_by || null,
  meta: {
    products_count: payload.meta?.products_count || 0,
    rows: payload.meta?.rows || 0,
    periods_requested: payload.meta?.periods_requested || 0,
    range_start: payload.meta?.range_start || null,
    range_end: payload.meta?.range_end || null,
  },
  products: payload.products || [],
  scenarios: payload.scenarios || {},
  batch_id: payload.batch_id || null,
})

const EMPTY_FORECAST = normalizeForecast({})

export default function DashboardSimple() {
  const { token } = useAuth()
  const [batches, setBatches] = useState([])
  const [batchesLoading, setBatchesLoading] = useState(true)
  const [batchesError, setBatchesError] = useState(null)
  const [activeBatchId, setActiveBatchId] = useState(getStoredBatchId)
  const [data, setData] = useState(EMPTY_FORECAST)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)

  const loadBatches = useCallback(async () => {
    if (!token) return
    setBatchesLoading(true)
    setBatchesError(null)
    try {
      const payload = await listForecastBatches(token, { limit: 50 })
      setBatches(payload.results || [])
      
      // Validar si el batch guardado existe en la lista
      const storedId = activeBatchId
      const batchExists = storedId && payload.results?.some(b => b.id === storedId)
      
      if (!batchExists && payload.results?.length) {
        // Si el batch guardado no existe, limpiar y usar el primero
        const firstId = payload.results[0].id
        setActiveBatchId(firstId)
        setStoredBatchId(firstId)
      } else if (!payload.results?.length) {
        // Si no hay batches, limpiar localStorage
        setStoredBatchId(null)
        setActiveBatchId(null)
      }
    } catch (error) {
      setBatchesError(error.message)
    } finally {
      setBatchesLoading(false)
    }
  }, [token, activeBatchId])

  const loadBatchData = useCallback(
    async (batchId) => {
      if (!token) return
      setLoading(true)
      setFetchError(null)
      try {
        const payload = batchId
          ? await fetchForecastBatch(batchId, token)
          : await fetchLatestForecast(token)
        setData(normalizeForecast(payload))
      } catch (error) {
        // Si el batch no existe (404), limpiar el localStorage y cargar batches
        if (error.message.includes('404') || error.message.includes('No encontrado')) {
          setFetchError('El lote seleccionado no existe. Cargando datos disponibles...')
          setStoredBatchId(null)
          setActiveBatchId(null)
          await loadBatches()
        } else {
          setFetchError(error.message)
          setData(EMPTY_FORECAST)
        }
      } finally {
        setLoading(false)
      }
    },
    [token, loadBatches],
  )

  useEffect(() => {
    if (token) {
      loadBatches()
    }
  }, [token, loadBatches])

  useEffect(() => {
    if (token) {
      loadBatchData(activeBatchId)
    }
  }, [token, activeBatchId, loadBatchData])

  const handleBatchChange = (event) => {
    const value = event.target.value
    const nextId = value ? Number(value) : null
    setActiveBatchId(nextId)
    setStoredBatchId(nextId)
  }

  const datasetOptions = batches.map((batch) => ({ id: batch.id, label: batch.name }))
  
  // Calcular periodos en semestres
  const semestres = Math.ceil((data.meta.periods_requested || 0) / 6)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 px-6 py-12 text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-8">
        {/* Header */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-200">Forecast de Ventas</p>
              <h1 className="mt-3 text-3xl font-bold">{data.dataset_name}</h1>
              <p className="mt-2 text-sm text-slate-300">
                Última carga:{' '}
                {data.uploaded_at ? new Date(data.uploaded_at).toLocaleString('es-PE') : 'Sin registros'}
                {data.uploaded_by && ` • por ${data.uploaded_by}`}
              </p>
              {data.source_file && <p className="mt-1 text-xs text-slate-400">Archivo: {data.source_file}</p>}
              {semestres > 0 && (
                <p className="mt-1 text-xs text-cyan-300">
                  Proyección: {semestres} semestre{semestres !== 1 ? 's' : ''} ({data.meta.periods_requested} meses)
                </p>
              )}
            </div>
            <div className="flex flex-col gap-3 text-sm text-slate-200 md:items-end">
              <label className="text-xs uppercase tracking-[0.4em] text-cyan-200">
                Dataset activo
                <select
                  value={activeBatchId ?? ''}
                  onChange={handleBatchChange}
                  className="mt-2 min-w-[220px] rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-white focus:border-cyan-300 focus:outline-none"
                >
                  <option value="">Último disponible</option>
                  {datasetOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      #{option.id} • {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/uploads"
                  className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 px-5 py-2 text-sm text-white transition hover:border-cyan-200"
                >
                  Cargar nuevo CSV
                </Link>
                <button
                  type="button"
                  onClick={() => loadBatchData(activeBatchId)}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2 text-sm text-white transition hover:border-white/40"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refrescar
                </button>
              </div>
            </div>
          </div>

          {(loading || batchesLoading) && (
            <p className="mt-4 animate-pulse text-sm text-slate-300">Cargando información…</p>
          )}
          {(fetchError || batchesError) && (
            <div className="mt-4 flex items-center gap-2 rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              <AlertCircle className="h-4 w-4" />
              {fetchError || batchesError}
            </div>
          )}
        </section>

        {/* Comparación de Escenarios */}
        {!loading && Object.keys(data.scenarios).length > 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
            <h2 className="mb-6 text-2xl font-bold">Comparación de Escenarios</h2>
            <p className="mb-6 text-sm text-slate-300">
              Análisis de 3 escenarios considerando variaciones en ventas y precios según volatilidad del producto
            </p>

            <div className="grid gap-6 md:grid-cols-3">
              {Object.entries(data.scenarios).map(([key, scenario]) => {
                const summary = scenario.summary || {}
                return (
                  <div
                    key={key}
                    className={`rounded-2xl border p-6 ${
                      key === 'base'
                        ? 'border-blue-400/50 bg-blue-500/10'
                        : key === 'pessimistic'
                        ? 'border-red-400/50 bg-red-500/10'
                        : 'border-green-400/50 bg-green-500/10'
                    }`}
                  >
                    <h3 className="mb-4 text-xl font-bold">{scenario.label}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Package className="h-4 w-4" />
                          Unidades Vendidas
                        </div>
                        <p className="mt-1 text-2xl font-bold">
                          {numberFormatter.format(summary.total_ventas || 0)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <DollarSign className="h-4 w-4" />
                          Ingresos Totales
                        </div>
                        <p className="mt-1 text-2xl font-bold text-green-300">
                          {currencyFormatter.format(summary.total_ingresos || 0)}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <BarChart3 className="h-4 w-4" />
                          Costos Totales
                        </div>
                        <p className="mt-1 text-2xl font-bold text-orange-300">
                          {currencyFormatter.format(summary.total_costos || 0)}
                        </p>
                      </div>

                      <div className="border-t border-white/10 pt-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <TrendingUp className="h-4 w-4" />
                          Margen de Ganancia
                        </div>
                        <p className="mt-1 text-3xl font-bold text-cyan-300">
                          {currencyFormatter.format(summary.total_margen || 0)}
                        </p>
                        <p className="mt-1 text-sm text-slate-400">
                          {percentFormatter.format((summary.margen_promedio_pct || 0) / 100)}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tabla comparativa */}
            <div className="mt-8 overflow-x-auto">
              <h3 className="mb-4 text-xl font-bold">Resumen Comparativo</h3>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="px-4 py-3 text-left text-slate-300">Métrica</th>
                    <th className="px-4 py-3 text-right text-slate-300">Pesimista</th>
                    <th className="px-4 py-3 text-right text-slate-300">Realista</th>
                    <th className="px-4 py-3 text-right text-slate-300">Optimista</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      label: 'Ventas (unidades)',
                      key: 'total_ventas',
                      format: (v) => numberFormatter.format(v),
                    },
                    {
                      label: 'Ingresos',
                      key: 'total_ingresos',
                      format: (v) => currencyFormatter.format(v),
                    },
                    {
                      label: 'Costos',
                      key: 'total_costos',
                      format: (v) => currencyFormatter.format(v),
                    },
                    {
                      label: 'Margen',
                      key: 'total_margen',
                      format: (v) => currencyFormatter.format(v),
                    },
                    {
                      label: 'Margen %',
                      key: 'margen_promedio_pct',
                      format: (v) => percentFormatter.format(v / 100),
                    },
                  ].map((metric) => (
                    <tr key={metric.key} className="border-b border-white/5 hover:bg-white/5">
                      <td className="px-4 py-3 font-medium">{metric.label}</td>
                      <td className="px-4 py-3 text-right">
                        {metric.format(data.scenarios.pessimistic?.summary?.[metric.key] || 0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {metric.format(data.scenarios.base?.summary?.[metric.key] || 0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {metric.format(data.scenarios.optimistic?.summary?.[metric.key] || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Top productos por margen */}
            {data.scenarios.base?.totals && (
              <div className="mt-8">
                <h3 className="mb-4 text-xl font-bold">Top 10 Productos por Margen (Escenario Realista)</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="px-4 py-3 text-left text-slate-300">Producto</th>
                        <th className="px-4 py-3 text-right text-slate-300">Ventas</th>
                        <th className="px-4 py-3 text-right text-slate-300">Ingresos</th>
                        <th className="px-4 py-3 text-right text-slate-300">Costos</th>
                        <th className="px-4 py-3 text-right text-slate-300">Margen</th>
                        <th className="px-4 py-3 text-right text-slate-300">%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.scenarios.base.totals.slice(0, 10).map((item, idx) => (
                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                          <td className="px-4 py-3 font-mono text-xs">{item.producto}</td>
                          <td className="px-4 py-3 text-right">
                            {numberFormatter.format(item.ventas || 0)}
                          </td>
                          <td className="px-4 py-3 text-right text-green-300">
                            {currencyFormatter.format(item.ingresos || 0)}
                          </td>
                          <td className="px-4 py-3 text-right text-orange-300">
                            {currencyFormatter.format(item.costos || 0)}
                          </td>
                          <td className="px-4 py-3 text-right font-bold text-cyan-300">
                            {currencyFormatter.format(item.margen || 0)}
                          </td>
                          <td className="px-4 py-3 text-right text-slate-300">
                            {percentFormatter.format((item.margen_pct || 0) / 100)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Descargar resultados */}
            <div className="mt-8 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  // Exportar a CSV
                  const csvData = Object.values(data.scenarios).map((scenario) => {
                    const summary = scenario.summary || {}
                    return {
                      Escenario: scenario.label,
                      Ventas: summary.total_ventas || 0,
                      Ingresos: summary.total_ingresos || 0,
                      Costos: summary.total_costos || 0,
                      Margen: summary.total_margen || 0,
                      'Margen %': summary.margen_promedio_pct || 0,
                    }
                  })
                  
                  const csvContent = [
                    Object.keys(csvData[0]).join(','),
                    ...csvData.map(row => Object.values(row).join(','))
                  ].join('\n')
                  
                  const blob = new Blob([csvContent], { type: 'text/csv' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = `comparacion_escenarios_${Date.now()}.csv`
                  a.click()
                }}
                className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-500/10 px-6 py-3 text-sm font-medium text-white transition hover:bg-cyan-500/20"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Descargar Comparación (CSV)
              </button>
            </div>
          </section>
        )}

        {/* Información del dataset */}
        {!loading && data.meta.products_count > 0 && (
          <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
            <h2 className="mb-6 text-2xl font-bold">Información del Dataset</h2>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-4">
                <Package className="h-5 w-5 text-cyan-200" />
                <p className="mt-3 text-2xl font-bold">{data.meta.products_count}</p>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Productos</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-4">
                <BarChart3 className="h-5 w-5 text-cyan-200" />
                <p className="mt-3 text-2xl font-bold">{numberFormatter.format(data.meta.rows)}</p>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Filas Procesadas</p>
              </div>
              <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-4">
                <TrendingUp className="h-5 w-5 text-cyan-200" />
                <p className="mt-3 text-2xl font-bold">{data.meta.periods_requested} meses</p>
                <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
                  Proyección ({semestres} semestre{semestres !== 1 ? 's' : ''})
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
