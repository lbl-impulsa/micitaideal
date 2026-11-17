# Cómo arrancar en Claude Code

1. Abrí Claude Code (claude.ai/code o la pestaña Code de la app) y elegí el repositorio `lbl-impulsa/micitaideal`.
2. Escribí `/agents` para confirmar que aparecen los 8 agentes del proyecto.
3. Pegá el prompt de abajo.

## Prompt de la fase 1

```text
Leé CLAUDE.md y docs/marca.md. Vamos a construir el ecosistema Mi Cita Ideal, fase 1.
1. Revisá la estructura de carpetas y el esquema contenido/esquema-ficha.json.
2. Con el agente redactor-fichas, escribí las primeras 10 fichas del ebook "Primera cita perfecta" (primer-encuentro), una por archivo JSON.
3. Pasalas por el agente editor-calidad y mostrame su reporte.
4. Con el agente maquetador-ebooks, generá un PDF de muestra con portada, índice y 3 fichas, con la paleta de la marca.
5. Frená ahí y mostrame todo antes de seguir con las 40 fichas restantes.
```

## Prompts para las fases siguientes

**Mini guía gratis**
```text
Con investigador-citas y redactor-fichas, armá las 10 fichas de guia-gratis eligiendo las ideas más fáciles y vistosas. Después maquetador-ebooks genera el PDF y copywriter-ventas escribe la secuencia de bienvenida de 7 días.
```

**Lanzamiento del primer ebook**
```text
Completá las 50 fichas de primer-encuentro (redactor-fichas + editor-calidad). Cuando yo las apruebe, generá los PDF finales, la landing y los emails post-compra. Con automatizador, documentá el flujo Hotmart → email → WhatsApp.
```

**Contenido de Instagram**
```text
Con community-manager, armá el calendario de Instagram de las próximas 4 semanas usando solo fichas aprobadas, en el CSV que pide su instrucción.
```

**App**
```text
Con dev-app, armá la primera versión de la app Armá tu cita ideal: formulario, recomendación desde las fichas aprobadas y resultado con 3 opciones. Sin pagos todavía. Mostrame cómo probarla.
```
