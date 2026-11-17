# Mi Cita Ideal — Página web (versión 1)

Página estática: no necesita servidor, base de datos ni build. Se sube tal cual a Vercel.

## Qué trae

| Archivo | Para qué |
| --- | --- |
| `index.html` | La página completa (diseño y textos) |
| `motor.js` | Las 38 citas, la tragamonedas, las frases y el motor que elige hasta 10 citas |
| `app.js` | La interacción: generador, entradas, pasaporte, tragamonedas, frases |
| `404.html` | Página de error ("Esta página te dejó plantado") |
| `favicon.svg` | Ícono de la pestaña |
| `og.png` | Imagen que aparece al compartir el link en WhatsApp o redes |
| `vercel.json` | URLs limpias y encabezados de seguridad |

## Publicación

- Está publicada en https://micitaideal.vercel.app (proyecto `micitaideal` en Vercel).
- El proyecto de Vercel se conecta a este repositorio con **Root Directory = web**, Framework Preset **Other** y sin comando de build. Cada cambio que llega a la rama `main` se publica solo.
- Dominio propio: en Vercel, **Project → Settings → Domains**, agregá `micitaideal.com` y cargá en tu proveedor de dominio los registros DNS que te indique. Después actualizá la línea `og:image` de `index.html` con el dominio nuevo.

## Qué NO hace, a propósito

No pide datos personales, no usa cookies ni analytics y no guarda nada en servidores. El pasaporte de sellos usa el almacenamiento local del navegador y no sale del dispositivo.

Si más adelante se suman formularios, emails, analytics, cuentas o pagos, antes hay que agregar política de privacidad y términos de uso.

## Cómo cambiar contenido

- **Citas:** `motor.js`, lista `CITAS`. Campos: `e` etapas, `p` presupuesto 1 a 3, `d` duración 1 a 4, `l` lugar, `en` energía 1 a 3, `i` gustos, `r` resumen, `prep` pasos, `inv` frase para invitar, `q` preguntas, `t` toque especial, `b` plan B, `s` mensaje del día siguiente.
- **Tragamonedas y frases:** `motor.js`, objetos `TRAGAMONEDAS` y `FRASES`.
- **Textos y diseño:** `index.html`.
