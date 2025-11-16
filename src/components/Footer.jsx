import { Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer id="contacto" className="border-t border-gray-200 bg-gray-100">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-3">
        <div>
          <p className="text-sm uppercase tracking-wider text-blue-600">TOTAL PEC</p>
          <p className="mt-2 text-xl font-semibold text-gray-900">Inteligencia Operativa</p>
          <p className="mt-3 text-sm text-gray-700">
            Construido por INNOVAHACK 2025 · Integrando equipos de predicción,
            logística y compras con insights accionables en minutos.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Contacto directo</p>
          <ul className="mt-4 space-y-3 text-sm text-gray-700">
            <li className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-600" />
              innovation@totalpec.com
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              +591 78235231
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-600" />
              UNIVERSIDAD PRIVADA DE SANTA CRUZ
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900">Siguiente paso</p>
          <p className="mt-3 text-sm text-gray-700">
            Agenda la conexión con el equipo TOTAL PEC y activa el piloto en tu operación.
            Integramos tus CSV históricos, ejecutamos forecast y habilitamos tableros ejecutivos en días.
          </p>
          <a
            href="mailto:innovation@totalpec.com"
            className="mt-4 inline-flex items-center justify-center rounded-sm bg-blue-600 px-5 py-2 text-sm font-semibold text-gray-900 transition hover:bg-blue-700 shadow-md"
          >
            Solicitar demo privada
          </a>
        </div>
      </div>
      <div className="border-t border-gray-200 py-4">
        <p className="text-center text-xs text-gray-600">
          © {new Date().getFullYear()} TOTAL PEC · INNOVAHACK 2025. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  )
}

