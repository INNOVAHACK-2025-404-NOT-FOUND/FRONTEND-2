import React, { useEffect, useState } from 'react'
import { GitCompare, Package } from 'lucide-react'
import { fetchLatestForecast } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

const numberFormatter = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 })
const currencyFormatter = new Intl.NumberFormat('es-BO', { 
  style: 'currency', 
  currency: 'BOB',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

export default function ScenarioComparison() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [scenarios, setScenarios] = useState(null)
  const [selectedProduct, setSelectedProduct] = useState('all')
  const [products, setProducts] = useState([])

  useEffect(() => {
    async function loadScenarios() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchLatestForecast(token)
        
        if (data?.scenarios) {
          setScenarios(data.scenarios)
          
          // Extraer lista de productos únicos
          const productSet = new Set()
          Object.values(data.scenarios).forEach(scenario => {
            scenario.series?.forEach(item => productSet.add(item.producto))
          })
          setProducts(Array.from(productSet).sort())
        } else {
          setError('No hay escenarios disponibles. Por favor, carga un archivo CSV primero.')
        }
      } catch (err) {
        setError(err.message || 'Error al cargar los escenarios')
      } finally {
        setLoading(false)
      }
    }
    
    loadScenarios()
  }, [token])

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl bg-red-500/10 border border-red-400/40 p-6 text-center">
            <p className="text-red-100">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  if (!scenarios) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="text-white/70">No hay datos de escenarios disponibles</p>
          </div>
        </div>
      </div>
    )
  }

  const scenarioKeys = ['pessimistic', 'base', 'optimistic']
  const scenarioLabels = {
    pessimistic: 'Pesimista',
    base: 'Realista',
    optimistic: 'Optimista'
  }
  const scenarioColors = {
    pessimistic: 'from-red-900/40 to-red-800/20',
    base: 'from-blue-900/40 to-cyan-800/20',
    optimistic: 'from-green-900/40 to-emerald-800/20'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 px-6 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <GitCompare className="h-10 w-10 text-cyan-400" />
                Comparativa de Escenarios
              </h1>
              <p className="mt-2 text-white/70">
                Análisis comparativo: Pesimista, Realista y Optimista
              </p>
              <div className="mt-3 inline-flex items-center gap-2 rounded-lg bg-cyan-500/20 border border-cyan-400/40 px-3 py-1.5">
                <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></div>
                <p className="text-xs text-cyan-200">
                  Los escenarios consideran la <strong>Sensibilidad a Cambio de Precio</strong> (Alta/Media/Baja) de cada producto del CSV
                </p>
              </div>
            </div>
          </div>

        </section>

        {/* Filtro de Productos */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-md">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/70">
              Filtrar por producto
            </label>
            <select
              value={selectedProduct}
              onChange={(e) => setSelectedProduct(e.target.value)}
              className="w-full rounded-xl bg-white/5 border border-white/20 px-4 py-2.5 text-white focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
            >
              <option value="all">Todos los productos</option>
              {products.map(product => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Resumen comparativo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {scenarioKeys.map(key => {
            const scenario = scenarios[key]
            if (!scenario) return null

            return (
              <section
                key={key}
                className={`rounded-3xl border border-white/10 bg-gradient-to-br ${scenarioColors[key]} p-6 shadow-2xl backdrop-blur-md`}
              >
                <h3 className="text-2xl font-bold text-white mb-4">
                  {scenarioLabels[key]}
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-white/60">Ventas Totales</p>
                    <p className="text-2xl font-bold text-white">
                      {numberFormatter.format(scenario.summary?.total_ventas || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-white/60">Ingresos</p>
                    <p className="text-xl font-semibold text-white">
                      {currencyFormatter.format(scenario.summary?.total_ingresos || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-white/60">Margen Total</p>
                    <p className="text-xl font-semibold text-white">
                      {currencyFormatter.format(scenario.summary?.total_margen || 0)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-white/60">Margen Promedio</p>
                    <p className="text-xl font-semibold text-white">
                      {scenario.summary?.margen_promedio_pct?.toFixed(1)}%
                    </p>
                  </div>
                  
                  <div className="pt-2 border-t border-white/10 space-y-1">
                    <p className="text-xs text-white/50">
                      Factor de ventas: {((scenario.sales_multiplier || 1) * 100).toFixed(0)}%
                    </p>
                    <p className="text-xs text-white/40">
                      + Ajuste por sensibilidad de precio
                    </p>
                  </div>
                </div>
              </section>
            )
          })}
        </div>

        {/* Tabla comparativa por producto */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">
              Comparativa por Producto
            </h2>
            <p className="text-sm text-white/60 mt-1">
              Totales proyectados para cada producto en los diferentes escenarios
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                    Producto
                  </th>
                  {scenarioKeys.map(key => (
                    <th
                      key={key}
                      colSpan={4}
                      className="px-4 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider border-l border-white/10"
                    >
                      {scenarioLabels[key]}
                    </th>
                  ))}
                </tr>
                <tr className="border-b border-white/5">
                  <th className="px-4 py-2 text-left text-xs text-white/50"></th>
                  {scenarioKeys.map(key => (
                    <React.Fragment key={`headers-${key}`}>
                      <th className="px-3 py-2 text-right text-xs text-white/50 border-l border-white/10">
                        Ventas
                      </th>
                      <th className="px-3 py-2 text-right text-xs text-white/50">
                        Ingresos
                      </th>
                      <th className="px-3 py-2 text-right text-xs text-white/50">
                        Margen
                      </th>
                      <th className="px-3 py-2 text-right text-xs text-white/50">
                        %
                      </th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products
                  .filter(p => selectedProduct === 'all' || p === selectedProduct)
                  .map(product => {
                    // Buscar datos del producto en cada escenario
                    const productData = {}
                    scenarioKeys.forEach(key => {
                      const scenario = scenarios[key]
                      const productTotal = scenario?.totals?.find(t => t.producto === product)
                      productData[key] = productTotal || {}
                    })

                    return (
                      <tr key={product} className="hover:bg-white/5">
                        <td className="px-4 py-4 text-sm font-medium text-white">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-cyan-400" />
                            {product}
                          </div>
                        </td>
                        {scenarioKeys.map(key => {
                          const data = productData[key]
                          return (
                            <React.Fragment key={`${product}-${key}`}>
                              <td className="px-3 py-4 text-sm text-white/70 text-right border-l border-white/5">
                                {data.ventas ? numberFormatter.format(data.ventas) : '-'}
                              </td>
                              <td className="px-3 py-4 text-sm text-white/70 text-right">
                                {data.ingresos ? currencyFormatter.format(data.ingresos) : '-'}
                              </td>
                              <td className="px-3 py-4 text-sm text-white/70 text-right">
                                {data.margen ? currencyFormatter.format(data.margen) : '-'}
                              </td>
                              <td className="px-3 py-4 text-sm text-white/70 text-right">
                                {data.margen_pct ? `${data.margen_pct.toFixed(1)}%` : '-'}
                              </td>
                            </React.Fragment>
                          )
                        })}
                      </tr>
                    )
                  })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Gráfico de diferencias */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <h2 className="text-2xl font-bold text-white mb-6">
            Diferencias entre Escenarios
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/70">
                Optimista vs Realista
              </h3>
              {(() => {
                const base = scenarios.base?.summary
                const optimistic = scenarios.optimistic?.summary
                if (!base || !optimistic) return null

                const ventasDiff = ((optimistic.total_ventas - base.total_ventas) / base.total_ventas * 100)
                const ingresosDiff = ((optimistic.total_ingresos - base.total_ingresos) / base.total_ingresos * 100)
                const margenDiff = ((optimistic.total_margen - base.total_margen) / base.total_margen * 100)

                return (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-white/70">Ventas</span>
                      <span className="text-green-400 font-semibold">
                        +{ventasDiff.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-white/70">Ingresos</span>
                      <span className="text-green-400 font-semibold">
                        +{ingresosDiff.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-white/70">Margen</span>
                      <span className="text-green-400 font-semibold">
                        +{margenDiff.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })()}
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white/70">
                Pesimista vs Realista
              </h3>
              {(() => {
                const base = scenarios.base?.summary
                const pessimistic = scenarios.pessimistic?.summary
                if (!base || !pessimistic) return null

                const ventasDiff = ((pessimistic.total_ventas - base.total_ventas) / base.total_ventas * 100)
                const ingresosDiff = ((pessimistic.total_ingresos - base.total_ingresos) / base.total_ingresos * 100)
                const margenDiff = ((pessimistic.total_margen - base.total_margen) / base.total_margen * 100)

                return (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-white/70">Ventas</span>
                      <span className="text-red-400 font-semibold">
                        {ventasDiff.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-white/70">Ingresos</span>
                      <span className="text-red-400 font-semibold">
                        {ingresosDiff.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-white/70">Margen</span>
                      <span className="text-red-400 font-semibold">
                        {margenDiff.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )
              })()}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
