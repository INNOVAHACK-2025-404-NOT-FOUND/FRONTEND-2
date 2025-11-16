import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts'

/**
 * Componente para mostrar comparación fiel de escenarios mediante gráfico de barras
 * Muestra: Unidades Vendidas, Ingresos Totales, Costos Totales y Margen de Ganancia
 * @param {Object} scenarios - Objeto con los escenarios (pessimistic, base, optimistic)
 * @param {Object} currencyFormatter - Formateador de moneda
 * @param {Object} numberFormatter - Formateador de números
 */
export default function ScenarioComparisonChart({ scenarios, currencyFormatter, numberFormatter }) {
  if (!scenarios || Object.keys(scenarios).length === 0) {
    return null
  }

  // Verificar que tenemos datos válidos
  const pesimisticData = scenarios.pessimistic?.summary || {}
  const baseData = scenarios.base?.summary || {}
  const optimisticData = scenarios.optimistic?.summary || {}

  // Datos originales
  const originalData = [
    {
      metric: 'Unidades Vendidas',
      pesimista: pesimisticData.total_ventas || 0,
      realista: baseData.total_ventas || 0,
      optimista: optimisticData.total_ventas || 0,
      isCurrency: false,
      displayUnit: 'unidades',
    },
    {
      metric: 'Ingresos Totales',
      pesimista: pesimisticData.total_ingresos || 0,
      realista: baseData.total_ingresos || 0,
      optimista: optimisticData.total_ingresos || 0,
      isCurrency: true,
      displayUnit: 'moneda',
    },
    {
      metric: 'Costos Totales',
      pesimista: pesimisticData.total_costos || 0,
      realista: baseData.total_costos || 0,
      optimista: optimisticData.total_costos || 0,
      isCurrency: true,
      displayUnit: 'moneda',
    },
    {
      metric: 'Margen de Ganancia',
      pesimista: pesimisticData.total_margen || 0,
      realista: baseData.total_margen || 0,
      optimista: optimisticData.total_margen || 0,
      isCurrency: true,
      displayUnit: 'moneda',
    },
  ]

  // Normalizar datos para visualización
  // Esto hace que cada métrica se vea proporcionalmente dentro de su propia escala
  const data = originalData.map((item) => {
    const maxVal = Math.max(item.pesimista, item.realista, item.optimista) || 1
    const scale = maxVal > 100000 ? 1 : 100 // Escalar unidades pequeñas
    
    return {
      ...item,
      pesimista_display: item.pesimista * scale,
      realista_display: item.realista * scale,
      optimista_display: item.optimista * scale,
      scale,
    }
  })

  // Tooltip personalizado con mejor formato - muestra valores reales
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const metric = originalData.find(m => m.metric === payload[0].payload.metric)
      if (!metric) return null

      return (
        <div className="rounded-lg border border-white/20 bg-slate-900/95 p-4 shadow-lg backdrop-blur">
          <p className="mb-2 text-sm font-bold text-white">{metric.metric}</p>
          {payload.map((entry, index) => {
            let value = 0
            let label = ''
            
            if (entry.dataKey === 'pesimista_display') {
              value = metric.pesimista
              label = 'Pesimista'
            } else if (entry.dataKey === 'realista_display') {
              value = metric.realista
              label = 'Realista'
            } else if (entry.dataKey === 'optimista_display') {
              value = metric.optimista
              label = 'Optimista'
            }

            const formatted = metric.isCurrency
              ? currencyFormatter.format(value)
              : numberFormatter.format(value)

            return (
              <p key={index} style={{ color: entry.color }} className="text-xs font-medium">
                {label}: {formatted}
              </p>
            )
          })}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full space-y-6">
      {/* Estadísticas resumidas */}
      <div className="grid gap-4 md:grid-cols-4">
        {data.map((item, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-950/40 to-blue-900/20 p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-blue-300">
              {item.metric}
            </p>
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Pesimista</span>
                <span className="text-sm font-bold text-red-400">
                  {item.isCurrency
                    ? currencyFormatter.format(item.pesimista)
                    : numberFormatter.format(item.pesimista)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Realista</span>
                <span className="text-sm font-bold text-cyan-300">
                  {item.isCurrency
                    ? currencyFormatter.format(item.realista)
                    : numberFormatter.format(item.realista)}
                </span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Optimista</span>
                <span className="text-sm font-bold text-green-400">
                  {item.isCurrency
                    ? currencyFormatter.format(item.optimista)
                    : numberFormatter.format(item.optimista)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gráfico de barras - Todas las métricas */}
      <div className="rounded-xl border border-blue-400/30 bg-gradient-to-br from-blue-950/40 to-blue-900/20 p-6 backdrop-blur-md">
        <h4 className="mb-2 text-sm font-semibold text-blue-300">Visualización Comparativa</h4>
        <p className="mb-4 text-xs text-slate-400">Unidades vendidas, ingresos, costos y márgenes por escenario</p>
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
            layout="vertical"
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis type="number" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
            <YAxis
              dataKey="metric"
              type="category"
              tick={{ fill: '#cbd5e1', fontSize: 11 }}
              width={150}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Legend
              wrapperStyle={{ paddingTop: '10px' }}
              formatter={(value) => {
                const labels = {
                  pesimista: 'Pesimista',
                  realista: 'Realista',
                  optimista: 'Optimista',
                }
                return labels[value] || value
              }}
            />
            <Bar dataKey="pesimista_display" fill="#ef4444" radius={[0, 8, 8, 0]} />
            <Bar dataKey="realista_display" fill="#06b6d4" radius={[0, 8, 8, 0]} />
            <Bar dataKey="optimista_display" fill="#22c55e" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
