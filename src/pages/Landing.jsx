import {
  ArrowRight,
  BarChart3,
  CloudCog,
  Database,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UploadCloud,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'

const highlightMetrics = [
  { label: 'Destinos gestionados', value: '12', detail: 'operaciones LATAM' },
  { label: 'Precisión esperada', value: '96%', detail: 'SARIMA + ajuste humano' },
  { label: 'Integraciones', value: '8', detail: 'ERP & legacy conectados' },
  { label: 'Respuesta', value: '< 3 min', detail: 'forecast promedio por CSV' },
]

const featureCards = [
  {
    title: 'Forecast accionable',
    description: 'Modelos SARIMA curados para cargas CSV masivas y ajuste de sensibilidad por SKU.',
    icon: TrendingUp,
    accent: 'from-brand-500/50 via-transparent to-transparent',
  },
  {
    title: 'Governance y ciberseguridad',
    description: 'Roles ADMIN / USER, MFA opcional y trazabilidad alineada a lineamientos TOTAL PEC.',
    icon: ShieldCheck,
    accent: 'from-emerald-400/40 via-transparent to-transparent',
  },
  {
    title: 'Experiencia tipo Microsoft',
    description: 'UI 2023 enterprise con paneles modulares, animaciones suaves y foco en storytelling.',
    icon: Sparkles,
    accent: 'from-fuchsia-400/40 via-transparent to-transparent',
  },
]

const timeline = [
  { stage: 'Kickoff', info: 'Alineación de retos TOTAL PEC · 12 feb', icon: Users },
  { stage: 'Data Sprint', info: 'Carga CSV sensibles y QA · 14 feb', icon: Database },
  { stage: 'Forecast Lab', info: 'Modelado paralelo + benchmarks · 15 feb', icon: CloudCog },
  { stage: 'Demo Comité', info: 'Dashboard ejecutivo + pilotos · 16 feb', icon: BarChart3 },
]

const uploadSteps = [
  {
    title: 'Sube tu CSV',
    detail: 'Automáticamente detectamos columnas de producto y fechas heterogéneas.',
    icon: UploadCloud,
  },
  {
    title: 'Normalizamos la serie',
    detail: 'Conversión wide→long optimizada con Polars y limpieza inteligente de outliers.',
    icon: Database,
  },
  {
    title: 'Forecast distribuido',
    detail: 'Workers paralelos ProcessPoolExecutor para decenas de SKU en minutos.',
    icon: CloudCog,
  },
]

export default function Landing() {
  return (
    <div className="bg-white text-gray-900">
      <section id="innovahack" className="relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" aria-hidden="true" />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 pb-20 pt-20 lg:flex-row lg:items-center">
          <div className="flex-1">
            <div className="mb-6 inline-flex items-center gap-3 rounded-sm border border-gray-300 bg-white px-4 py-2 shadow-sm">
              <div className="h-2 w-2 rounded-full bg-blue-600" />
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                TOTAL PEC x INNOVAHACK 2025
              </p>
            </div>
            <h1 className="text-5xl font-light leading-tight tracking-tight text-gray-900 md:text-6xl lg:text-7xl">
              <span className="font-semibold text-blue-600">
                Dashboard empresarial
              </span>
              <br />
              <span className="text-gray-800">para forecast inmediato y storytelling ejecutivo</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-600">
              Diseñado con el lenguaje visual empresarial: interfaces limpias, colores profesionales y
              enfoque en decisiones estratégicas. Servicio para TOTAL PEC: conecta tu histórico CSV,
              ejecutamos forecast y publicamos indicadores críticos para comités ejecutivos.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                to="/login"
                className="group inline-flex items-center gap-2 rounded-sm bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
              >
                Iniciar sesión privada
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <a
                href="#forecast"
                className="inline-flex items-center gap-2 rounded-sm border-2 border-gray-300 bg-white px-8 py-3.5 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
              >
                Ver flujo de forecast
              </a>
            </div>
            <div className="mt-10 grid grid-cols-2 gap-5 rounded-sm border border-gray-200 bg-white p-8 shadow-md text-sm md:grid-cols-4">
              {highlightMetrics.map((item, idx) => {
                const colors = [
                  'text-blue-600',
                  'text-teal-600',
                  'text-indigo-600',
                  'text-gray-700'
                ]
                const borders = ['border-blue-600', 'border-teal-600', 'border-indigo-600', 'border-gray-700']
                return (
                  <div key={item.label} className={`border-l-4 ${borders[idx]} pl-4 transition-transform hover:scale-105`}>
                    <p className={`text-3xl font-light ${colors[idx]}`}>{item.value}</p>
                    <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">{item.label}</p>
                    <p className="mt-1 text-xs text-gray-600">{item.detail}</p>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="relative flex-1 rounded-sm border border-gray-200 bg-gray-50 p-8 shadow-lg">
            <div className="relative space-y-4">
              <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                      Snapshot
                    </p>
                    <p className="text-2xl font-light text-gray-900 mt-2">Comité Operativo</p>
                    <p className="text-xl font-semibold text-blue-600">TOTAL PEC</p>
                    <p className="mt-3 text-sm text-gray-600">Insight listo en <span className="text-teal-600 font-semibold">02m 45s</span></p>
                  </div>
                  <img
                    src="/LOGO-TOTALPEC-ALTA.png"
                    alt="Logo TOTAL PEC"
                    className="h-16 w-auto object-contain opacity-80"
                  />
                </div>
              </div>
              <div className="rounded-sm border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                  Estados inteligentes
                </p>
                <ul className="mt-4 space-y-3 text-sm text-gray-700">
                  <li className="flex items-center gap-3 rounded-sm bg-teal-50 border border-teal-200 px-3 py-2.5 transition-all hover:bg-teal-100">
                    <ShieldCheck className="h-5 w-5 text-teal-600" />
                    <span className="font-medium">MFA + Roles activos</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-sm bg-blue-50 border border-blue-200 px-3 py-2.5 transition-all hover:bg-blue-100">
                    <Database className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">SQLite persistente · 256-bit encryption</span>
                  </li>
                  <li className="flex items-center gap-3 rounded-sm bg-indigo-50 border border-indigo-200 px-3 py-2.5 transition-all hover:bg-indigo-100">
                    <Sparkles className="h-5 w-5 text-indigo-600" />
                    <span className="font-medium">UX Empresarial - Diseño profesional</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="plataforma" className="relative bg-gray-50 py-20">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold flex items-center justify-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
              Plataforma
            </p>
            <h2 className="mt-3 text-4xl font-light text-gray-900">Tecnología de <span className="font-semibold text-blue-600">vanguardia</span></h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            {featureCards.map((card, idx) => {
              const colors = [
                { border: 'border-blue-200', bg: 'bg-blue-50', icon: 'bg-blue-600', text: 'text-blue-600' },
                { border: 'border-teal-200', bg: 'bg-teal-50', icon: 'bg-teal-600', text: 'text-teal-600' },
                { border: 'border-indigo-200', bg: 'bg-indigo-50', icon: 'bg-indigo-600', text: 'text-indigo-600' }
              ]
              const color = colors[idx]
              return (
                <div key={card.title} className={`group relative overflow-hidden rounded-sm border ${color.border} ${color.bg} p-8 transition-all hover:shadow-lg`}>
                  <div className="relative">
                    <div className={`mb-5 inline-flex items-center justify-center rounded-sm ${color.icon} p-4 shadow-md`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-xl font-semibold text-gray-900">{card.title}</p>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{card.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section id="forecast" className="relative bg-white py-20">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="flex flex-col gap-6 rounded-sm border border-gray-200 bg-white p-8 shadow-lg md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Forecast Core
              </p>
              <h2 className="mt-3 text-4xl font-light leading-tight text-gray-900">Pipeline validado con <span className="font-semibold text-blue-600">forecastCore.py</span></h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
                Utilizamos helpers en blueprints Flask y motor SARIMA en paralelo.
                Validamos CSV heterogéneos, limpiamos outliers y persistimos autenticación en SQLite.
              </p>
            </div>
            <div className="flex items-center justify-center rounded-sm border border-gray-200 bg-gray-50 p-6 shadow-sm">
              <img
                src="/LOGO-TOTALPEC-ALTA.png"
                alt="Logo TOTAL PEC"
                className="h-20 w-auto object-contain opacity-80"
              />
            </div>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {uploadSteps.map((step, idx) => {
              const colors = [
                { badge: 'bg-blue-600', border: 'border-blue-200', bg: 'bg-blue-50', icon: 'bg-blue-600' },
                { badge: 'bg-indigo-600', border: 'border-indigo-200', bg: 'bg-indigo-50', icon: 'bg-indigo-600' },
                { badge: 'bg-teal-600', border: 'border-teal-200', bg: 'bg-teal-50', icon: 'bg-teal-600' }
              ]
              const color = colors[idx]
              return (
                <div key={step.title} className={`group relative flex flex-col gap-4 rounded-sm border ${color.border} ${color.bg} p-8 shadow-md transition-all hover:shadow-lg`}>
                  <div className={`absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-sm ${color.badge} text-xs font-semibold text-white shadow-md`}>
                    {idx + 1}
                  </div>
                  <div className={`inline-flex h-14 w-14 items-center justify-center rounded-sm ${color.icon} shadow-md`}>
                    <step.icon className="h-7 w-7 text-white" />
                  </div>
                  <p className="text-xl font-semibold text-gray-900">{step.title}</p>
                  <p className="text-sm leading-relaxed text-gray-600">{step.detail}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative bg-gray-50 py-20">
        <div className="relative mx-auto max-w-6xl px-6">
          <p className="text-center text-xs uppercase tracking-wider text-blue-600 font-semibold flex items-center justify-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Ruta INNOVAHACK
          </p>
          <h3 className="mt-3 text-center text-4xl font-light text-gray-900">Plan táctico para <span className="font-semibold text-blue-600">TOTAL PEC</span></h3>
          <div className="mt-12 grid gap-6 md:grid-cols-4">
            {timeline.map((event, idx) => {
              const colors = [
                { badge: 'bg-blue-600', border: 'border-blue-200', bg: 'bg-blue-50', icon: 'bg-blue-600' },
                { badge: 'bg-indigo-600', border: 'border-indigo-200', bg: 'bg-indigo-50', icon: 'bg-indigo-600' },
                { badge: 'bg-teal-600', border: 'border-teal-200', bg: 'bg-teal-50', icon: 'bg-teal-600' },
                { badge: 'bg-gray-700', border: 'border-gray-200', bg: 'bg-white', icon: 'bg-gray-700' }
              ]
              const color = colors[idx]
              return (
                <div key={event.stage} className={`relative rounded-sm border ${color.border} ${color.bg} p-6 text-center shadow-md transition-all hover:shadow-lg`}>
                  <div className={`absolute -top-3 left-1/2 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-sm ${color.badge} text-xs font-semibold text-white shadow-md`}>
                    {idx + 1}
                  </div>
                  <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-sm ${color.icon} shadow-md`}>
                    <event.icon className="h-6 w-6 text-white" />
                  </div>
                  <p className="text-lg font-semibold text-gray-900">{event.stage}</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{event.info}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <section className="relative bg-white py-20">
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="relative overflow-hidden rounded-sm border-2 border-blue-600 bg-gradient-to-br from-blue-50 to-white p-10 shadow-xl md:p-12">
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-wider text-blue-600 font-semibold flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                  Listo para producción
                </p>
                <h4 className="mt-4 text-4xl font-light leading-tight text-gray-900">
                  Sube tu CSV hoy, obtén forecast mañana y presenta resultados con <span className="font-semibold text-blue-600">estilo profesional</span>.
                </h4>
                <p className="mt-4 text-base leading-relaxed text-gray-600">
                  Autenticación segura, roles diferenciados, helpers en Flask blueprints y React Router para orquestar
                  experiencia. Todo está optimizado para la sesión evaluadora de INNOVAHACK 2025.
                </p>
              </div>
              <div className="flex flex-col gap-4">
                <Link
                  to="/login"
                  className="group inline-flex items-center justify-center gap-2 rounded-sm bg-blue-600 px-8 py-4 text-sm font-semibold text-white shadow-md transition-all hover:bg-blue-700 hover:shadow-lg"
                >
                  Iniciar sesión segura
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="mailto:innovation@totalpec.com"
                  className="inline-flex items-center justify-center gap-2 rounded-sm border-2 border-gray-300 bg-white px-8 py-4 text-sm font-semibold text-gray-700 transition-all hover:border-gray-400 hover:bg-gray-50"
                >
                  Solicitar onboarding
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
