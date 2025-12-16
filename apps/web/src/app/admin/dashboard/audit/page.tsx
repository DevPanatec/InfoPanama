'use client'

import { ScrollText, User, Shield, FileEdit } from 'lucide-react'

const DEMO_AUDIT_LOGS = [
  {
    id: '1',
    action: 'claim.updated',
    user: 'admin@infopanama.com',
    entity: 'CLM-001',
    details: 'Changed verdict from INVESTIGATING to TRUE',
    timestamp: '2024-01-15 10:30:15',
    ipAddress: '192.168.1.100',
  },
  {
    id: '2',
    action: 'actor.flagged',
    user: 'moderator@infopanama.com',
    entity: 'ACT-012',
    details: 'Flagged actor as HIGH risk',
    timestamp: '2024-01-15 09:15:42',
    ipAddress: '192.168.1.101',
  },
  {
    id: '3',
    action: 'verdict.published',
    user: 'admin@infopanama.com',
    entity: 'VRD-023',
    details: 'Published verdict for claim CLM-001',
    timestamp: '2024-01-15 08:45:33',
    ipAddress: '192.168.1.100',
  },
  {
    id: '4',
    action: 'user.login',
    user: 'editor@infopanama.com',
    entity: 'USR-005',
    details: 'Successful login',
    timestamp: '2024-01-15 08:00:12',
    ipAddress: '192.168.1.102',
  },
  {
    id: '5',
    action: 'config.changed',
    user: 'admin@infopanama.com',
    entity: 'CFG-001',
    details: 'Updated system configuration',
    timestamp: '2024-01-14 17:30:00',
    ipAddress: '192.168.1.100',
  },
]

export default function AuditPage() {
  const getActionBadge = (action: string) => {
    const type = action.split('.')[0]
    const configs: Record<string, { color: string; icon: typeof FileEdit }> = {
      claim: { color: 'bg-blue-500/10 text-blue-500', icon: FileEdit },
      actor: { color: 'bg-slate-500/10 text-slate-500', icon: Shield },
      verdict: { color: 'bg-green-500/10 text-green-500', icon: FileEdit },
      user: { color: 'bg-orange-500/10 text-orange-500', icon: User },
      config: { color: 'bg-red-500/10 text-red-500', icon: Shield },
    }

    const config = configs[type] || configs.claim
    const Icon = config.icon

    return (
      <span className={`inline-flex items-center gap-1 text-xs ${config.color} px-2 py-1 rounded`}>
        <Icon className="h-3 w-3" />
        {action}
      </span>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">
          Registro inmutable de todas las acciones administrativas
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <ScrollText className="h-8 w-8 text-blue-500" />
            <div className="text-3xl font-bold">{DEMO_AUDIT_LOGS.length}</div>
          </div>
          <div className="text-sm text-muted-foreground">Total Logs (24h)</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <User className="h-8 w-8 text-amber-500" />
            <div className="text-3xl font-bold">
              {new Set(DEMO_AUDIT_LOGS.map((l) => l.user)).size}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Usuarios Activos</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <FileEdit className="h-8 w-8 text-green-500" />
            <div className="text-3xl font-bold">
              {DEMO_AUDIT_LOGS.filter((l) => l.action.includes('claim')).length}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Cambios en Claims</div>
        </div>

        <div className="bg-card rounded-lg p-6 border border-border">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-red-500" />
            <div className="text-3xl font-bold">
              {DEMO_AUDIT_LOGS.filter((l) => l.action.includes('config')).length}
            </div>
          </div>
          <div className="text-sm text-muted-foreground">Cambios Críticos</div>
        </div>
      </div>

      {/* Security Note */}
      <div className="bg-card rounded-lg border border-amber-500/50 p-6 mb-6">
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <h3 className="font-semibold mb-1">Logs Inmutables</h3>
            <p className="text-sm text-muted-foreground">
              Todos los logs son inmutables y se almacenan permanentemente en Convex.
              No pueden ser modificados o eliminados, garantizando la trazabilidad completa.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <select className="px-4 py-2 rounded-lg border border-input bg-background">
          <option value="">Todas las acciones</option>
          <option value="claim">Claims</option>
          <option value="actor">Actores</option>
          <option value="verdict">Veredictos</option>
          <option value="user">Usuarios</option>
          <option value="config">Configuración</option>
        </select>

        <select className="px-4 py-2 rounded-lg border border-input bg-background">
          <option value="">Todos los usuarios</option>
          <option value="admin">Admins</option>
          <option value="moderator">Moderadores</option>
          <option value="editor">Editores</option>
        </select>

        <input
          type="search"
          placeholder="Buscar en logs..."
          className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
        />
      </div>

      {/* Logs Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left px-6 py-3 text-sm font-medium">Timestamp</th>
              <th className="text-left px-6 py-3 text-sm font-medium">Acción</th>
              <th className="text-left px-6 py-3 text-sm font-medium">Usuario</th>
              <th className="text-left px-6 py-3 text-sm font-medium">Detalles</th>
              <th className="text-left px-6 py-3 text-sm font-medium">IP</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_AUDIT_LOGS.map((log) => (
              <tr key={log.id} className="border-t border-border hover:bg-muted/30">
                <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                  {log.timestamp}
                </td>
                <td className="px-6 py-4">{getActionBadge(log.action)}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-xs">
                      {log.user[0].toUpperCase()}
                    </div>
                    {log.user}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {log.details}
                  <span className="block text-xs mt-1">Entity: {log.entity}</span>
                </td>
                <td className="px-6 py-4 text-sm font-mono text-muted-foreground">
                  {log.ipAddress}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
