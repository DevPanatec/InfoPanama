/**
 * Constantes compartidas para InfoPanama
 */

// ============================================
// VERDICT LABELS
// ============================================

export const VERDICT_LABELS = {
  TRUE: 'Verdadero',
  FALSE: 'Falso',
  MIXED: 'Mixto',
  UNPROVEN: 'No Probado',
  NEEDS_CONTEXT: 'Necesita Contexto',
} as const

export const VERDICT_COLORS = {
  TRUE: 'text-green-500',
  FALSE: 'text-red-500',
  MIXED: 'text-yellow-500',
  UNPROVEN: 'text-gray-500',
  NEEDS_CONTEXT: 'text-blue-500',
} as const

// ============================================
// RISK LEVELS
// ============================================

export const RISK_LABELS = {
  LOW: 'Bajo',
  MEDIUM: 'Medio',
  HIGH: 'Alto',
  CRITICAL: 'Crítico',
} as const

export const RISK_COLORS = {
  LOW: 'text-green-500',
  MEDIUM: 'text-yellow-500',
  HIGH: 'text-orange-500',
  CRITICAL: 'text-red-500',
} as const

// ============================================
// STATUS LABELS
// ============================================

export const STATUS_LABELS = {
  new: 'Nueva',
  investigating: 'Investigando',
  review: 'En Revisión',
  approved: 'Aprobada',
  rejected: 'Rechazada',
  published: 'Publicada',
} as const

// ============================================
// ACTOR TYPES
// ============================================

export const ACTOR_TYPE_LABELS = {
  person: 'Persona',
  group: 'Grupo',
  troll_network: 'Red de Trolls',
  botnet: 'Botnet',
  HB: 'Hombres de Blanco',
  anonymous: 'Anónimo',
  verified_account: 'Cuenta Verificada',
  media_outlet: 'Medio de Comunicación',
  official: 'Oficial',
} as const

// ============================================
// KYA STATUS
// ============================================

export const KYA_STATUS_LABELS = {
  verified: 'Verificado',
  suspicious: 'Sospechoso',
  flagged: 'Marcado',
  blocked: 'Bloqueado',
} as const

export const KYA_STATUS_COLORS = {
  verified: 'text-green-500',
  suspicious: 'text-yellow-500',
  flagged: 'text-orange-500',
  blocked: 'text-red-500',
} as const

// ============================================
// USER ROLES
// ============================================

export const ROLE_LABELS = {
  reader: 'Lector',
  moderator: 'Moderador',
  editor: 'Editor',
  approver: 'Aprobador',
  admin: 'Administrador',
} as const

export const ROLE_PERMISSIONS = {
  reader: ['view'],
  moderator: ['view', 'comment', 'flag'],
  editor: ['view', 'comment', 'flag', 'edit', 'create'],
  approver: ['view', 'comment', 'flag', 'edit', 'create', 'approve', 'publish'],
  admin: ['*'],
} as const

// ============================================
// LEYES PANAMEÑAS (Marco Legal)
// ============================================

export const PANAMA_LAWS = {
  ley_23_2015: 'Ley 23 de 2015 - Protección de Datos Personales',
  ley_254_2021: 'Ley 254 de 2021 - Ciberseguridad',
  gafi: 'Recomendaciones GAFI',
  sbs: 'Normas Superintendencia de Bancos',
} as const

// ============================================
// CATEGORÍAS
// ============================================

export const CATEGORIES = [
  'política',
  'economía',
  'salud',
  'seguridad',
  'infraestructura',
  'educación',
  'medio ambiente',
  'corrupción',
  'elecciones',
  'covid-19',
  'otros',
] as const

// ============================================
// MEDIOS PRINCIPALES
// ============================================

export const MAIN_MEDIA_SOURCES = [
  'Telemetro',
  'La Prensa',
  'TVN',
  'Crítica',
  'Panamá América',
  'Metro Libre',
  'La Estrella de Panamá',
  'El Siglo',
] as const

// ============================================
// FUENTES OFICIALES
// ============================================

export const OFFICIAL_SOURCES = [
  'Presidencia de la República',
  'Gaceta Oficial',
  'Asamblea Nacional',
  'MINSA',
  'MEF',
  'MEDUCA',
  'Tribunal Electoral',
] as const
