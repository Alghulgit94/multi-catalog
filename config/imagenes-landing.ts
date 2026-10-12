// Fotos reales de UG Hogar usadas en hero, problema y beneficios. Archivos estáticos en public/landing (WebP, 800px).
const C = '/landing/';
export const IMG = {
  poltrona: { src: C + 'poltrona-2.webp', alt: 'Poltrona', precio: 600000 },
  espejoMimbre: { src: C + 'espejo-de-mimbre.webp', alt: 'Espejo de mimbre', precio: 145000 },
  espejo: { src: C + 'espejo-2.webp', alt: 'Espejo', precio: 300000 },
  espejoLuz: { src: C + 'espejo-con-luz.webp', alt: 'Espejo con luz', precio: 750000 },
  lampara: { src: C + 'lampara-de-mesa-mariposa.webp', alt: 'Lámpara de mesa mariposa', precio: 120000 },
  cesta: { src: C + 'cesta-mimbre.webp', alt: 'Cesta mimbre', precio: 120000 },
  floreroVidrio: { src: C + 'florero-vidrio.webp', alt: 'Florero vidrio', precio: 130000 },
  florero2: { src: C + 'florero-2.webp', alt: 'Florero', precio: 160000 },
  floreroCeramica: { src: C + 'florero-ceramica.webp', alt: 'Florero cerámica', precio: 60000 },
  alfombra: { src: C + 'alfombra-ovalada.webp', alt: 'Alfombra ovalada', precio: 160000 },
};
// Uso: hero = poltrona, espejoMimbre, lampara, cesta (+ burbuja con poltrona) · problema = espejoMimbre, espejo, espejoLuz
// beneficio 1 = floreroVidrio (+ miniaturas floreroVidrio, florero2, floreroCeramica) · beneficio 2 = alfombra · beneficio 3 = lampara
