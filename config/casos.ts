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
      { src: 'https://res.cloudinary.com/dgxwduhdc/image/upload/w_800,q_auto,f_auto/catalog/products/sofa/poltrona-2-cover?v=1790795872712', alt: 'Poltrona' },
      { src: 'https://res.cloudinary.com/dgxwduhdc/image/upload/w_800,q_auto,f_auto/catalog/products/ESPEJO/espejo-de-mimbre-cover?v=1789072785500', alt: 'Espejo de mimbre' },
      { src: 'https://res.cloudinary.com/dgxwduhdc/image/upload/w_800,q_auto,f_auto/catalog/products/decoracion/lampara-de-mesa-mariposa-cover?v=1789223315918', alt: 'Lámpara de mesa mariposa' },
      { src: 'https://res.cloudinary.com/dgxwduhdc/image/upload/w_800,q_auto,f_auto/catalog/products/blanqueria/set-de-3-cestas-cover?v=1788811202566', alt: 'Set de 3 cestas' },
      { src: 'https://res.cloudinary.com/dgxwduhdc/image/upload/w_800,q_auto,f_auto/catalog/products/decoracion/florero-ceramica-cover?v=1789152047723', alt: 'Florero cerámica' },
      { src: 'https://res.cloudinary.com/dgxwduhdc/image/upload/w_800,q_auto,f_auto/catalog/products/decoracion/cuadro-deco-cover?v=1789044807690', alt: 'Cuadro deco' },
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
