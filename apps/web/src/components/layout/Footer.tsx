export function Footer() {
  return (
    <footer className="bg-muted/50 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <h3 className="font-bold mb-4">InfoPanama</h3>
            <p className="text-sm text-muted-foreground">
              Plataforma de verificación de información automatizada con IA para Panamá.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-bold mb-4">Navegación</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/verificaciones" className="text-muted-foreground hover:text-foreground">
                  Verificaciones
                </a>
              </li>
              <li>
                <a href="/medios" className="text-muted-foreground hover:text-foreground">
                  Medios
                </a>
              </li>
              <li>
                <a href="/eventos" className="text-muted-foreground hover:text-foreground">
                  Eventos
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="font-bold mb-4">Información</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/metodologia" className="text-muted-foreground hover:text-foreground">
                  Metodología
                </a>
              </li>
              <li>
                <a href="/sobre-nosotros" className="text-muted-foreground hover:text-foreground">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="/contacto" className="text-muted-foreground hover:text-foreground">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Submit */}
          <div>
            <h3 className="font-bold mb-4">Participar</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="/enviar" className="text-muted-foreground hover:text-foreground">
                  Enviar Rumor
                </a>
              </li>
              <li>
                <a href="/faq" className="text-muted-foreground hover:text-foreground">
                  Preguntas Frecuentes
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} InfoPanama. Todos los derechos reservados.</p>
          <p className="mt-2">
            Desarrollado con ❤️ para Panamá
          </p>
        </div>
      </div>
    </footer>
  )
}
