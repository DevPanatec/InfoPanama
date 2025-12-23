/**
 * Script para reintentar scraping de Instagram después de esperar
 * Soluciona el rate limiting temporal de Instagram
 */

import { spawn } from 'child_process'

console.log('⏳ Instagram está en rate limiting temporal')
console.log('   Esperando 10 minutos antes de reintentar...\n')

const WAIT_TIME = 10 * 60 * 1000 // 10 minutos en milisegundos

console.log(`⏰ Iniciando cuenta regresiva de 10 minutos...`)

let remaining = WAIT_TIME / 1000 // Segundos restantes

const interval = setInterval(() => {
  remaining -= 30
  const minutes = Math.floor(remaining / 60)
  const seconds = Math.floor(remaining % 60)

  process.stdout.write(`\r⏳ Tiempo restante: ${minutes}m ${seconds}s    `)

  if (remaining <= 0) {
    clearInterval(interval)
    console.log('\n\n✅ Tiempo de espera completado!')
    console.log('🚀 Ejecutando crawler de Instagram...\n')

    // Ejecutar el script de Instagram
    const pythonProcess = spawn('python', ['instagram-instaloader.py'], {
      cwd: process.cwd(),
      stdio: 'inherit'
    })

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        console.log('\n✅ Instagram scraping completado exitosamente!')
      } else {
        console.log(`\n❌ Instagram scraping falló con código: ${code}`)
      }
      process.exit(code || 0)
    })
  }
}, 30000) // Actualizar cada 30 segundos

// Manejar Ctrl+C
process.on('SIGINT', () => {
  clearInterval(interval)
  console.log('\n\n⚠️  Proceso cancelado por el usuario')
  process.exit(0)
})
