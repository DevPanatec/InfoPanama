# 🌐 Configuración de Browserbase para Instagram Scraping

## ¿Qué es Browserbase?

Browserbase es un servicio de navegadores headless en la nube que incluye:
- ✅ **Anti-detección** - Bypass automático de sistemas anti-bot
- ✅ **IPs rotativas** - Cada sesión usa una IP diferente
- ✅ **Captcha handling** - Resuelve captchas automáticamente en la mayoría de casos
- ✅ **Fingerprinting** - Huella digital única por sesión
- ✅ **Proxies incluidos** - No necesitas servicios externos

## 📋 Pasos para Configurar

### 1. Crear Cuenta en Browserbase

1. Ve a [https://www.browserbase.com](https://www.browserbase.com)
2. Crea una cuenta (puedes usar GitHub/Google)
3. Selecciona el plan **Hobby** ($20/mes - 100 horas)

### 2. Obtener Credenciales

Una vez dentro del dashboard:

1. **API Key**:
   - Ve a Settings → API Keys
   - Click en "Create API Key"
   - Copia la API key (empieza con `bb_`)

2. **Project ID**:
   - Ve a Projects
   - Copia el Project ID de tu proyecto por defecto

### 3. Configurar Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# Browserbase (para Instagram scraping)
BROWSERBASE_API_KEY=bb_live_xxxxxxxxxxxxxxxxxxxxxxxx
BROWSERBASE_PROJECT_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### 4. Instalar Dependencias

```bash
cd packages/crawler
npm install playwright-core
```

## 🚀 Uso

Una vez configurado, el crawler de Instagram funcionará automáticamente:

```bash
npm run crawl:all
```

El crawler detectará automáticamente las credenciales de Browserbase y las usará para scraping de Instagram.

## 💰 Costos

### Plan Hobby ($20/mes)
- 100 horas de sesiones
- IPs rotativas incluidas
- Anti-detección incluido
- Captcha handling incluido

**Estimación de uso:**
- 1 scrape de Instagram ≈ 2-3 minutos
- ~2,000 scrapes/mes con el plan Hobby
- Con 3 scrapes/día = ~90 scrapes/mes = $20/mes

### Comparación con ProxyScrape

| Feature | ProxyScrape | Browserbase |
|---------|-------------|-------------|
| Precio | $20/mes | $20/mes |
| IPs rotativas | ✅ | ✅ |
| Anti-detección | ❌ Básica | ✅ Avanzada |
| Captcha solving | ❌ (requiere 2Captcha) | ✅ Incluido |
| Fingerprinting | ❌ | ✅ |
| Setup | Complejo | Simple |

**Browserbase es mejor porque:**
1. Todo incluido (no necesitas 2Captcha)
2. Mejor anti-detección
3. Setup más simple (solo 2 variables)
4. Menos probabilidad de bloqueos

## 🔍 Verificar que Funciona

Para probar que Browserbase está configurado correctamente:

```bash
cd packages/crawler
npm run crawl:all
```

Busca en los logs:
```
📸 Iniciando crawler de Instagram (@focopanama)...
🔒 Usando Browserbase (anti-detección + IPs rotativas)
```

Si ves esto, ¡está funcionando! ✅

## ⚠️ Troubleshooting

### Error: "Browserbase no configurado"
- Verifica que `BROWSERBASE_API_KEY` y `BROWSERBASE_PROJECT_ID` estén en `.env`
- Asegúrate de que no haya espacios antes/después de las variables

### Error: "Connection failed"
- Verifica que tu API key sea válida
- Revisa que tengas horas disponibles en tu plan

### Captchas siguen apareciendo
- Browserbase resuelve la mayoría de captchas automáticamente
- Si siguen apareciendo, contacta al soporte de Browserbase

## 📚 Recursos

- [Documentación Browserbase](https://docs.browserbase.com)
- [Playwright + Browserbase](https://docs.browserbase.com/guides/playwright)
- [Pricing](https://www.browserbase.com/pricing)

## 🆘 Soporte

Si tienes problemas:
1. Revisa los logs del crawler
2. Consulta la documentación de Browserbase
3. Contacta al equipo de InfoPanama
