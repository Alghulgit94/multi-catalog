// Extensión de tema para tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        tinta: '#13203B', 'texto-secundario': '#556079', fondo: '#FFFFFF', 'fondo-alterno': '#F3F5F9', linea: '#DCE1EA',
        primario: { DEFAULT: '#1F4FD8', hover: '#183FB0' },
        nanduti: { fucsia: '#E0457B', amarillo: '#F5B82E', verde: '#2E9E6A' },
        tinte: { amarillo: '#FEF3D9', verde: '#E2F2EA', fucsia: '#FCE6EE' },
        whatsapp: '#25D366'
      },
      fontFamily: { titulos: ['var(--font-bricolage)', 'system-ui', 'sans-serif'], cuerpo: ['var(--font-figtree)', 'system-ui', 'sans-serif'] },
      borderRadius: { boton: '12px', plan: '12px', celular: '28px', foto: '8px', escenario: '24px' },
      boxShadow: { celular: '0 32px 64px -24px rgba(19,32,59,.35), 0 4px 12px rgba(19,32,59,.08)' },
      maxWidth: { contenido: '1200px' }
    }
  }
};
