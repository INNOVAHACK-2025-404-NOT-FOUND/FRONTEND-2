import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

/**
 * Componente para mostrar comparación multidimensional mediante gráfico radar
 * Normaliza valores a escala 0-100 para visualización comparativa
 * @param {Object} scenarios - Objeto con los escenarios (pessimistic, base, optimistic)
 * @param {Object} numberFormatter - Formateador de números
 */
export default function ScenarioRadarChart({ scenarios, numberFormatter }) {
  if (!scenarios || Object.keys(scenarios).length === 0) {
    return null
  }

  // Extraer métricas y normalizarlas a escala 0-100
  const getMetrics = () => {
    const metricsList = [
      {
        name: 'Ventas',
        getPessimistic: () => scenarios.pessimistic?.summary?.total_ventas || 0,
        getBase: () => scenarios.base?.summary?.total_ventas || 0,
        getOptimistic: () => scenarios.optimistic?.summary?.total_ventas || 0,
      },
      {
        name: 'Ingresos',
        getPessimistic: () => scenarios.pessimistic?.summary?.total_ingresos || 0,
        getBase: () => scenarios.base?.summary?.total_ingresos || 0,
        getOptimistic: () => scenarios.optimistic?.summary?.total_ingresos || 0,
      },
      {
        name: 'Margen %',
        getPessimistic: () => scenarios.pessimistic?.summary?.margen_promedio_pct || 0,
        getBase: () => scenarios.base?.summary?.margen_promedio_pct || 0,
        getOptimistic: () => scenarios.optimistic?.summary?.margen_promedio_pct || 0,
      },
      {
        name: 'Eficiencia',
        // Relación ingresos/costos
        getPessimistic: () => {
          const costos = scenarios.pessimistic?.summary?.total_costos || 1
          const ingresos = scenarios.pessimistic?.summary?.total_ingresos || 0
          return (ingresos / costos) * 100
        },
        getBase: () => {
          const costos = scenarios.base?.summary?.total_costos || 1
          const ingresos = scenarios.base?.summary?.total_ingresos || 0
          return (ingresos / costos) * 100
        },
        getOptimistic: () => {
          const costos = scenarios.optimistic?.summary?.total_costos || 1
          const ingresos = scenarios.optimistic?.summary?.total_ingresos || 0
          return (ingresos / costos) * 100
        },
      },
    ]

    // Normalizar valores a escala 0-100
    return metricsList.map((metric) => {
      const pesVal = metric.getPessimistic()
      const baseVal = metric.getBase()
      const optVal = metric.getOptimistic()
      const maxVal = Math.max(pesVal, baseVal, optVal) || 1

      return {
        name: metric.name,
        pessimistic: (pesVal / maxVal) * 100,
        base: (baseVal / maxVal) * 100,
        optimistic: (optVal / maxVal) * 100,
      }
    })
  }

  const data = getMetrics()

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-white/20 bg-slate-900/95 p-3 shadow-lg backdrop-blur">
          <p className="text-xs font-semibold text-slate-200">{payload[0].payload.name}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-xs">
              {entry.name}: {entry.value.toFixed(1)}%
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
        <RadarChart data={data} margin={{ top: 20, right: 100, bottom: 20, left: 100 }}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis
            dataKey="name"
            tick={{ fill: '#cbd5e1', fontSize: 12 }}
            angle={90}
            type="number"
          />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
          <Radar
            name="Pesimista"
            dataKey="pessimistic"
            stroke="#ef4444"
            fill="#ef4444"
            fillOpacity={0.25}
          />
          <Radar
            name="Realista"
            dataKey="base"
            stroke="#3b82f6"
            fill="#3b82f6"
            fillOpacity={0.25}
          />
          <Radar
            name="Optimista"
            dataKey="optimistic"
            stroke="#22c55e"
            fill="#22c55e"
            fillOpacity={0.25}
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
        </RadarChart>
      </ResponsiveContainer>
    </div>
  )
}
