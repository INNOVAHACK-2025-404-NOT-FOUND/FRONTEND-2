import {
  Package,
  DollarSign,
  BarChart3,
  TrendingUp,
} from 'lucide-react'

/**
 * Componente para mostrar las tarjetas de comparación de los 3 escenarios
 * @param {Object} scenarios - Objeto con los escenarios (pessimistic, base, optimistic)
 * @param {Object} currencyFormatter - Formateador de moneda
 * @param {Object} numberFormatter - Formateador de números
 */
export default function ScenariosComparison({ scenarios, currencyFormatter, numberFormatter }) {
  if (!scenarios || Object.keys(scenarios).length === 0) {
    return null
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {Object.entries(scenarios).map(([key, scenario]) => {
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
            <h3 className="mb-4 text-xl font-bold text-white">{scenario.label}</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-white">
                  <Package className="h-4 w-4" />
                  Unidades Vendidas
                </div>
                <p className="mt-1 text-2xl font-bold text-white">
                  {numberFormatter.format(summary.total_ventas || 0)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-white">
                  <DollarSign className="h-4 w-4" />
                  Ingresos Totales
                </div>
                <p className="mt-1 text-2xl font-bold text-green-300">
                  {currencyFormatter.format(summary.total_ingresos || 0)}
                </p>
              </div>

              <div>
                <div className="flex items-center gap-2 text-sm text-white">
                  <BarChart3 className="h-4 w-4" />
                  Costos Totales
                </div>
                <p className="mt-1 text-2xl font-bold text-orange-300">
                  {currencyFormatter.format(summary.total_costos || 0)}
                </p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center gap-2 text-sm text-white">
                  <TrendingUp className="h-4 w-4" />
                  Margen de Ganancia
                </div>
                <p className="mt-1 text-3xl font-bold text-cyan-300">
                  {currencyFormatter.format(summary.total_margen || 0)}
                </p>
                <p className="mt-1 text-sm text-white">
                  {summary.margen_promedio_pct ? (summary.margen_promedio_pct / 100).toLocaleString('es-PE', { style: 'percent', maximumFractionDigits: 1 }) : '0%'}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
