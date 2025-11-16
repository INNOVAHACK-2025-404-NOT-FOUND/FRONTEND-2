import { useEffect, useState } from 'react'
import { Plus, Trash2, Download, TrendingUp, Package, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from 'lucide-react'
import { fetchLatestForecast } from '../lib/api'
import { useAuth } from '../hooks/useAuth'

const numberFormatter = new Intl.NumberFormat('es-BO', { maximumFractionDigits: 2 })

// Variables globales disponibles - modifican todos los productos
const GLOBAL_VARIABLE_OPTIONS = [
  { id: 'price_adjustment', label: 'Ajuste de Precio General', description: '% cambio en precios de todos los productos' },
  { id: 'demand_variation', label: 'Variación de Demanda', description: '% cambio en demanda del mercado' },
  { id: 'promotion_campaign', label: 'Campaña Promocional Global', description: '% impulso por promoción masiva' },
  { id: 'stock_availability', label: 'Disponibilidad de Stock', description: '% impacto por disponibilidad de inventario' },
]

// Variables específicas por producto disponibles
const PRODUCT_VARIABLE_OPTIONS = [
  { id: 'product_price', label: 'Precio del Producto', description: '% ajuste de precio específico' },
  { id: 'product_demand', label: 'Demanda del Producto', description: '% cambio en demanda específica' },
  { id: 'product_promotion', label: 'Promoción Específica', description: '% impulso por promoción del producto' },
  { id: 'product_stock', label: 'Stock Crítico', description: '% impacto por nivel de inventario' },
  { id: 'product_rotation', label: 'Rotación', description: '% velocidad de movimiento del producto' },
]

export default function ScenarioBuilder() {
  const { token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Datos originales del forecast
  const [forecastData, setForecastData] = useState(null)
  const [products, setProducts] = useState([])
  
  // Configuración del escenario
  const [scenarioName, setScenarioName] = useState('')
  const [globalVariables, setGlobalVariables] = useState([])
  
  // Variables por producto: { producto: [{ id, type, label, value }] }
  const [productVariables, setProductVariables] = useState({})
  const [expandedProducts, setExpandedProducts] = useState({})
  const [showGlobalDropdown, setShowGlobalDropdown] = useState(false)
  const [productDropdowns, setProductDropdowns] = useState({})
  
  // Resultados calculados
  const [calculatedScenario, setCalculatedScenario] = useState(null)
  const [showResults, setShowResults] = useState(false)

  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchLatestForecast(token)
        
        if (data?.batch_id && data?.products) {
          setForecastData(data)
          const sortedProducts = data.products.sort()
          setProducts(sortedProducts)
          
          // Inicializar productVariables con todos los productos
          const initialProductVars = {}
          sortedProducts.forEach(p => {
            initialProductVars[p] = []
          })
          setProductVariables(initialProductVars)
        } else {
          setError('No hay datos disponibles. Por favor, carga un archivo CSV primero.')
        }
      } catch (err) {
        setError(err.message || 'Error al cargar los datos')
      } finally {
        setLoading(false)
      }
    }
    
    loadInitialData()
  }, [token])

  // Toggle expansión de producto
  const toggleProduct = (product) => {
    setExpandedProducts(prev => ({
      ...prev,
      [product]: !prev[product]
    }))
  }

  // Agregar variable global
  const addGlobalVariable = (variableType) => {
    const option = GLOBAL_VARIABLE_OPTIONS.find(opt => opt.id === variableType)
    if (!option) return
    
    // No permitir duplicados
    if (globalVariables.some(v => v.type === variableType)) return
    
    setGlobalVariables([...globalVariables, {
      id: Date.now(),
      type: variableType,
      label: option.label,
      value: 0,
      direction: 'up' // 'up' para positivo, 'down' para negativo
    }])
  }

  // Eliminar variable global
  const removeGlobalVariable = (id) => {
    setGlobalVariables(globalVariables.filter(v => v.id !== id))
  }

  // Actualizar valor de variable global
  const updateGlobalVariable = (id, value) => {
    setGlobalVariables(globalVariables.map(v =>
      v.id === id ? { ...v, value: Math.abs(parseFloat(value) || 0) } : v
    ))
  }

  // Cambiar dirección de variable global
  const toggleGlobalDirection = (id) => {
    setGlobalVariables(globalVariables.map(v =>
      v.id === id ? { ...v, direction: v.direction === 'up' ? 'down' : 'up' } : v
    ))
  }

  // Agregar variable específica a un producto
  const addProductVariable = (product, variableType) => {
    const option = PRODUCT_VARIABLE_OPTIONS.find(opt => opt.id === variableType)
    if (!option) return
    
    // No permitir duplicados del mismo tipo para el mismo producto
    if (productVariables[product]?.some(v => v.type === variableType)) return
    
    setProductVariables(prev => ({
      ...prev,
      [product]: [...(prev[product] || []), {
        id: Date.now(),
        type: variableType,
        label: option.label,
        value: 0,
        direction: 'up' // 'up' para positivo, 'down' para negativo
      }]
    }))
    
    // Expandir el producto automáticamente
    setExpandedProducts(prev => ({ ...prev, [product]: true }))
  }

  // Eliminar variable de producto
  const removeProductVariable = (product, id) => {
    setProductVariables(prev => ({
      ...prev,
      [product]: prev[product].filter(v => v.id !== id)
    }))
  }

  // Actualizar variable de producto
  const updateProductVariable = (product, id, value) => {
    setProductVariables(prev => ({
      ...prev,
      [product]: prev[product].map(v =>
        v.id === id ? { ...v, value: Math.abs(parseFloat(value) || 0) } : v
      )
    }))
  }

  // Cambiar dirección de variable de producto
  const toggleProductDirection = (product, id) => {
    setProductVariables(prev => ({
      ...prev,
      [product]: prev[product].map(v =>
        v.id === id ? { ...v, direction: v.direction === 'up' ? 'down' : 'up' } : v
      )
    }))
  }

  // Calcular escenario en frontend
  const calculateScenario = () => {
    if (!forecastData || !forecastData.monthly_forecast) {
      setError('No hay datos de forecast disponibles')
      return
    }

    // Calcular multiplicador global combinado
    let globalMultiplier = 1.0
    globalVariables.forEach(gv => {
      const value = parseFloat(gv.value) || 0
      const signedValue = gv.direction === 'down' ? -value : value
      globalMultiplier *= (1 + signedValue / 100)
    })

    // Calcular multiplicadores por producto
    const productMultipliers = {}
    Object.entries(productVariables).forEach(([product, vars]) => {
      let productMult = 1.0
      vars.forEach(v => {
        const value = parseFloat(v.value) || 0
        const signedValue = v.direction === 'down' ? -value : value
        productMult *= (1 + signedValue / 100)
      })
      productMultipliers[product] = productMult
    })

    // Aplicar ajustes al forecast (IMPORTANTE: usar FORECAST en mayúsculas)
    const adjustedForecast = forecastData.monthly_forecast.map(item => {
      const productMultiplier = productMultipliers[item.product] || 1.0
      const finalMultiplier = globalMultiplier * productMultiplier
      const originalValue = parseFloat(item.FORECAST) || 0
      
      return {
        ...item,
        forecast: originalValue * finalMultiplier,
        original_forecast: originalValue
      }
    })

    // Calcular totales por producto
    const productTotals = {}
    adjustedForecast.forEach(item => {
      if (!productTotals[item.product]) {
        productTotals[item.product] = {
          product: item.product,
          total_forecast: 0,
          original_total: 0,
          variables: productVariables[item.product] || []
        }
      }
      productTotals[item.product].total_forecast += item.forecast
      productTotals[item.product].original_total += item.original_forecast
    })

    const totalsArray = Object.values(productTotals).map(pt => ({
      ...pt,
      change_pct: pt.original_total > 0 ? ((pt.total_forecast - pt.original_total) / pt.original_total * 100) : 0
    }))

    // Calcular total general
    const grandTotal = totalsArray.reduce((sum, pt) => sum + pt.total_forecast, 0)
    const originalGrandTotal = totalsArray.reduce((sum, pt) => sum + pt.original_total, 0)

    setCalculatedScenario({
      name: scenarioName || 'Escenario Personalizado',
      forecast: adjustedForecast,
      productTotals: totalsArray.sort((a, b) => b.total_forecast - a.total_forecast),
      summary: {
        total_forecast: grandTotal,
        original_total: originalGrandTotal,
        change_pct: originalGrandTotal > 0 ? ((grandTotal - originalGrandTotal) / originalGrandTotal * 100) : 0
      },
      globalVariables: [...globalVariables],
      productVariables: { ...productVariables }
    })
    
    setShowResults(true)
  }

  // Descargar CSV
  const downloadCSV = () => {
    if (!calculatedScenario) return

    const headers = ['Producto', 'Fecha', 'Forecast Original', 'Forecast Ajustado', 'Cambio (%)']
    const rows = calculatedScenario.forecast.map(item => [
      item.product,
      item.date,
      item.original_forecast.toFixed(2),
      item.forecast.toFixed(2),
      (((item.forecast - item.original_forecast) / item.original_forecast) * 100).toFixed(2)
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${scenarioName || 'escenario'}_forecast.csv`
    link.click()
  }

  // Resetear formulario
  const resetForm = () => {
    setScenarioName('')
    setGlobalVariables([])
    const resetProductVars = {}
    products.forEach(p => {
      resetProductVars[p] = []
    })
    setProductVariables(resetProductVars)
    setCalculatedScenario(null)
    setShowResults(false)
    setExpandedProducts({})
  }

  // Contar total de variables
  const totalVariables = globalVariables.length + 
    Object.values(productVariables).reduce((sum, vars) => sum + vars.length, 0)

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 px-6 py-12">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center gap-3">
                <TrendingUp className="h-10 w-10 text-cyan-400" />
                Creador de Escenarios Personalizados
              </h1>
              <p className="mt-2 text-white/70">
                Aplica variables globales y específicas por producto para simular escenarios
              </p>
            </div>
            {totalVariables > 0 && (
              <div className="rounded-xl bg-cyan-500/20 border border-cyan-400/40 px-4 py-2">
                <p className="text-sm text-white/70">Variables Aplicadas</p>
                <p className="text-2xl font-bold text-cyan-300">{totalVariables}</p>
              </div>
            )}
          </div>
        </section>

        {!showResults ? (
          <>
            {/* Nombre del Escenario */}
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
              <h2 className="text-2xl font-bold text-white mb-4">Nombre del Escenario</h2>
              <input
                type="text"
                value={scenarioName}
                onChange={(e) => setScenarioName(e.target.value)}
                placeholder="Ej: Campaña Navideña 2025"
                className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300/50"
              />
            </section>

            {/* Variables Globales */}
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Variables Globales</h2>
                <p className="text-sm text-white/60 mt-1">Afectan a TODOS los productos por igual. Selecciona las variables que deseas aplicar:</p>
              </div>
              
              {/* Grid de botones para seleccionar variables */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                {GLOBAL_VARIABLE_OPTIONS.map(option => {
                  const isSelected = globalVariables.some(v => v.type === option.id)
                  return (
                    <button
                      key={option.id}
                      onClick={() => isSelected ? removeGlobalVariable(globalVariables.find(v => v.type === option.id)?.id) : addGlobalVariable(option.id)}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected 
                          ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20' 
                          : 'bg-white/5 border-white/20 hover:border-cyan-400/50 hover:bg-white/10'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-semibold text-white flex items-center gap-2">
                            {isSelected && <Plus className="h-4 w-4 text-cyan-400 rotate-45" />}
                            {option.label}
                          </div>
                          <div className="text-xs text-white/60 mt-1">{option.description}</div>
                        </div>
                        {isSelected && (
                          <div className="ml-3 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-400">
                            <div className="h-2 w-2 rounded-full bg-white" />
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {globalVariables.length === 0 ? (
                <div className="text-center py-12 text-white/50 border border-white/10 rounded-xl bg-white/5">
                  No hay variables globales. Haz clic en "Agregar Variable Global" para comenzar.
                </div>
              ) : (
                <div className="space-y-3">
                  {globalVariables.map((variable) => (
                    <div
                      key={variable.id}
                      className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-white">{variable.label}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleGlobalDirection(variable.id)}
                          className={`rounded-lg border p-2 transition ${
                            variable.direction === 'up'
                              ? 'bg-green-500/20 border-green-400/40 text-green-300 hover:bg-green-500/30'
                              : 'bg-red-500/20 border-red-400/40 text-red-300 hover:bg-red-500/30'
                          }`}
                          title={variable.direction === 'up' ? 'Incremento' : 'Decremento'}
                        >
                          {variable.direction === 'up' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
                        </button>
                        <input
                          type="number"
                          value={variable.value}
                          onChange={(e) => updateGlobalVariable(variable.id, e.target.value)}
                          min="0"
                          step="0.1"
                          className="w-24 rounded-lg bg-slate-900/50 border border-white/20 px-3 py-2 text-white text-right focus:border-cyan-300 focus:outline-none"
                        />
                        <span className="text-white/70 w-6">%</span>
                      </div>
                      <button
                        onClick={() => removeGlobalVariable(variable.id)}
                        className="rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 p-2 text-red-300 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Variables por Producto */}
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white">Variables por Producto</h2>
                <p className="text-sm text-white/60 mt-1">
                  Expande cada producto y agrega variables específicas
                </p>
              </div>

              <div className="space-y-2">
                {products.map(product => {
                  const isExpanded = expandedProducts[product]
                  const productVars = productVariables[product] || []
                  const hasVariables = productVars.length > 0

                  return (
                    <div
                      key={product}
                      className={`rounded-xl border overflow-hidden transition-all ${
                        hasVariables 
                          ? 'border-purple-400/40 bg-purple-500/10' 
                          : 'border-white/10 bg-white/5'
                      }`}
                    >
                      {/* Header del producto */}
                      <button
                        onClick={() => toggleProduct(product)}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition"
                      >
                        <div className="flex items-center gap-3">
                          <Package className="h-5 w-5 text-cyan-400" />
                          <span className="font-medium text-white">{product}</span>
                          {hasVariables && (
                            <span className="text-xs bg-purple-500/30 border border-purple-400/50 rounded-full px-2 py-0.5 text-purple-200">
                              {productVars.length} variable{productVars.length !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-white/50" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-white/50" />
                        )}
                      </button>

                      {/* Contenido expandido */}
                      {isExpanded && (
                        <div className="border-t border-white/10 p-4 space-y-3">
                          {/* Grid de botones para seleccionar variables */}
                          <div className="mb-3">
                            <p className="text-xs text-white/50 mb-2">Selecciona las variables para este producto:</p>
                            <div className="grid grid-cols-1 gap-2">
                              {PRODUCT_VARIABLE_OPTIONS.map(option => {
                                const isSelected = productVars.some(v => v.type === option.id)
                                return (
                                  <button
                                    key={option.id}
                                    onClick={() => isSelected ? removeProductVariable(product, productVars.find(v => v.type === option.id)?.id) : addProductVariable(product, option.id)}
                                    className={`text-left p-3 rounded-lg border transition-all ${
                                      isSelected 
                                        ? 'bg-purple-500/20 border-purple-400 shadow-md' 
                                        : 'bg-slate-900/50 border-white/10 hover:border-purple-400/50 hover:bg-white/5'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex-1">
                                        <div className="text-sm font-medium text-white">{option.label}</div>
                                        <div className="text-xs text-white/50 mt-0.5">{option.description}</div>
                                      </div>
                                      {isSelected && (
                                        <div className="ml-2 flex h-4 w-4 items-center justify-center rounded-full bg-purple-400">
                                          <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                        </div>
                                      )}
                                    </div>
                                  </button>
                                )
                              })}
                            </div>
                          </div>

                          {/* Variables del producto */}
                          {productVars.length > 0 && (
                            <div className="space-y-2">
                              {productVars.map(variable => (
                                <div
                                  key={variable.id}
                                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-slate-900/50 p-3"
                                >
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-white">{variable.label}</p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => toggleProductDirection(product, variable.id)}
                                      className={`rounded-lg border p-1.5 transition text-sm ${
                                        variable.direction === 'up'
                                          ? 'bg-green-500/20 border-green-400/40 text-green-300 hover:bg-green-500/30'
                                          : 'bg-red-500/20 border-red-400/40 text-red-300 hover:bg-red-500/30'
                                      }`}
                                      title={variable.direction === 'up' ? 'Incremento' : 'Decremento'}
                                    >
                                      {variable.direction === 'up' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />}
                                    </button>
                                    <input
                                      type="number"
                                      value={variable.value}
                                      onChange={(e) => updateProductVariable(product, variable.id, e.target.value)}
                                      min="0"
                                      step="0.1"
                                      className="w-20 rounded-lg bg-slate-800 border border-white/20 px-3 py-1.5 text-white text-right text-sm focus:border-purple-400 focus:outline-none"
                                    />
                                    <span className="text-white/70 text-sm w-6">%</span>
                                  </div>
                                  <button
                                    onClick={() => removeProductVariable(product, variable.id)}
                                    className="rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-400/40 p-1.5 text-red-300 transition"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Botones de Acción */}
            <div className="flex gap-4">
              <button
                onClick={calculateScenario}
                disabled={totalVariables === 0}
                className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed px-6 py-4 text-lg font-semibold text-white shadow-lg transition"
              >
                Generar Escenario
              </button>
              <button
                onClick={resetForm}
                className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-6 py-4 text-lg font-semibold text-white transition"
              >
                Limpiar Todo
              </button>
            </div>
          </>
        ) : (
          /* Resultados del Escenario */
          <>
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white">{calculatedScenario.name}</h2>
                  <p className="text-white/60 mt-1">Resultados del escenario personalizado</p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 rounded-xl bg-green-500/20 hover:bg-green-500/30 border border-green-400/40 px-4 py-2 text-sm font-medium text-white transition"
                  >
                    <Download className="h-4 w-4" />
                    Descargar CSV
                  </button>
                  <button
                    onClick={resetForm}
                    className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2 text-sm font-medium text-white transition"
                  >
                    Crear Nuevo
                  </button>
                </div>
              </div>

              {/* Resumen */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-slate-900/60 to-slate-900/20 p-6">
                  <p className="text-sm text-white/60">Forecast Original</p>
                  <p className="text-3xl font-bold text-white mt-2">
                    {numberFormatter.format(calculatedScenario.summary.original_total)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-cyan-900/40 to-blue-900/20 p-6">
                  <p className="text-sm text-white/60">Forecast Ajustado</p>
                  <p className="text-3xl font-bold text-cyan-300 mt-2">
                    {numberFormatter.format(calculatedScenario.summary.total_forecast)}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/5 bg-gradient-to-br from-purple-900/40 to-pink-900/20 p-6">
                  <p className="text-sm text-white/60">Cambio Total</p>
                  <p className={`text-3xl font-bold mt-2 ${calculatedScenario.summary.change_pct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {calculatedScenario.summary.change_pct >= 0 ? '+' : ''}{calculatedScenario.summary.change_pct.toFixed(1)}%
                  </p>
                </div>
              </div>
            </section>

            {/* Variables Aplicadas */}
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
              <h3 className="text-xl font-bold text-white mb-4">Variables Aplicadas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-white/70 mb-3">Variables Globales ({calculatedScenario.globalVariables.length})</h4>
                  {calculatedScenario.globalVariables.length > 0 ? (
                    <div className="space-y-2">
                      {calculatedScenario.globalVariables.map(gv => (
                        <div key={gv.id} className="flex justify-between items-center rounded-lg bg-white/5 border border-white/10 p-3">
                          <span className="text-white">{gv.label}</span>
                          <span className="font-semibold text-cyan-300">{gv.value >= 0 ? '+' : ''}{gv.value}%</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/40">Ninguna</p>
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white/70 mb-3">
                    Productos con Variables ({Object.values(calculatedScenario.productVariables).filter(v => v.length > 0).length})
                  </h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {Object.entries(calculatedScenario.productVariables)
                      .filter(([, vars]) => vars.length > 0)
                      .map(([product, vars]) => (
                        <div key={product} className="rounded-lg bg-white/5 border border-white/10 p-3">
                          <div className="font-medium text-white mb-2">{product}</div>
                          <div className="space-y-1">
                            {vars.map(pv => (
                              <div key={pv.id} className="flex justify-between items-center text-sm">
                                <span className="text-white/70">{pv.label}</span>
                                <span className="font-semibold text-purple-300">{pv.value >= 0 ? '+' : ''}{pv.value}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Tabla de Resultados por Producto */}
            <section className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-md">
              <h3 className="text-xl font-bold text-white mb-6">Forecast por Producto</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-3 text-left text-xs font-medium text-white/70 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                        Original
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                        Ajustado
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-white/70 uppercase tracking-wider">
                        Cambio
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-white/70 uppercase tracking-wider">
                        Variables
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {calculatedScenario.productTotals.map((item, idx) => (
                      <tr key={idx} className="hover:bg-white/5">
                        <td className="px-4 py-4 text-sm font-medium text-white flex items-center gap-2">
                          <Package className="h-4 w-4 text-cyan-400" />
                          {item.product}
                        </td>
                        <td className="px-4 py-4 text-sm text-white/70 text-right">
                          {numberFormatter.format(item.original_total)}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-cyan-300 text-right">
                          {numberFormatter.format(item.total_forecast)}
                        </td>
                        <td className="px-4 py-4 text-sm font-semibold text-right">
                          <span className={item.change_pct >= 0 ? 'text-green-400' : 'text-red-400'}>
                            {item.change_pct >= 0 ? '+' : ''}{item.change_pct.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {item.variables.length > 0 ? (
                            <span className="inline-block bg-purple-500/30 border border-purple-400/50 rounded-full px-2 py-0.5 text-xs text-purple-200">
                              {item.variables.length}
                            </span>
                          ) : (
                            <span className="text-white/30 text-xs">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
