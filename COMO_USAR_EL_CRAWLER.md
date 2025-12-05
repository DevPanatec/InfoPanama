# 🕷️ Cómo Usar el Crawler de InfoPanama

## ¿Qué hace el crawler?

1. **Scrapea noticias** de La Prensa y Gaceta Oficial automáticamente
2. **Extrae claims verificables** con IA (OpenAI GPT-5 mini)
3. **Los guarda en Convex** listos para verificar en el admin

## 🚀 Uso Rápido

### Windows
```cmd
run-crawler.bat
```

### Linux/Mac
```bash
chmod +x run-crawler.sh
./run-crawler.sh
```

## ✨ Eso es todo!

El crawler hará TODO automáticamente:
- ✅ Visita sitios de noticias
- ✅ Extrae artículos recientes
- ✅ Identifica claims con IA
- ✅ Los guarda en tu base de datos

## 📊 Después del crawl

1. Ve a http://localhost:3000/admin/dashboard
2. Verás los nuevos claims en "Verificaciones Pendientes"
3. Revisa y aprueba los claims
4. ¡Listo para publicar!

## ⏱️ ¿Cuánto tarda?

- **20-30 artículos** por ejecución
- **~2 minutos** de scraping
- **~3 minutos** de análisis con IA
- **Total: ~5 minutos**

## 💰 ¿Cuánto cuesta?

- **OpenAI:** ~$0.024 por ejecución (~80 artículos)
- **~$0.70/mes** si ejecutas 4 veces al día

## 🤖 Automatización

Ya está configurado para ejecutarse cada 6 horas automáticamente con los cron jobs de Convex.

Para automatización completa (incluido Playwright), mira [CRAWLER_SETUP.md](CRAWLER_SETUP.md) para configurar GitHub Actions.

## 🆘 Problemas?

### "CONVEX_URL no está configurado"
Verifica que `.env.local` tenga:
```
NEXT_PUBLIC_CONVEX_URL=https://tu-deployment.convex.cloud
```

### "OpenAI API key inválido"
Actualiza tu API key en `.env.local`:
```
OPENAI_API_KEY=sk-proj-tu-key-aqui
```

### No veo los claims en el admin
1. Verifica que `npm run dev` esté corriendo
2. Revisa los logs del crawler

---

📚 **Documentación completa:** [CRAWLER_SETUP.md](CRAWLER_SETUP.md)
