# Mi Cita Ideal — Ecosistema de ebooks y app

Marca: **Mi Cita Ideal** (Instagram @micitaideal). La opera **LBL Impulsa** (marketing, publicidad y automatizaciones).
Eslogan: "Del primer café al sí, acepto".
Plan completo de marca: https://claude.ai/artifact/67qKvLCEDrFfXmcHkJENEu (resumen operativo en `docs/marca.md`).

## Qué construimos

1. **4 ebooks interactivos** con 300 fichas de citas en total (ver `contenido/catalogo-ebooks.json`).
2. **Mini guía gratis** "10 citas para este finde" para captar contactos desde Instagram.
3. **Web y landings** de venta (`web/`). La versión 1 ya está publicada en https://micitaideal.vercel.app (proyecto `micitaideal` en Vercel).
4. **App "Armá tu cita ideal"** (`app/`): la persona carga sus gustos y los de su pareja y recibe hasta 10 opciones de cita.
5. **Automatizaciones** de cobro, entrega y seguimiento post-compra (`automatizaciones/`).

## Regla central: una sola base de fichas

Toda idea de cita vive en `contenido/fichas/` como **un archivo JSON por ficha**, validado contra `contenido/esquema-ficha.json`.
Los ebooks, la app, los posts y los emails leen de ahí. Nunca escribas una idea directo en un PDF, en la app o en un post sin crear antes su ficha.

- Nombre del archivo = `id` + `.json`. Formato del id: `<ebook>-<nnn>`, por ejemplo `primer-encuentro-001`.
- Estados: `borrador` → `revisada` (pasó editor-calidad) → `aprobada` (la aprobó una persona de LBL Impulsa).
- Solo las fichas `aprobada` van a PDF, app o redes.
- Validar siempre con: `python3 scripts/validar_fichas.py` (necesita `pip install jsonschema`).

## Estructura de carpetas

```
.claude/agents/        agentes del proyecto
docs/marca.md          voz, paleta, productos, reglas (fuente de verdad de marca)
docs/investigacion/    informes del investigador-citas
contenido/             esquema, catálogo de ebooks y fichas
ebooks/plantillas/     HTML/CSS de maquetación
ebooks/dist/           PDFs finales (interactivo e imprimible)
marketing/             landings, emails, WhatsApp, anuncios
redes/                 calendario de Instagram, captions, guiones de reels
web/                   sitio y landings (código)
app/                   app Armá tu cita ideal (código)
automatizaciones/      flujos cobro → entrega → seguimiento
reportes/              reportes de calidad
scripts/               utilidades (validador de fichas, etc.)
```

## Agentes y orden de trabajo

1. `investigador-citas` propone ideas nuevas → `docs/investigacion/`
2. `redactor-fichas` las escribe como fichas → `contenido/fichas/`
3. `editor-calidad` revisa y corrige → `reportes/`
4. `maquetador-ebooks` arma los PDF → `ebooks/dist/`
5. `copywriter-ventas` y `community-manager` escriben desde las fichas aprobadas → `marketing/` y `redes/`
6. `dev-app` y `automatizador` construyen web, app y flujos → `web/`, `app/`, `automatizaciones/`

Al cerrar cada fase de la hoja de ruta (`docs/marca.md`), **frená y pedí aprobación** antes de seguir.

## Reglas de contenido (no negociables)

- **Seguridad** en fichas de etapa `conocer` y `primer-encuentro`: lugar público, avisar a alguien de confianza, transporte propio, no compartir la dirección de casa en la primera cita.
- **Consentimiento**: nada de presionar, insistir después de un "no" ni tácticas de manipulación o "juegos" de seducción.
- **Inclusión**: sin roles de género fijos; cada ficha sirve para cualquier tipo de pareja.
- **Propuestas públicas** solo si se sabe que a la otra persona le gusta. Siempre ofrecer la versión privada.
- **Alcohol**: nunca es el centro de la cita; siempre hay alternativa sin alcohol.
- **Sin promesas exageradas** ("enamorala en 24 horas", "nunca falla").
- **Sin marcas, locales reales ni precios exactos** en las fichas: usar presupuesto `bajo`, `medio` o `alto` (los precios cambian por país).
- **Contenido original**: no copiar ideas ni frases de otros libros, blogs o cuentas; reescribir siempre con la voz de la marca.
- **Sin repetidos**: dos fichas no pueden ser la misma cita con otro nombre.

## Voz

Cálida, cómplice, práctica, romántica sin ser cursi. Frases cortas. Tratamiento según `docs/marca.md` (hoy: voseo rioplatense, decisión pendiente).

## Convenciones técnicas

- PDF: plantillas HTML + CSS → PDF con Chromium (Playwright) y luego campos rellenables (casillas y textos) con pdf-lib o pypdf. Fuentes Playfair Display (títulos) y DM Sans (texto). Paleta en `docs/marca.md`.
- **Web v1 (`web/`)**: estática, sin build (HTML + `motor.js` con 38 citas + `app.js`). No pide datos, no usa cookies ni analytics y no guarda nada en servidores; el pasaporte usa almacenamiento local del navegador. No agregues formularios, emails, analytics, cuentas ni pagos sin pedido explícito: eso exige política de privacidad y términos antes. Más adelante, `motor.js` debe generarse desde las fichas aprobadas de `contenido/fichas/`.
- App con cuentas y pagos (más adelante): Next.js + Supabase + API de Claude + Stripe o Mercado Pago. PWA primero.
- La app recomienda **a partir de las fichas aprobadas**; la IA personaliza, no inventa citas sin base.
- Claves y secretos solo en `.env` (plantilla en `.env.example`). Nunca subirlos al repositorio.
- Datos personales: pedir permiso explícito para email y WhatsApp; política de privacidad antes de lanzar la app.
- Commits en español, chicos y descriptivos.

## Decisiones pendientes (preguntar, no inventar)

País principal y moneda · tratamiento (voseo o tuteo) · precios finales · dominio · plataforma de email · autor visible de los ebooks.
