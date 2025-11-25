'use client'

import { Shield, AlertTriangle, FileText, CheckCircle, Plus } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_DD_REPORTS = [
  {
    id: '1',
    actorName: 'Hombres de Blanco',
    status: 'in_progress',
    riskLevel: 'CRITICAL',
    lastUpdate: '2024-01-15',
    completeness: 65,
  },
  {
    id: '2',
    actorName: 'Actor Político XYZ',
    status: 'completed',
    riskLevel: 'HIGH',
    lastUpdate: '2024-01-10',
    completeness: 100,
  },
  {
    id: '3',
    actorName: 'Organización Civil ABC',
    status: 'pending',
    riskLevel: 'MEDIUM',
    lastUpdate: '2024-01-08',
    completeness: 20,
  },
]

export default function DDPage() {
  const router = useRouter()
  const [reports, setReports] = useState(DEMO_DD_REPORTS)

  const getRiskBadge = (level: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      LOW: { color: 'bg-green-500/10 text-green-500', label: 'Bajo' },
      MEDIUM: { color: 'bg-yellow-500/10 text-yellow-500', label: 'Medio' },
      HIGH: { color: 'bg-orange-500/10 text-orange-500', label: 'Alto' },
      CRITICAL: { color: 'bg-red-500/10 text-red-500', label: 'Crítico' },
    }

    const config = configs[level]

    return (
      <span className={`inline-flex text-xs ${config.color} px-2 py-1 rounded`}>
        {config.label}
      </span>
    )
  }

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-gray-500/10 text-gray-500', label: 'Pendiente' },
      in_progress: { color: 'bg-blue-500/10 text-blue-500', label: 'En Progreso' },
      completed: { color: 'bg-green-500/10 text-green-500', label: 'Completado' },
    }

    const config = configs[status]

    return (
      <span className={`inline-flex text-xs ${config.color} px-2 py-1 rounded`}>
        {config.label}
      </span>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Debida Diligencia (DD)</h1>
          <p className="text-muted-foreground">
            Análisis de riesgo y verificación de actores informativos
          </p>
        </div>
        <button
          onClick={() => alert('Funcionalidad de crear reporte DD próximamente')}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Nuevo Reporte DD
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-8 w-8 text-blue-500" />
            <div className="text-3xl font-bold">{DEMO_DD_REPORTS.length}</div>
          </div>
          <div className="text-sm text-muted-foreground">Total Reportes</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="h-8 w-8 text-orange-500" />
            <div className="text-3xl font-bold">
              {DEMO_DD_REPORTS.filter((r) => r.status === 'in_progress').length}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">En Progreso</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <div className="text-3xl font-bold">
              {DEMO_DD_REPORTS.filter((r) => r.status === 'completed').length}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Completados</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-red-500" />
            <div className="text-3xl font-bold">
              {DEMO_DD_REPORTS.filter((r) => r.riskLevel === 'CRITICAL').length}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Críticos</div>
        </div>
      </div>

      {/* DD Framework Info */}
      <div className="bg-card rounded-lg border border-border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Marco de Debida Diligencia</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-muted/20 rounded-lg">
            <h3 className="font-semibold mb-2">1. Identificación</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Verificación de identidad</li>
              <li>• Historial de actividad</li>
              <li>• Vínculos conocidos</li>
            </ul>
          </div>
          <div className="p-4 bg-muted/20 rounded-lg">
            <h3 className="font-semibold mb-2">2. Evaluación de Riesgo</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Patrón de desinformación</li>
              <li>• Impacto potencial</li>
              <li>• Afiliaciones sospechosas</li>
            </ul>
          </div>
          <div className="p-4 bg-muted/20 rounded-lg">
            <h3 className="font-semibold mb-2">3. Monitoreo</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Seguimiento continuo</li>
              <li>• Alertas automáticas</li>
              <li>• Actualización de perfil</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select className="px-4 py-2 rounded-lg border border-input bg-background">
          <option value="">Todos los estados</option>
          <option value="pending">Pendiente</option>
          <option value="in_progress">En Progreso</option>
          <option value="completed">Completado</option>
        </select>

        <select className="px-4 py-2 rounded-lg border border-input bg-background">
          <option value="">Todos los riesgos</option>
          <option value="LOW">Bajo</option>
          <option value="MEDIUM">Medio</option>
          <option value="HIGH">Alto</option>
          <option value="CRITICAL">Crítico</option>
        </select>

        <input
          type="search"
          placeholder="Buscar reportes..."
          className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
        />
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium">Actor</th>
              <th className="text-left px-6 py-3 text-sm font-medium">Estado</th>
              <th className="text-left px-6 py-3 text-sm font-medium">Riesgo</th>
              <th className="text-left px-6 py-3 text-sm font-medium">Completitud</th>
              <th className="text-left px-6 py-3 text-sm font-medium">Última Act.</th>
              <th className="text-right px-6 py-3 text-sm font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-6 py-4">
                  <p className="font-medium">{report.actorName}</p>
                  <p className="text-xs text-muted-foreground">ID: {report.id}</p>
                </td>
                <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                <td className="px-6 py-4">{getRiskBadge(report.riskLevel)}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 max-w-[100px]">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${report.completeness}%` }}
                      />
                    </div>
                    <span className="text-sm">{report.completeness}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {report.lastUpdate}
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => alert(`Ver reporte de: ${report.actorName}`)}
                    className="text-sm text-primary hover:underline mr-3"
                  >
                    Ver
                  </button>
                  <button
                    onClick={() => alert(`Editar reporte de: ${report.actorName}`)}
                    className="text-sm text-primary hover:underline"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
