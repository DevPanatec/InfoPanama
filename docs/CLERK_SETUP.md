# Configuración de Clerk para InfoPanama

Esta guía te ayudará a configurar Clerk para autenticación en InfoPanama.

## 1. Crear cuenta en Clerk

1. Ve a [clerk.com](https://clerk.com) y crea una cuenta
2. Crea una nueva aplicación llamada "InfoPanama"
3. Selecciona las opciones de autenticación que desees (Email, Google, etc.)

## 2. Obtener las API Keys

En el dashboard de Clerk:

1. Ve a **API Keys** en el menú lateral
2. Copia el **Publishable Key** (empieza con `pk_test_...`)
3. Copia el **Secret Key** (empieza con `sk_test_...`)

## 3. Configurar variables de entorno

Abre el archivo `apps/web/.env.local` y agrega:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_tu_key_aqui
CLERK_SECRET_KEY=sk_test_tu_key_aqui
```

## 4. Configurar URLs de Clerk

En el dashboard de Clerk, ve a **Paths** y configura:

- **Sign-in URL**: `/sign-in`
- **Sign-up URL**: `/sign-up`
- **After sign-in URL**: `/`
- **After sign-up URL**: `/`

## 5. Configurar Webhook para sync con Convex

### 5.1 Obtener URL del webhook

Tu URL de webhook será:
```
https://tu-deployment.convex.cloud/clerk-webhook
```

Reemplaza `tu-deployment` con tu deployment de Convex.

### 5.2 Crear webhook en Clerk

1. En Clerk dashboard, ve a **Webhooks**
2. Click en **Add Endpoint**
3. Endpoint URL: `https://tu-deployment.convex.cloud/clerk-webhook`
4. Selecciona los eventos:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copia el **Signing Secret** (empieza con `whsec_...`)

### 5.3 Agregar Signing Secret (Opcional para producción)

En `.env.local`:
```bash
CLERK_WEBHOOK_SECRET=whsec_tu_secret_aqui
```

## 6. Verificar instalación

1. Inicia el servidor de desarrollo:
```bash
npm run dev
```

2. Ve a `http://localhost:3000`

3. Haz click en "Iniciar sesión" en el navbar

4. Deberías ver el formulario de Clerk

5. Crea una cuenta de prueba

6. Verifica que el usuario se creó en Convex:
   - Ve al dashboard de Convex
   - Abre la tabla `users`
   - Deberías ver tu usuario

## 7. Dar permisos de admin

Para dar permisos de admin a tu usuario:

1. Ve al dashboard de Convex
2. Abre la tabla `users`
3. Encuentra tu usuario
4. Edita el campo `role` y cámbialo a `"admin"`
5. Guarda los cambios

Ahora puedes acceder al panel admin en `/admin/dashboard`

## 8. Configurar roles personalizados (Opcional)

Si quieres usar roles personalizados de Clerk:

1. En Clerk dashboard, ve a **User & Authentication → Roles**
2. Crea los roles: `reader`, `moderator`, `editor`, `approver`, `admin`
3. Actualiza el código en `apps/web/src/lib/auth.ts` para leer roles desde Clerk metadata

## Roles disponibles

- **reader**: Usuario básico, puede comentar y solicitar verificaciones
- **moderator**: Puede moderar comentarios y gestionar solicitudes
- **editor**: Puede crear y editar verificaciones
- **approver**: Puede aprobar y publicar verificaciones
- **admin**: Acceso completo al sistema

## Protección de rutas

### Rutas protegidas automáticamente por middleware:

- `/admin/*` - Panel administrativo
- `/notificaciones` - Notificaciones de usuario
- `/suscripciones` - Gestión de suscripciones

### Proteger componentes por rol:

```tsx
import { RoleGate } from '@/components/auth/RoleGate'

<RoleGate allowedRoles={['admin', 'editor']}>
  <AdminOnlyContent />
</RoleGate>
```

### Proteger páginas completas:

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

export default function AdminPage() {
  return (
    <ProtectedRoute allowedRoles={['admin', 'moderator']}>
      <AdminContent />
    </ProtectedRoute>
  )
}
```

## Troubleshooting

### Error: "Invalid publishable key"
- Verifica que copiaste la key correcta de Clerk
- Asegúrate de usar `NEXT_PUBLIC_` al inicio
- Reinicia el servidor de desarrollo

### Los usuarios no se sincronizan con Convex
- Verifica que el webhook esté configurado correctamente
- Revisa los logs en Clerk dashboard > Webhooks
- Verifica que la URL del webhook sea correcta
- Asegúrate de que Convex esté deployado

### No puedo acceder al admin
- Verifica que tu usuario tenga rol `admin` en Convex
- Borra el cache del navegador
- Cierra sesión y vuelve a iniciar sesión

## Seguridad en producción

Para producción, asegúrate de:

1. ✅ Usar claves de producción de Clerk (`pk_live_...` y `sk_live_...`)
2. ✅ Configurar el webhook con verificación de firma
3. ✅ Habilitar 2FA para usuarios con rol `approver` o superior
4. ✅ Configurar rate limiting en Clerk
5. ✅ Revisar los logs de auditoría regularmente
6. ✅ Habilitar detección de bots en Clerk

## Referencias

- [Clerk Documentation](https://clerk.com/docs)
- [Clerk + Next.js Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Convex + Clerk Integration](https://docs.convex.dev/auth/clerk)
