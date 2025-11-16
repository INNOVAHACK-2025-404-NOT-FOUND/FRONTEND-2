
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  ArrowDownToLine,
  BarChart3,
  Layers,
  PackagePlus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  Table2,
  TrendingUp,
} from 'lucide-react'

import { fetchForecastBatch, fetchLatestForecast, listForecastBatches } from '../lib/api.js'
import { getStoredBatchId, setStoredBatchId } from '../lib/forecastStorage.js'
import { useAuth } from '../hooks/useAuth.js'

const numberFormatter = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 })
const percentFormatter = new Intl.NumberFormat('es-BO', { style: 'percent', maximumFractionDigits: 1 })

const mapSeries = (records = [], valueField = 'value') =>
  records.map((item) => ({
    product: item.product,
    date: item.date,
    value: Number(item[valueField] ?? item.value ?? 0),
  }))

const filterSeriesByProducts = (series, products) => {
  if (!products.length) return series
  const set = new Set(products)
  return series.filter((entry) => set.has(entry.product))
}

const filterFutureSeries = (series) => {
  const currentMonthStart = new Date()
  currentMonthStart.setDate(1)
  currentMonthStart.setHours(0, 0, 0, 0)
  return series.filter((entry) => {
    if (!entry.date) return false
    const date = new Date(entry.date)
    return !Number.isNaN(date.getTime()) && date >= currentMonthStart
  })
}

const sumRecords = (series) => series.reduce((acc, entry) => acc + Number(entry.value || 0), 0)

const aggregateMonthly = (series) => {
  const perMonth = {}
  series.forEach((entry) => {
    if (!entry.date) return
    const monthKey = entry.date.slice(0, 7)
    perMonth[monthKey] = (perMonth[monthKey] || 0) + Number(entry.value || 0)
  })
  return Object.entries(perMonth)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, total]) => ({ month, total }))
}

const sumSeriesByYear = (records, year, products = []) => {
  const filtered = filterSeriesByProducts(records, products)
  return filtered.reduce((acc, entry) => {
    const date = entry.date ? new Date(entry.date) : null
    if (!date || Number.isNaN(date.getTime()) || date.getFullYear() !== year) return acc
    return acc + Number(entry.value || 0)
  }, 0)
}

const parseInventoryInput = (raw = '') =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .reduce((acc, line) => {
      const [product, qty] = line.split(':')
      if (!product || qty === undefined) return acc
      const parsedQty = Number(qty.trim())
      if (!Number.isNaN(parsedQty)) {
        acc[product.trim()] = parsedQty
      }
      return acc
    }, {})

const normalizeForecast = (payload = {}) => {
  const monthlyActual = mapSeries(payload.monthly_actual || [], 'VENTAS')
  const monthlyForecast = mapSeries(payload.monthly_forecast || [], 'FORECAST')
  const scenarios = Object.entries(payload.scenarios || {}).reduce((acc, [key, scenario]) => {
    acc[key] = {
      label: scenario.label,
      multiplier: scenario.multiplier,
      series: mapSeries(scenario.series || [], 'FORECAST'),
      totals: scenario.totals || [],
    }
    return acc
  }, {})

  return {
    dataset_name: payload.dataset_name || 'Sin datos',
    source_file: payload.source_file || null,
    uploaded_at: payload.uploaded_at || null,
    uploaded_by: payload.uploaded_by || null,
    meta: {
      products_count: payload.meta?.products_count || 0,
      rows: payload.meta?.rows || 0,
      product_column: payload.meta?.product_column || null,
      range_start: payload.meta?.range_start || null,
      range_end: payload.meta?.range_end || null,
      periods_requested: payload.meta?.periods_requested || 0,
    },
    history: payload.history || [],
    forecast: payload.forecast || [],
    leaders: payload.leaders || [],
    volatility: payload.volatility || [],
    forecast_totals: payload.forecast_totals || [],
    monthlyActual,
    monthlyForecast,
    products: payload.products || [],
    scenarios,
    batch_id: payload.batch_id || null,
  }
}

const EMPTY_FORECAST = normalizeForecast({})

export default function Dashboard() {
  const { token } = useAuth()
  const [batches, setBatches] = useState([])
  const [batchesLoading, setBatchesLoading] = useState(true)
  const [batchesError, setBatchesError] = useState(null)
  const [activeBatchId, setActiveBatchId] = useState(getStoredBatchId)
  const [data, setData] = useState(EMPTY_FORECAST)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('base')
  const [selectedProducts, setSelectedProducts] = useState([])
  const [planGrowth, setPlanGrowth] = useState(12)
  const [inventoryInput, setInventoryInput] = useState('')
  const [stockParams, setStockParams] = useState({
    defaultStock: 500,
    coverageTarget: 2,
    safetyFactor: 1,
  })

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

  const scenarioEntries = Object.entries(data.scenarios || {})
  useEffect(() => {
    if (!scenarioEntries.length) return
    const keys = scenarioEntries.map(([key]) => key)
    if (!keys.includes(selectedScenarioKey)) {
      setSelectedScenarioKey(keys[0])
    }
  }, [scenarioEntries, selectedScenarioKey])

  const handleBatchChange = (event) => {
    const value = event.target.value
    const nextId = value ? Number(value) : null
    setActiveBatchId(nextId)
    setStoredBatchId(nextId)
  }

  const handleScenarioChange = (key) => {
    setSelectedScenarioKey(key)
  }

  const handleStockParamChange = (event) => {
    const { name, value } = event.target
    setStockParams((prev) => ({ ...prev, [name]: Number(value) }))
  }

  const scenario = data.scenarios[selectedScenarioKey] || null
  const productOptions = data.products
  const inventoryMap = useMemo(() => parseInventoryInput(inventoryInput), [inventoryInput])
  const scenarioSeries = scenario ? scenario.series : data.monthlyForecast
  const filteredScenarioSeries = useMemo(
    () => filterSeriesByProducts(scenarioSeries, selectedProducts),
    [scenarioSeries, selectedProducts],
  )
  const futureScenarioSeries = useMemo(
    () => filterFutureSeries(filteredScenarioSeries),
    [filteredScenarioSeries],
  )
  const monthlyScenarioRows = useMemo(() => aggregateMonthly(futureScenarioSeries), [futureScenarioSeries])

  const currentYear = new Date().getFullYear()
  const previousYear = currentYear - 1
  const actualCurrentYear = sumSeriesByYear(data.monthlyActual, currentYear, selectedProducts)
  const actualPreviousYear = sumSeriesByYear(data.monthlyActual, previousYear, selectedProducts)
  const planOriginal = actualPreviousYear * (1 + planGrowth / 100)
  const scenarioTotal = sumRecords(futureScenarioSeries)

  const scenarioStatsByProduct = useMemo(() => {
    const stats = {}
    filteredScenarioSeries.forEach((entry) => {
      if (!entry.product) return
      if (!stats[entry.product]) {
        stats[entry.product] = { months: 0, total: 0 }
      }
      stats[entry.product].months += 1
      stats[entry.product].total += Number(entry.value || 0)
    })
    return stats
  }, [filteredScenarioSeries])

  const purchaseSuggestions = useMemo(() => {
    const products = Object.keys(scenarioStatsByProduct)
    return products.map((product) => {
      const stats = scenarioStatsByProduct[product]
      const avgMonthly = stats.months ? stats.total / stats.months : stats.total
      const stock = inventoryMap[product] ?? stockParams.defaultStock
      const targetStock = avgMonthly * stockParams.coverageTarget
      const recommended = Math.max(stats.total + targetStock - stock, 0)
      const coverageMonths = avgMonthly ? stock / avgMonthly : stockParams.coverageTarget
      const rotation = stock ? stats.total / stock : stats.total
      return {
        product,
        stock,
        futureDemand: stats.total,
        coverageMonths,
        recommended,
        rotation,
      }
    })
  }, [scenarioStatsByProduct, inventoryMap, stockParams.defaultStock, stockParams.coverageTarget])

  const alerts = useMemo(() => {
    return purchaseSuggestions.reduce((acc, suggestion) => {
      if (suggestion.coverageMonths < stockParams.safetyFactor) {
        acc.push({
          type: 'quiebre',
          product: suggestion.product,
          message: `Cobertura ${numberFormatter.format(suggestion.coverageMonths)} meses (< ${stockParams.safetyFactor}).`,
        })
      } else if (suggestion.coverageMonths > stockParams.coverageTarget * 1.5) {
        acc.push({
          type: 'sobrestock',
          product: suggestion.product,
          message: `Cobertura excedida (${numberFormatter.format(suggestion.coverageMonths)} meses).`,
        })
      }
      return acc
    }, [])
  }, [purchaseSuggestions, stockParams.coverageTarget, stockParams.safetyFactor])

  const summaryCards = [
    {
      label: 'Productos �nicos',
      value: data.meta.products_count,
      icon: TrendingUp,
    },
    {
      label: 'Filas procesadas',
      value: numberFormatter.format(data.meta.rows),
      icon: BarChart3,
    },
    {
      label: `Total escenario ${scenario?.label || 'Base'}`,
      value: numberFormatter.format(scenarioTotal),
      icon: Sparkles,
    },
  ]

  const datasetOptions = batches.map((batch) => ({ id: batch.id, label: batch.name }))

  return (
    <div className="bg-gray-50 min-h-screen px-6 py-12 text-gray-900">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <section className="rounded-sm border border-gray-200 bg-white p-8 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-600">Panel ejecutivo</p>
              <h1 className="mt-3 text-3xl font-bold">{data.dataset_name}</h1>
              <p className="mt-2 text-sm text-gray-700">
                Última carga:{' '}
                {data.uploaded_at ? new Date(data.uploaded_at).toLocaleString('es-BO') : 'Sin registros'}
                {data.uploaded_by && ` � por ${data.uploaded_by}`}
              </p>
              {data.source_file && <p className="mt-1 text-xs text-gray-700 font-medium">Archivo base: {data.source_file}</p>}
            </div>
            <div className="flex flex-col gap-3 text-sm text-gray-900 md:items-end">
              <label className="text-xs uppercase tracking-wider text-gray-600">
                Dataset activo
                <select
                  value={activeBatchId ?? ''}
                  onChange={handleBatchChange}
                  className="mt-2 min-w-[220px] rounded-sm border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="">�ltimo disponible</option>
                  {datasetOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      #{option.id} � {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/uploads"
                  className="inline-flex items-center gap-2 rounded-sm border border-gray-300 px-5 py-2 text-sm text-gray-900 transition hover:border-gray-400"
                >
                  Gestionar cargas
                </Link>
                <button
                  type="button"
                  onClick={() => loadBatchData(activeBatchId)}
                  className="inline-flex items-center gap-2 rounded-sm border border-gray-300 px-5 py-2 text-sm text-gray-900 transition hover:border-white/40"
                >
                  <RefreshCw className="h-4 w-4" />
                  Refrescar
                </button>
              </div>
            </div>
          </div>
          {(loading || batchesLoading) && (
            <p className="mt-4 animate-pulse text-sm text-gray-700">Cargando informaci�n�</p>
          )}
          {(fetchError || batchesError) && (
            <div className="mt-4 flex items-center gap-2 rounded-sm border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4" />
              {fetchError || batchesError}
            </div>
          )}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {summaryCards.map((card) => (
              <div key={card.label} className="rounded-sm border border-gray-200 bg-white p-4">
                <card.icon className="h-5 w-5 text-gray-600" />
                <p className="mt-3 text-2xl font-bold">{card.value}</p>
                <p className="text-xs uppercase tracking-wider text-gray-600">{card.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-sm border border-gray-200 bg-white p-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-600">Escenarios autom�ticos</p>
                <h2 className="text-2xl font-semibold">Selecciona el horizonte de decisi�n</h2>
              </div>
              <label className="text-sm text-gray-900 font-medium">
                Productos (vac�o = todos)
                <select
                  multiple
                  value={selectedProducts}
                  onChange={(event) => {
                    const values = Array.from(event.target.selectedOptions).map((option) => option.value)
                    setSelectedProducts(values)
                  }}
                  className="ml-3 h-24 min-w-[220px] rounded-sm border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                >
                  {productOptions.map((product) => (
                    <option key={product} value={product}>
                      {product}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {scenarioEntries.map(([key, value]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleScenarioChange(key)}
                  className={`rounded-sm border p-4 text-left transition ${
                    selectedScenarioKey === key
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-gray-200 bg-white hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold uppercase tracking-widest">{value.label}</p>
                    <Sparkles className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="mt-3 text-xs text-gray-700">Multiplicador: {percentFormatter.format(value.multiplier - 1)}</p>
                  <p className="mt-2 text-lg font-bold">{numberFormatter.format(sumRecords(filterFutureSeries(filterSeriesByProducts(value.series, selectedProducts))))}</p>
                </button>
              ))}
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.3fr,0.7fr]">
              <div className="rounded-sm border border-gray-200 bg-white p-5">
                <div className="grid gap-4 md:grid-cols-2">
                  {[{ label: 'A�o anterior', value: actualPreviousYear }, { label: 'A�o actual (real)', value: actualCurrentYear }, { label: 'Plan original', value: planOriginal }, { label: `Escenario ${scenario?.label || 'base'}`, value: scenarioTotal }].map((row) => (
                    <div key={row.label} className="rounded-sm border border-gray-200 bg-white p-4">
                      <p className="text-xs uppercase tracking-wider text-gray-600">{row.label}</p>
                      <p className="mt-2 text-2xl font-bold">{numberFormatter.format(row.value || 0)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-sm border border-gray-200 bg-white p-5">
                <label className="text-sm text-gray-900 font-medium">
                  Crecimiento plan (% base a�o anterior)
                  <input
                    type="number"
                    min="-50"
                    max="150"
                    value={planGrowth}
                    onChange={(event) => setPlanGrowth(Number(event.target.value))}
                    className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </label>
                <p className="mt-4 text-xs text-gray-700 font-medium">
                  Comparando escenario seleccionado contra plan original y ejecuci�n hist�rica.
                </p>
              </div>
            </div>
            <div className="overflow-x-auto rounded-sm border border-gray-200 bg-white">
              <table className="w-full min-w-[520px] text-sm text-gray-900">
                <thead className="text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-4 py-3 text-left">Escenario</th>
                    <th className="px-4 py-3 text-right">Total</th>
                    <th className="px-4 py-3 text-right">vs. A�o anterior</th>
                    <th className="px-4 py-3 text-right">vs. Plan</th>
                  </tr>
                </thead>
                <tbody>
                  {[{ label: 'A�o anterior', value: actualPreviousYear }, { label: 'A�o actual (real)', value: actualCurrentYear }, { label: 'Plan original', value: planOriginal }, { label: `Escenario ${scenario?.label || 'base'}`, value: scenarioTotal }].map((row) => (
                    <tr key={row.label} className="border-t border-gray-200">
                      <td className="px-4 py-3">{row.label}</td>
                      <td className="px-4 py-3 text-right">{numberFormatter.format(row.value || 0)}</td>
                      <td className="px-4 py-3 text-right">
                        {row.label === 'A�o anterior'
                          ? '�'
                          : percentFormatter.format(
                              actualPreviousYear ? (row.value - actualPreviousYear) / actualPreviousYear : 0,
                            )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {row.label === 'Plan original'
                          ? '�'
                          : percentFormatter.format(planOriginal ? (row.value - planOriginal) / planOriginal : 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="rounded-sm border border-gray-200 bg-white p-6">
          <div className="flex items-center gap-3">
            <Table2 className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-600">Detalle mensual</p>
              <h3 className="text-xl font-semibold">Proyecci�n futura (escenario {scenario?.label || 'base'})</h3>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-700">Solo se muestran periodos a futuro del forecast almacenado.</p>
          <div className="mt-4 overflow-x-auto rounded-sm border border-gray-200 bg-white">
            <table className="w-full min-w-[520px] text-sm text-gray-900">
              <thead className="text-xs uppercase text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Mes</th>
                  <th className="px-4 py-3 text-right">Forecast</th>
                </tr>
              </thead>
              <tbody>
                {monthlyScenarioRows.map((row) => (
                  <tr key={row.month} className="border-t border-gray-200">
                    <td className="px-4 py-3 capitalize">
                      {row.month === 'sin-fecha'
                        ? 'Sin fecha'
                        : new Date(`${row.month}-01`).toLocaleDateString('es-BO', {
                            month: 'short',
                            year: 'numeric',
                          })}
                    </td>
                    <td className="px-4 py-3 text-right">{numberFormatter.format(row.total)}</td>
                  </tr>
                ))}
                {!monthlyScenarioRows.length && (
                  <tr>
                    <td colSpan={2} className="px-4 py-6 text-center text-gray-500">
                      Sin datos proyectados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.2fr,0.8fr]">
          <div className="rounded-sm border border-gray-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <PackagePlus className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm uppercase tracking-wider text-gray-600">Sugerencias de compra</p>
                <p className="text-xl font-semibold">Escenario {scenario?.label || 'base'}</p>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[600px] text-sm text-gray-900">
                <thead className="text-xs uppercase text-gray-600">
                  <tr>
                    <th className="px-3 py-2 text-left">Producto</th>
                    <th className="px-3 py-2 text-right">Stock actual</th>
                    <th className="px-3 py-2 text-right">Demanda esc.</th>
                    <th className="px-3 py-2 text-right">Cobertura (meses)</th>
                    <th className="px-3 py-2 text-right">Compra sugerida</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseSuggestions.map((item) => (
                    <tr key={item.product} className="border-t border-gray-200">
                      <td className="px-3 py-2">{item.product}</td>
                      <td className="px-3 py-2 text-right">{numberFormatter.format(item.stock)}</td>
                      <td className="px-3 py-2 text-right">{numberFormatter.format(item.futureDemand)}</td>
                      <td className="px-3 py-2 text-right">{numberFormatter.format(item.coverageMonths)}</td>
                      <td className="px-3 py-2 text-right text-teal-700">
                        {numberFormatter.format(item.recommended)}
                      </td>
                    </tr>
                  ))}
                  {!purchaseSuggestions.length && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                        Configura inventario y selecciona un escenario para ver sugerencias.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-sm border border-gray-200 bg-white p-5">
              <p className="text-sm uppercase tracking-wider text-gray-600">Par�metros inventario</p>
              <div className="mt-4 space-y-3 text-sm text-gray-900">
                <label className="flex items-center justify-between gap-4">
                  Stock por defecto
                  <input
                    type="number"
                    name="defaultStock"
                    value={stockParams.defaultStock}
                    onChange={handleStockParamChange}
                    className="w-28 rounded-sm border border-gray-200 bg-white px-3 py-1 text-right focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </label>
                <label className="flex items-center justify-between gap-4">
                  Cobertura objetivo (meses)
                  <input
                    type="number"
                    name="coverageTarget"
                    value={stockParams.coverageTarget}
                    step="0.5"
                    min="0"
                    onChange={handleStockParamChange}
                    className="w-28 rounded-sm border border-gray-200 bg-white px-3 py-1 text-right focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </label>
                <label className="flex items-center justify-between gap-4">
                  Nivel cr�tico (meses)
                  <input
                    type="number"
                    name="safetyFactor"
                    value={stockParams.safetyFactor}
                    step="0.25"
                    min="0"
                    onChange={handleStockParamChange}
                    className="w-28 rounded-sm border border-gray-200 bg-white px-3 py-1 text-right focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </label>
                <label className="text-xs uppercase tracking-widest text-gray-600">
                  Inventario por producto (Producto:Cantidad)
                  <textarea
                    value={inventoryInput}
                    onChange={(event) => setInventoryInput(event.target.value)}
                    placeholder="SKU-01: 1200"
                    rows={4}
                    className="mt-2 w-full rounded-sm border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 placeholder:text-gray-500 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                  />
                </label>
              </div>
            </div>
            <div className="rounded-sm border border-red-300 bg-red-50 p-5">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-red-700" />
                <div>
                  <p className="text-sm uppercase tracking-wider text-red-600">Alertas</p>
                  <p className="text-lg font-semibold">Quiebres / Sobreinventario</p>
                </div>
              </div>
              <ul className="mt-4 space-y-3 text-sm text-gray-900">
                {alerts.map((alert) => (
                  <li
                    key={`${alert.product}-${alert.type}`}
                    className={`rounded-sm border px-4 py-3 ${
                      alert.type === 'quiebre'
                        ? 'border-red-300 bg-red-50'
                        : 'border-amber-300 bg-amber-50'
                    }`}
                  >
                    <p className="font-semibold">
                      {alert.product} � {alert.type === 'quiebre' ? 'Posible quiebre' : 'Sobre inventario'}
                    </p>
                    <p className="text-xs text-gray-900/80">{alert.message}</p>
                  </li>
                ))}
                {!alerts.length && <p className="text-xs text-gray-700 font-medium">Sin alertas activas.</p>}
              </ul>
            </div>
          </div>
        </section>

        <section className="rounded-sm border border-gray-200 bg-white p-6 text-gray-900">
          <div className="flex flex-col gap-4 text-center md:flex-row md:items-center md:justify-between md:text-left">
            <div>
              <p className="text-sm uppercase tracking-wider text-gray-600">Reportes ejecutivos</p>
              <h3 className="text-xl font-semibold">Descarga m�tricas (rotaci�n, cobertura, stock cr�tico)</h3>
              <p className="text-sm text-gray-700 font-medium">Incluye c�lculo basado en inventario actual y escenario seleccionado.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const rows = purchaseSuggestions.map((item) => ({
                  producto: item.product,
                  stock_actual: Math.round(item.stock),
                  demanda_escenario: Math.round(item.futureDemand),
                  rotacion: item.rotation.toFixed(2),
                  cobertura_meses: item.coverageMonths.toFixed(2),
                  compra_recomendada: Math.round(item.recommended),
                }))
                if (!rows.length) return
                const header = Object.keys(rows[0]).join(',')
                const csv = [header, ...rows.map((row) => Object.values(row).join(','))].join('\n')
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.setAttribute('download', `reporte_totalpec_${new Date().toISOString().slice(0, 10)}.csv`)
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
              }}
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-blue-600 hover:bg-blue-700 hover:shadow-lg px-6 py-3 text-sm font-semibold text-gray-900 transition disabled:opacity-60"
              disabled={!purchaseSuggestions.length}
            >
              <ArrowDownToLine className="h-4 w-4" />
              Descargar CSV
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}



