import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

/**
 * Componente para mostrar comparación de escenarios mediante gráfico de líneas
 * Muestra cómo varían los ingresos totales en el tiempo para cada escenario
 * @param {Object} scenarios - Objeto con los escenarios (pessimistic, base, optimistic)
 * @param {Object} currencyFormatter - Formateador de moneda
 * @param {Object} numberFormatter - Formateador de números
 */
export default function ScenariosLineChart({ scenarios, currencyFormatter, numberFormatter }) {
  if (!scenarios || Object.keys(scenarios).length === 0) {
    return null
  }

  // Preparar datos: usar series mensuales de cada escenario
  const prepareData = () => {
    const allMonths = {}

    // Extraer datos mensuales de cada escenario
    Object.entries(scenarios).forEach(([scenarioKey, scenario]) => {
      const series = scenario.series || []
      series.forEach((item) => {
        const date = item.date || 'Sin fecha'
        if (!allMonths[date]) {
          allMonths[date] = { date }
        }
        
        // Agregar ingresos por escenario
        const income = parseFloat(item.value) || 0
        if (scenarioKey === 'pessimistic') {
          allMonths[date].pessimistic = (allMonths[date].pessimistic || 0) + income
        } else if (scenarioKey === 'base') {
          allMonths[date].base = (allMonths[date].base || 0) + income
        } else if (scenarioKey === 'optimistic') {
          allMonths[date].optimistic = (allMonths[date].optimistic || 0) + income
        }
      })
    })

    // Convertir a array y ordenar por fecha
    return Object.values(allMonths)
      .sort((a, b) => {
        const dateA = new Date(a.date)
        const dateB = new Date(b.date)
        return dateA - dateB
      })
      .slice(0, 12) // Limitar a últimos 12 períodos para claridad
  }

  const data = prepareData()

  if (data.length === 0) {
    return (
      <div className="flex h-[400px] items-center justify-center rounded-lg border border-white/10 bg-white/5 p-6">
        <p className="text-sm text-slate-400">No hay datos de series disponibles para mostrar</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-white/20 bg-slate-900/95 p-3 shadow-lg backdrop-blur">
          <p className="text-xs font-semibold text-slate-200">{payload[0].payload.date}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {currencyFormatter.format(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#cbd5e1', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            tick={{ fill: '#cbd5e1', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickFormatter={(value) => {
              if (value >= 1000000) {
                return (value / 1000000).toFixed(0) + 'M'
              }
              if (value >= 1000) {
                return (value / 1000).toFixed(0) + 'K'
              }
              return value
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => {
              const labels = {
                pessimistic: 'Pesimista',
                base: 'Realista',
                optimistic: 'Optimista',
              }
              return labels[value] || value
            }}
          />
          <Line
            type="monotone"
            dataKey="pessimistic"
            stroke="#ef4444"
            strokeWidth={2}
            dot={{ fill: '#ef4444', r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="base"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
          <Line
            type="monotone"
            dataKey="optimistic"
            stroke="#22c55e"
            strokeWidth={2}
            dot={{ fill: '#22c55e', r: 4 }}
            activeDot={{ r: 6 }}
            isAnimationActive={true}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
