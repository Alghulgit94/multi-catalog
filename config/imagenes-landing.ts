// Fotos reales de UG Hogar usadas en hero, problema y beneficios (Cloudinary). Pasar a next/image con remotePatterns para res.cloudinary.com o descargarlas a /public en WebP.
const C = 'https://res.cloudinary.com/dgxwduhdc/image/upload/w_800,q_auto,f_auto/catalog/products/';
export const IMG = {
  poltrona: { src: C + 'sofa/poltrona-2-cover?v=1790795872712', alt: 'Poltrona', precio: 600000 },
  espejoMimbre: { src: C + 'ESPEJO/espejo-de-mimbre-cover?v=1789072785500', alt: 'Espejo de mimbre', precio: 145000 },
  espejo: { src: C + 'ESPEJO/espejo-2-cover?v=1789071131939', alt: 'Espejo', precio: 300000 },
  espejoLuz: { src: C + 'ESPEJO/espejo-con-luz-cover?v=1789071591622', alt: 'Espejo con luz', precio: 750000 },
  lampara: { src: C + 'decoracion/lampara-de-mesa-mariposa-cover?v=1789223315918', alt: 'Lámpara de mesa mariposa', precio: 120000 },
  cesta: { src: C + 'blanqueria/cesta-mimbre-cover?v=1788810943838', alt: 'Cesta mimbre', precio: 120000 },
  floreroVidrio: { src: C + 'decoracion/florero-vidrio-cover?v=1789151003721', alt: 'Florero vidrio', precio: 130000 },
  florero2: { src: C + 'decoracion/florero-2-cover?v=1789151823955', alt: 'Florero', precio: 160000 },
  floreroCeramica: { src: C + 'decoracion/florero-ceramica-cover?v=1789152047723', alt: 'Florero cerámica', precio: 60000 },
  alfombra: { src: C + 'blanqueria/alfombra-ovalada-cover?v=1788630183113', alt: 'Alfombra ovalada', precio: 160000 },
};
// Uso: hero = poltrona, espejoMimbre, lampara, cesta (+ burbuja con poltrona) · problema = espejoMimbre, espejo, espejoLuz
// beneficio 1 = floreroVidrio (+ miniaturas floreroVidrio, florero2, floreroCeramica) · beneficio 2 = alfombra · beneficio 3 = lampara
