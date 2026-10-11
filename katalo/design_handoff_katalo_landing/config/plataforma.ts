// Única fuente del nombre, dominio y contacto de la plataforma.
export const PLATAFORMA = {
  nombre: 'Katalo',
  dominio: 'katalo.com.py', // a verificar
  whatsapp: '595000000000', // PENDIENTE: número real de atención, solo dígitos con código de país
  mensajeWhatsapp: (nombre: string) => `Hola, quiero saber más de ${nombre}`,
  redes: { instagram: '', facebook: '' }, // PENDIENTE
  rutas: { registro: '/registro', login: '/login', terminos: '/terminos', privacidad: '/privacidad' },
} as const;
