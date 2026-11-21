# Fundo Salinas | Sitio oficial

Local campestre para eventos en La Legua, Piura. Sitio estático multipágina (HTML, CSS y JS puro), listo para Vercel.

Diseño y desarrollo: **Dandy Digital** · https://portfoliodandy.com/pt

## Páginas

| Página | Archivo |
| --- | --- |
| Inicio | `index.html` |
| Salón de eventos | `salon.html` |
| Piscinas | `piscinas.html` |
| Cancha sintética | `cancha.html` |
| Aire libre | `aire-libre.html` |
| Gastronomía | `gastronomia.html` |
| Eventos | `eventos.html` |
| Galería | `galeria.html` |
| Contacto (cotizar y agendar visita) | `contacto.html` |

## Estructura

```
src/partials/   head, header y footer compartidos
src/pages/      contenido de cada página
public/         sitio final que publica Vercel (no editar los .html a mano)
build.py        une partials + pages y escribe public/*.html
```

## Editar y publicar

1. Edita el contenido en `src/pages/` o `src/partials/`.
2. Ejecuta `python build.py` para regenerar `public/`.
3. Haz commit y push: Vercel publica `public/` automáticamente (ver `vercel.json`).

Los estilos están en `public/assets/css/styles.css` y la lógica en `public/assets/js/main.js` (carrusel, galería, formularios a WhatsApp).

## Datos que se cambian seguido

- **WhatsApp de cotizaciones:** `51996404372` en `main.js` (constante `WHATSAPP`) y en los enlaces `wa.me` de `src/partials/footer.html` y `src/pages/contacto.html`.
- **Fotos de la galería:** lista `PHOTOS` en `main.js`. Las imágenes van en `public/assets/img/` (grande) y `public/assets/img/sm/` (miniatura, 720 px).
- **Mapa:** `iframe` de `src/pages/contacto.html`.
- **Videos:** en `public/assets/video/` (MP4 H.264 sin audio, comprimidos para web) con sus pósters en `public/assets/video/poster/`.
  - `hero-reel.mp4` (horizontal) y `hero-reel-v.mp4` (vertical, para celular): portada del inicio. Los textos de cada escena están en `data-chapters-*` del `<video id="heroVideo">` en `src/pages/index.html`.
  - `escenario.mp4`: fondo de la sección de sonido y DJ.
  - `reel-*.mp4`: videos verticales del inicio, la galería y las páginas de cada espacio. Sus textos para el visor están en `VIDEOS` de `main.js`.
  - Los videos se cargan solo cuando aparecen en pantalla y no se reproducen solos si el visitante tiene activado "reducir movimiento" o el ahorro de datos.

## Vista local

```
python -m http.server 5174 --directory public
```

Luego abre http://localhost:5174
