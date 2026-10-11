// En la etapa 2 se reemplaza por la tabla `planes` de la base de datos, sin tocar el componente.
// Montos en guaraníes. PROPUESTA A CONFIRMAR.
export type Plan = {
  id: 'gratis' | 'emprendedor' | 'negocio';
  nombre: string;
  precioMensual: number;
  precioAnual: number; // 2 meses gratis
  frase: string;
  destacado?: boolean;
  boton: string;
  caracteristicas: (nombrePlataforma: string) => string[];
};

export const PLANES: Plan[] = [
  { id: 'gratis', nombre: 'Gratis', precioMensual: 0, precioAnual: 0, frase: 'Para empezar a mostrar tus productos', boton: 'Empezar gratis',
    caracteristicas: n => ['10 productos', '3 fotos por producto', '3 categorías', 'Fotos con IA: créditos de bienvenida*', 'Nombre y descripción con IA', 'Consultas por WhatsApp ilimitadas', `Marca “Hecho con ${n}” visible`] },
  { id: 'emprendedor', nombre: 'Emprendedor', precioMensual: 89000, precioAnual: 890000, frase: 'Para vender todos los días', destacado: true, boton: 'Elegir Emprendedor',
    caracteristicas: n => ['100 productos', '6 fotos por producto', 'Categorías ilimitadas', '50 fotos con IA por mes', 'Nombre y descripción con IA', 'Consultas por WhatsApp ilimitadas', `Marca “Hecho con ${n}” pequeña`] },
  { id: 'negocio', nombre: 'Negocio', precioMensual: 189000, precioAnual: 1890000, frase: 'Para negocios con mucho catálogo', boton: 'Elegir Negocio',
    caracteristicas: n => ['Productos ilimitados', '10 fotos por producto', 'Categorías ilimitadas', '200 fotos con IA por mes', 'Nombre y descripción con IA', 'Consultas por WhatsApp ilimitadas', `Podés quitar la marca “Hecho con ${n}”`] },
];

export const NOTA_CREDITOS = '* Los créditos de bienvenida del plan Gratis se activan cuando tu tienda está verificada.';

export const formatoGs = (n: number) => 'Gs. ' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
