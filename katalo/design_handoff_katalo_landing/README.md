# Handoff: landing de Katalo (ruta `/`)

## Resumen
Katalo es la plataforma multi-tienda de catálogos online para comercios de Paraguay. La landing tiene un solo objetivo: que un comercio que hoy vende mandando fotos por WhatsApp cree su catálogo gratis (`/registro`).

Katalo es un **catálogo con consulta por WhatsApp**: no tiene carrito, pagos, pedidos ni stock. Ningún texto puede prometer esas funciones.

## Sobre los archivos de diseño
Los archivos de `design/` son **referencias de diseño hechas en HTML**: muestran cómo se ve y cómo se comporta la landing, pero no son código para copiar a producción. La tarea es **recrearlos en el proyecto real** (Next.js App Router, copia del proyecto de UG Hogar), con sus patrones y su sistema de estilos (Tailwind si ya está). La página va en `/` sin afectar las rutas de tiendas.

Para ver las referencias, abrí los `.dc.html` en un navegador; `support.js` tiene que estar en la misma carpeta.
- `design/Landing Plataforma.dc.html`: la landing completa (escritorio y celular según el ancho de la ventana).
- `design/Landing Vista Mobile.dc.html`: la misma landing en celulares de 390 y 360 px, más la página completa.
- `design/Katalo Manual de Marca.dc.html`: manual de marca (logo, color, tipografía, ñandutí, componentes y voz).

En los `.dc.html`, el marcado está entre `<x-dc>` y la lógica en `<script data-dc-script>`. Los `{{ valor }}` se calculan en `renderVals()`.

## Fidelidad
**Alta fidelidad.** Colores, tipografía, espaciado, textos e interacciones son definitivos y hay que recrearlos con precisión. Las excepciones son los marcadores con borde punteado (materiales pendientes, ver abajo).

## Estructura de carpetas propuesta
```
app/page.tsx                        // estática, sin consultas a la DB
components/landing/
  Encabezado.tsx  Hero.tsx  Tiendas.tsx  Problema.tsx  ComoFunciona.tsx
  Beneficios.tsx  Casos.tsx  Planes.tsx (client)  Preguntas.tsx (client)
  Cierre.tsx  Footer.tsx  WhatsAppFlotante.tsx
  ui/ Boton.tsx  MarcoCelular.tsx  BurbujaWhatsApp.tsx (client)  Nanduti.tsx  Hilo.tsx  LogoKatalo.tsx
config/  plataforma.ts  planes.ts  casos.ts  preguntas.ts  imagenes-landing.ts   ← incluidos en este paquete
public/brand/                       ← logos y ñandutí en SVG, incluidos
```
Solo necesitan JavaScript en el cliente: el menú de celular, el encabezado (borde al hacer scroll), el selector de planes, el acordeón y la burbuja del hero.

## Tokens de diseño
Los tokens están en `tokens/katalo-tokens.css` (variables CSS), `tokens/tailwind.katalo.js` (tema de Tailwind) y `tokens/katalo-tokens.json`. Ningún color puede quedar suelto en los componentes.

**Color**
- tinta `#13203B`: títulos, texto principal y fondo del footer.
- texto-secundario `#556079`: subtítulos y descripciones.
- fondo `#FFFFFF`.
- fondo-alterno `#F3F5F9`: secciones Cómo funciona, Casos y Preguntas.
- linea `#DCE1EA`: bordes y divisores.
- primario `#1F4FD8`: botones principales, links y plan destacado. Es el color de marca.
- primario-hover `#183FB0`.
- Hilos del ñandutí:
  - nanduti-fucsia `#E0457B`
  - nanduti-amarillo `#F5B82E`: con texto encima, siempre tinta.
  - nanduti-verde `#2E9E6A`
- whatsapp `#25D366`: solo en botones que abren WhatsApp, con texto tinta.
- Tintes de escenario (fondos detrás de imágenes):
  - tinte-amarillo `#FEF3D9`
  - tinte-verde `#E2F2EA`
  - tinte-fucsia `#FCE6EE`
- texto-sobre-tinta `#C9D0DD`: links y textos secundarios del footer.

**Tipografía** (cargar con next/font/google: Bricolage Grotesque 600/700 y Figtree 400/500/600, con fuentes de respaldo del sistema)
- H1 del hero: Bricolage 700, `clamp(40px,5.4vw,64px)`, interlineado 1.05, letter-spacing -0.025em.
- H2 de sección: Bricolage 700, `clamp(30px,3.6vw,40px)`, interlineado 1.1, letter-spacing -0.02em.
- H3 de bloque: Bricolage 600, `clamp(20px,2vw,24px)`, interlineado 1.2–1.25.
- Cuerpo: Figtree 400, `clamp(16px,1.5vw,18px)`, interlineado 1.6, máximo unos 65 caracteres por línea.
- Chico: Figtree 400, 14 px. Botón: Figtree 600, 16 px.
- Nunca mayúsculas sostenidas.

**Forma y espacio**
- Radios:
  - botón 12
  - bloque de plan 12
  - marco de celular 28 (pantalla interna 20)
  - fotos 8
  - escenario de beneficio 24
  - chips de categoría 999
- Una sola sombra en todo el sistema, la del marco de celular: `0 32px 64px -24px rgba(19,32,59,.35), 0 4px 12px rgba(19,32,59,.08)`. El botón flotante de WhatsApp tiene una sombra suave propia.
- Espaciado en múltiplos de 8.
- Secciones: padding vertical `clamp(72px,10vw,120px)` y horizontal 24 px.
- El contenido llega hasta 1200 px de ancho.
- Puntos de quiebre: celular <768, tablet 768–1023, escritorio ≥1024. El menú pasa a hamburguesa por debajo de 900.

**Hilos de color** (el eco del ñandutí en la interfaz)
- Hilo de título: barra de 48×4 px con radio 2, 24 px arriba del H2 de cada beneficio. Colores: beneficio 1 amarillo, beneficio 2 verde, beneficio 3 fucsia.
- Hilo de bloque: `border-top: 4px solid` en los pasos (01 fucsia, 02 amarillo, 03 verde), en la columna "Con tu catálogo" (primario) y en cada caso real (según `acento`).
- Franja de cierre: 6 px de alto encima del footer, con segmentos fucsia 1 : amarillo 1 : verde 1 : primario 2.

## Secciones (en este orden)
1. **Encabezado:** sticky, 72 px de alto, fondo blanco.
   - El borde inferior pasa de transparente a `linea` cuando `scrollY > 8`.
   - Contenido: logo (sello de 30 px y "Katalo" en Bricolage 700 20 px), links Cómo funciona, Planes y Preguntas (Figtree 500 16), "Iniciar sesión" y el botón "Crear mi catálogo".
   - Por debajo de 900 px: logo, botón compacto (40 px de alto, padding 12, 14 px) y hamburguesa de 44 px que despliega los links con divisores. Padding horizontal 16 px en celular.
2. **Hero:** grid de 2 columnas (`auto-fit, minmax(min(100%,440px),1fr)`), apilado en celular.
   - H1: "Tu catálogo en un link. Tus ventas por WhatsApp." "un link" lleva subrayado fucsia de 5 px, con offset 10 y `nowrap`.
   - Subtítulo y botón "Crear mi catálogo gratis" (ancho completo en celular), con la nota "Gratis hasta 10 productos. Sin tarjeta."
   - A la derecha, sobre el ñandutí completo (640 px; 460 en celular):
     - Marco de celular de 280×580 que muestra el catálogo de UG Hogar: encabezado de tienda, chips de categorías y grilla 2×2 de productos con botón "Consultar".
     - Burbuja "Nueva consulta por WhatsApp" con miniatura y el texto: "Hola, me interesa la Poltrona de Gs. 600.000. ¿Está disponible?". Aparece una sola vez a los 900 ms con fundido y desplazamiento de 16 px a 0, en 400 ms ease-out. Con `prefers-reduced-motion` aparece sin animación.
3. **Tiendas:** franja con borde arriba y abajo. "Ya venden con Katalo" y los logos de las tiendas enlazados a sus catálogos (pestaña nueva).
4. **Problema:** H2 "Dejá de mandar fotos una por una." y su texto. Dos columnas:
   - "Hoy": chat con burbujas grises y fotos sueltas de 64 px.
   - "Con tu catálogo": hilo primario, una burbuja tinta con el link y un texto de apoyo.
5. **Cómo funciona** (`#como-funciona`, fondo alterno): H2 "Así de simple."
   - Lista ordenada de 3 pasos con números 01/02/03 en Bricolage 56 px primario y hilos de color arriba.
   - Botón "Empezar ahora".
6. **Beneficios:** 3 bloques texto + imagen. En escritorio, el bloque 2 invierte el orden; en celular el texto va siempre arriba.
   - Cada bloque tiene un hilo de título y un botón secundario: "Armar mi vidriera", "Recibir consultas así", "Probar con mis fotos".
   - La imagen va sobre un escenario con tinte (radio 24, padding `clamp(32px,5vw,56px)`).
   - Bloque 1: celular con categoría, galería y miniaturas, más "Tu link: katalo.com.py/tu-tienda".
   - Bloque 2: celular con un chat de WhatsApp que muestra la tarjeta del producto consultado.
   - Bloque 3: foto original, el marcador de "foto en ambiente con IA" y una descripción generada.
7. **Casos reales** (fondo alterno): H2 "Comercios que ya venden así." Dos columnas.
   - Cada caso: hilo arriba, grilla 3×2 de fotos, logo de 48 px, nombre, rubro, testimonio (solo si existe) y "Ver su catálogo" (pestaña nueva).
8. **Planes** (`#planes`): H2 "Empezá gratis. Crecé cuando lo necesites." y la nota "Sin comisiones por venta. Cancelás cuando quieras."
   - Selector Mensual/Anual (`role=radiogroup`, se maneja con flechas, roving tabindex). La opción activa va con fondo tinta y texto blanco. Al lado, "2 meses gratis" en verde.
   - 3 bloques de plan:
     - Bordes: Emprendedor lleva `2px primario` e insignia "Más elegido" (amarillo con texto tinta); los otros dos, `1px linea`.
     - Precio grande con "/mes". En Anual se muestra el equivalente mensual (anual/12) y, chico debajo, "Gs. X por año".
     - Botón del plan destacado en primario; los demás, secundarios.
     - Lista de características con check verde.
     - Todos los botones de plan llevan a `/registro`.
   - Al pie, la nota sobre los créditos de bienvenida.
9. **Preguntas** (`#preguntas`, fondo alterno):
   - Izquierda: H2, "¿Te quedó alguna duda?" y el botón verde WhatsApp "Escribinos por WhatsApp".
   - Derecha: acordeón de 7 preguntas, una abierta a la vez (la primera abierta al cargar).
     - Cada pregunta es un `button` con `aria-expanded` y `aria-controls`.
     - El ícono "+" rota 45° al abrir y su color va alternando fucsia, primario y verde.
     - La altura se anima con `grid-template-rows` 0fr→1fr en 220 ms.
10. **Cierre:**
    - H2 "Tu catálogo puede estar listo hoy." (`clamp(36px,4.6vw,56px)`), botón y nota.
    - Detrás, el ñandutí de cierre (600 px; 440 en celular) a 40% de opacidad. El texto lleva un halo blanco: `radial-gradient(closest-side,#FFF 62%,transparent)`.
11. **Footer** (tinta), con la franja de 4 colores encima:
    - Logo con sello invertido y descripción.
    - Columnas Producto, Legales y Contacto.
    - © año, "Hecho en Paraguay".

**WhatsApp flotante:** fijo abajo a la derecha (24 px; 16 en celular), de 56 px, verde con ícono tinta. Abre `wa.me/<número>?text=Hola, quiero saber más de Katalo`.

Todos los textos exactos están en `design/Landing Plataforma.dc.html`, `config/preguntas.ts` y `config/planes.ts`.

## Medición
Usar `dataLayer.push` o la herramienta de analítica que se elija:
- `clic_crear_catalogo {seccion}`: valores encabezado, hero, como_funciona, beneficio_link, beneficio_whatsapp, beneficio_ia, cierre.
- `clic_plan {plan, periodo}`
- `cambio_periodo {periodo}`
- `clic_whatsapp {origen: flotante|preguntas}`
- `clic_caso {tienda}`

## SEO
- Título: "Katalo · Tu catálogo online para vender por WhatsApp".
- Descripción: "Creá gratis el catálogo de tu negocio, compartilo en un link y recibí consultas por WhatsApp. Hecho para comercios de Paraguay."
- Idioma `lang="es-PY"`.
- Imagen Open Graph de 1200×630 (logo, título y celular).
- Favicon: `public/brand/favicon.svg`.
- Datos estructurados JSON-LD: `Organization` y `FAQPage` (desde `config/preguntas.ts`).
- Un solo H1 y un H2 por sección.

## Accesibilidad
- Foco visible: `outline 2px primario, offset 3px`.
- Contraste AA.
- Texto alternativo en todas las fotos de productos.
- El ñandutí y los hilos van con `aria-hidden`.
- Respetar `prefers-reduced-motion`.
- Sin desplazamiento horizontal en 360, 768 y 1440 px.

## Recursos
- `public/brand/` (SVG): katalo-sello, katalo-sello-invertido, katalo-sello-tinta, katalo-rosa-sola, katalo-horizontal (texto ya en contornos), katalo-horizontal-blanco, favicon, motivo/nanduti-completo, motivo/nanduti-cierre.
- Fotos de productos: Cloudinary de UG Hogar, con permiso del cliente (ver `config/imagenes-landing.ts`). Configurar `images.remotePatterns` para `res.cloudinary.com` o descargarlas a WebP.
- Íconos: Lucide con trazo 1.5 (message-circle, menu, x, plus, check).

## Pendientes (no inventar: dejar marcadores)
- Número de WhatsApp de atención (`config/plataforma.ts`).
- Ipora Termos: link, logo y 4 a 6 fotos.
- Testimonios escritos y aprobados por los dueños, con nombre y foto. Mientras no estén, no se muestra cita ni marcador de cita en producción.
- Foto en ambiente con IA para el beneficio 3.
- Confirmar precios, dominio y redes.
- Rutas reservadas: confirmar que `/`, `/login`, `/registro`, `/terminos` y `/privacidad` estén en la lista de nombres reservados de tiendas.

## Criterios de aceptación
- 11 secciones en orden, con estos textos.
- Tokens sin colores sueltos.
- Nombre, WhatsApp, planes y casos solo desde `config/`.
- Registro → `/registro`; login → `/login`.
- El selector cambia los precios.
- Única animación automática: la burbuja.
- Navegable con teclado.
- Lighthouse móvil ≥ 90 en rendimiento, accesibilidad y SEO.
- La vista previa al compartir por WhatsApp es correcta.
- Los eventos se disparan.
