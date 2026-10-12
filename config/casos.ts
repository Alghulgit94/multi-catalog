// Solo datos reales. Sin testimonio aprobado => quote vacío y no se muestra cita.
export type Caso = {
  id: string; nombre: string; rubro: string; url: string; logo?: string;
  fotos: { src: string; alt: string }[];
  testimonio?: { texto: string; autor: string; foto?: string };
  acento: string; // hilo de color: var(--nanduti-fucsia) | var(--nanduti-verde) | ...
};

export const CASOS: Caso[] = [
  {
    id: 'ug-hogar', nombre: 'UG Hogar', rubro: 'Muebles y artículos para el hogar',
    url: 'https://www.ughogar.com/catalogo', // cambiar al catálogo en Katalo cuando exista
    logo: 'https://www.ughogar.com/img/brand/ug-logo.png',
    fotos: [
      { src: '/landing/poltrona-2.webp', alt: 'Poltrona' },
      { src: '/landing/espejo-de-mimbre.webp', alt: 'Espejo de mimbre' },
      { src: '/landing/lampara-de-mesa-mariposa.webp', alt: 'Lámpara de mesa mariposa' },
      { src: '/landing/set-de-3-cestas.webp', alt: 'Set de 3 cestas' },
      { src: '/landing/florero-ceramica.webp', alt: 'Florero cerámica' },
      { src: '/landing/cuadro-deco.webp', alt: 'Cuadro deco' },
    ],
    acento: 'var(--nanduti-fucsia)',
  },
  {
    id: 'ipora-termos', nombre: 'Ipora Termos', rubro: 'Termos (rubro a confirmar)',
    url: '', // PENDIENTE
    fotos: [], // PENDIENTE: 4 a 6 fotos
    acento: 'var(--nanduti-verde)',
  },
];
