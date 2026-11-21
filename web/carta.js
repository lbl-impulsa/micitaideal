/* Mi Cita Ideal — Escribí tu carta. Todo pasa en el navegador: el borrador queda solo en este dispositivo. */
(function () {
  'use strict';
  var $ = function (s) { return document.querySelector(s); };
  var CLAVE = 'mci-carta-borrador';
  var MAX = 1500;

  /* Textos de la línea "Cartas con sello". Los revisa el agente escritor-cartas. */
  var TIPOS = [
    { id: 'primera', nombre: 'Primera carta',
      preguntas: ['¿Qué fue lo primero que te llamó la atención?', '¿Qué momento juntos repetirías mañana?', '¿Qué te gustaría que sepa y todavía no le dijiste?'],
      arranques: ['Nunca te escribí una carta, así que acá va la primera.', 'Desde que te conocí me pasa algo lindo:', 'Me acuerdo perfecto de cuando'] },
    { id: 'aniversario', nombre: 'Aniversario',
      preguntas: ['¿Cómo eran al principio y cómo son hoy?', '¿Qué cosa chiquita de todos los días te hace feliz?', '¿Qué plan te gustaría que hagan este año?'],
      arranques: ['Otro año juntos y todavía me sorprendés.', 'Si vuelvo al día en que empezamos,', 'Este año aprendí que con vos'] },
    { id: 'perdon', nombre: 'Pedir perdón',
      preguntas: ['¿Qué hiciste, dicho sin vueltas ni excusas?', '¿Cómo creés que se sintió?', '¿Qué vas a hacer distinto de ahora en más?'],
      arranques: ['Te debo una disculpa y quiero dártela bien.', 'Estuve pensando en lo que pasó y entiendo que', 'No espero que lo olvides ya, solo quiero que sepas que'],
      nota: 'Una carta acompaña, pero no reemplaza una charla. Pedí perdón sin condiciones y respetá si la otra persona necesita tiempo.' },
    { id: 'distancia', nombre: 'A la distancia',
      preguntas: ['¿Qué extrañás de los días juntos?', '¿Qué te hizo acordar a esa persona esta semana?', '¿Qué van a hacer cuando se vuelvan a ver?'],
      arranques: ['Hoy te extrañé más de lo normal.', 'Cuento los días para', 'Aunque estemos lejos, cada vez que'] },
    { id: 'gracias', nombre: 'Gracias',
      preguntas: ['¿Qué hizo por vos que no te olvidás?', '¿En qué momento sentiste que te bancó?', '¿Qué cambió en vos desde que está en tu vida?'],
      arranques: ['Te quería dar las gracias por algo que capaz ni registrás:', 'No te lo digo tan seguido, pero', 'Gracias por estar cuando'] },
    { id: 'propuesta', nombre: 'Sí, acepto',
      preguntas: ['¿Cuándo supiste que querías dar este paso?', '¿Cómo te imaginás lo que viene juntos?', '¿Qué promesa le querés hacer?'],
      arranques: ['Tengo una pregunta y quería escribírtela primero.', 'Desde hace un tiempo me imagino', 'Quiero seguir eligiéndote todos los días porque'],
      nota: 'La carta prepara el momento; la pregunta, mejor en persona. Y si es en público, solo si sabés que le gusta.' },
    { id: 'porque-si', nombre: 'Porque sí',
      preguntas: ['¿Qué te hizo sonreír hoy pensando en esa persona?', '¿Qué tres cosas te encantan de cómo es?', '¿Qué plan le propondrías para esta semana?'],
      arranques: ['No hay fecha especial, solo ganas de decirte que', 'Hoy me acordé de vos cuando', 'Tres cosas que me encantan de vos:'] }
  ];
  var DESPEDIDAS = ['Con amor,', 'Te quiero,', 'Siempre,', 'Tuyo,', 'Tuya,', 'Con todo mi cariño,'];

  var form = $('#carta-form');
  if (!form) return;
  var campos = { para: $('#carta-para'), lugar: $('#carta-lugar'), cuerpo: $('#carta-cuerpo'), despedida: $('#carta-despedida'), firma: $('#carta-firma') };
  var tipo = TIPOS[0].id;

  function hoy() {
    var m = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    var d = new Date();
    return d.getDate() + ' de ' + m[d.getMonth()] + ' de ' + d.getFullYear();
  }
  function aviso(txt) {
    var el = $('#aviso');
    if (!el) return;
    el.textContent = txt;
    el.classList.add('ver');
    clearTimeout(aviso.t);
    aviso.t = setTimeout(function () { el.classList.remove('ver'); }, 2800);
  }
  function chip(texto, datos, presionado) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = texto;
    for (var k in datos) b.dataset[k] = datos[k];
    if (presionado !== undefined) b.setAttribute('aria-pressed', presionado ? 'true' : 'false');
    return b;
  }

  /* ---------- Guardado local ---------- */
  function guardar() {
    var datos = { tipo: tipo };
    for (var k in campos) datos[k] = campos[k].value;
    try { window.localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (e) { /* sin almacenamiento: queda en pantalla */ }
  }
  function cargar() {
    var datos = null;
    try { datos = JSON.parse(window.localStorage.getItem(CLAVE) || 'null'); } catch (e) { datos = null; }
    if (datos && typeof datos === 'object') {
      for (var k in campos) if (typeof datos[k] === 'string') campos[k].value = datos[k].slice(0, campos[k].maxLength > 0 ? campos[k].maxLength : MAX);
      if (TIPOS.some(function (t) { return t.id === datos.tipo; })) tipo = datos.tipo;
    }
    if (!campos.lugar.value) campos.lugar.value = hoy();
  }

  /* ---------- Ayudas por tipo ---------- */
  function pintarTipos() {
    var cont = $('#carta-tipos');
    cont.innerHTML = '';
    TIPOS.forEach(function (t) { cont.appendChild(chip(t.nombre, { tipo: t.id }, t.id === tipo)); });
  }
  function pintarAyuda() {
    var t = TIPOS.filter(function (x) { return x.id === tipo; })[0];
    var ul = $('#carta-preguntas');
    ul.innerHTML = '';
    t.preguntas.forEach(function (p) { var li = document.createElement('li'); li.textContent = p; ul.appendChild(li); });
    var arr = $('#carta-arranques');
    arr.innerHTML = '';
    t.arranques.forEach(function (a) { arr.appendChild(chip(a, { arranque: a })); });
    var nota = $('#carta-nota');
    nota.hidden = !t.nota;
    nota.textContent = t.nota || '';
  }
  function insertar(txt) {
    var ta = campos.cuerpo;
    var ini = ta.selectionStart, fin = ta.selectionEnd;
    if (document.activeElement !== ta) { ini = fin = ta.value.length; }
    var antes = ta.value.slice(0, ini), despues = ta.value.slice(fin);
    var sep = antes && !/\s$/.test(antes) ? (/[.:!?]$/.test(antes) ? '\n\n' : ' ') : '';
    var nuevo = (antes + sep + txt + ' ' + despues).slice(0, MAX);
    ta.value = nuevo;
    var pos = Math.min((antes + sep + txt + ' ').length, nuevo.length);
    ta.focus();
    ta.setSelectionRange(pos, pos);
    actualizar();
  }

  /* ---------- Vista previa ---------- */
  function actualizar(sinGuardar) {
    var c = campos;
    $('#vista-lugar').textContent = c.lugar.value.trim();
    $('#vista-para').textContent = (c.para.value.trim() || 'Para vos') + ':';
    var cuerpo = $('#vista-cuerpo');
    cuerpo.innerHTML = '';
    var texto = c.cuerpo.value.trim();
    var p = document.createElement('p');
    if (texto) { p.textContent = texto; } else { p.className = 'vacio'; p.textContent = 'Acá va a aparecer tu carta, con tu letra y tus palabras.'; }
    cuerpo.appendChild(p);
    $('#vista-despedida').textContent = c.despedida.value.trim();
    $('#vista-firma').textContent = c.firma.value.trim() || 'Tu nombre';
    $('#carta-contador').textContent = c.cuerpo.value.length + ' de ' + MAX;
    $('#carta-wa').href = 'https://wa.me/?text=' + encodeURIComponent(textoPlano());
    if (sinGuardar !== true) guardar();
  }
  function textoPlano() {
    var c = campos, partes = [];
    if (c.lugar.value.trim()) partes.push(c.lugar.value.trim());
    partes.push((c.para.value.trim() || 'Para vos') + ':');
    partes.push(c.cuerpo.value.trim());
    var cierre = [c.despedida.value.trim(), c.firma.value.trim()].filter(Boolean).join('\n');
    if (cierre) partes.push(cierre);
    partes.push('Carta con sello · Mi Cita Ideal');
    return partes.filter(Boolean).join('\n\n');
  }
  function hayTexto() {
    if (campos.cuerpo.value.trim()) return true;
    aviso('Primero escribí tu carta.');
    campos.cuerpo.focus();
    return false;
  }

  /* ---------- Imagen ---------- */
  var sello = new Image();
  sello.src = 'marca/sello-firma.svg';
  function lineas(ctx, txt, ancho) {
    var out = [];
    txt.split('\n').forEach(function (par) {
      if (!par.trim()) { out.push(''); return; }
      var palabras = par.split(/\s+/), linea = '';
      palabras.forEach(function (w) {
        var prueba = linea ? linea + ' ' + w : w;
        if (ctx.measureText(prueba).width > ancho && linea) { out.push(linea); linea = w; }
        else linea = prueba;
        while (ctx.measureText(linea).width > ancho && linea.length > 1) {
          var corte = linea.length - 1;
          while (corte > 1 && ctx.measureText(linea.slice(0, corte)).width > ancho) corte--;
          out.push(linea.slice(0, corte)); linea = linea.slice(corte);
        }
      });
      out.push(linea);
    });
    return out;
  }
  function dibujar() {
    var W = 1080, H = 1350, M = 96;
    var cv = document.createElement('canvas');
    cv.width = W; cv.height = H;
    var ctx = cv.getContext('2d');
    var serif = '"Playfair Display", Georgia, serif', sans = '"DM Sans", system-ui, sans-serif';
    ctx.fillStyle = '#F6D6D3'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#FFFDF9'; ctx.fillRect(40, 40, W - 80, H - 80);
    var c = campos, cuerpo = c.cuerpo.value.trim();
    var tam = 38, ls, txt, alto, topeTexto = H - 120 - 260;
    var y0 = 230;
    for (; tam >= 22; tam -= 2) {
      ctx.font = 'italic 400 ' + tam + 'px ' + serif;
      ls = Math.round(tam * 1.6);
      txt = lineas(ctx, cuerpo, W - 2 * M);
      alto = txt.length * ls;
      if (y0 + alto <= topeTexto) break;
    }
    // renglones
    ctx.strokeStyle = '#F1E2D9'; ctx.lineWidth = 2;
    for (var yy = y0 + 12 - ls * 2; yy < H - 80; yy += ls) if (yy > 150) { ctx.beginPath(); ctx.moveTo(40, yy); ctx.lineTo(W - 40, yy); ctx.stroke(); }
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#6E5A61'; ctx.font = '500 26px ' + sans; ctx.textAlign = 'right';
    ctx.fillText(c.lugar.value.trim(), W - M, 128);
    ctx.textAlign = 'left'; ctx.fillStyle = '#7A1F3D'; ctx.font = '700 44px ' + serif;
    ctx.fillText((c.para.value.trim() || 'Para vos') + ':', M, 196);
    ctx.fillStyle = '#2A2326'; ctx.font = 'italic 400 ' + tam + 'px ' + serif;
    var y = y0;
    txt.forEach(function (l) { y += ls; if (y < topeTexto + ls) ctx.fillText(l, M, y); });
    // firma y sello
    var yf = Math.max(y + ls * 1.4, H - 330);
    ctx.fillStyle = '#7A1F3D'; ctx.font = 'italic 400 36px ' + serif;
    ctx.fillText(c.despedida.value.trim(), M, yf);
    ctx.fillStyle = '#2A2326'; ctx.font = 'italic 500 50px ' + serif;
    ctx.fillText(c.firma.value.trim(), M, yf + 64);
    if (sello.complete && sello.naturalWidth) {
      ctx.save(); ctx.globalAlpha = .92; ctx.translate(W - M - 120, H - 250); ctx.rotate(6 * Math.PI / 180);
      ctx.drawImage(sello, -120, -120, 240, 240); ctx.restore();
    }
    ctx.fillStyle = '#B3A0A6'; ctx.font = '500 20px ' + sans; ctx.textAlign = 'left';
    ctx.fillText('Escrita en micitaideal.vercel.app', M, H - 76);
    return cv;
  }
  function guardarImagen() {
    if (!hayTexto()) return;
    var listo = document.fonts && document.fonts.load ? Promise.all([
      document.fonts.load('italic 400 38px "Playfair Display"'), document.fonts.load('italic 500 50px "Playfair Display"'),
      document.fonts.load('700 44px "Playfair Display"'), document.fonts.load('500 26px "DM Sans"')
    ]).catch(function () {}) : Promise.resolve();
    listo.then(function () {
      dibujar().toBlob(function (blob) {
        if (!blob) { aviso('No se pudo armar la imagen.'); return; }
        var nombre = 'carta-mi-cita-ideal.png';
        var tactil = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
        if (tactil && navigator.canShare && window.File) {
          var f = new File([blob], nombre, { type: 'image/png' });
          if (navigator.canShare({ files: [f] })) {
            navigator.share({ files: [f] }).catch(function () {});
            return;
          }
        }
        var url = URL.createObjectURL(blob), a = document.createElement('a');
        a.href = url; a.download = nombre;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
        aviso('Listo: la carta se descargó como imagen.');
      }, 'image/png');
    });
  }

  /* ---------- Eventos ---------- */
  $('#carta-tipos').addEventListener('click', function (e) {
    var b = e.target.closest('[data-tipo]');
    if (!b) return;
    tipo = b.dataset.tipo;
    pintarTipos(); pintarAyuda(); guardar();
  });
  $('#carta-arranques').addEventListener('click', function (e) {
    var b = e.target.closest('[data-arranque]');
    if (b) insertar(b.dataset.arranque);
  });
  // Que tocar una frase no le saque el foco al texto (así se inserta donde estaba el cursor).
  $('#carta-arranques').addEventListener('mousedown', function (e) { if (e.target.closest('[data-arranque]')) e.preventDefault(); });
  var desp = $('#carta-despedidas');
  DESPEDIDAS.forEach(function (d) { desp.appendChild(chip(d, { desp: d })); });
  desp.addEventListener('click', function (e) {
    var b = e.target.closest('[data-desp]');
    if (b) { campos.despedida.value = b.dataset.desp; actualizar(); }
  });
  form.addEventListener('input', actualizar);
  form.addEventListener('submit', function (e) { e.preventDefault(); });

  $('#carta-copiar').addEventListener('click', function () {
    if (!hayTexto()) return;
    var txt = textoPlano();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(function () { aviso('Carta copiada.'); }, function () { aviso('No se pudo copiar. Seleccioná el texto a mano.'); });
    } else { aviso('Tu navegador no deja copiar. Seleccioná el texto a mano.'); }
  });
  $('#carta-wa').addEventListener('click', function (e) { if (!hayTexto()) e.preventDefault(); });
  $('#carta-imagen').addEventListener('click', guardarImagen);
  $('#carta-imprimir').addEventListener('click', function () {
    if (!hayTexto()) return;
    document.body.classList.add('imprimir-carta');
    window.print();
  });
  window.addEventListener('afterprint', function () { document.body.classList.remove('imprimir-carta'); });

  var confirmar = $('#carta-confirmar');
  $('#carta-borrar').addEventListener('click', function () { confirmar.hidden = false; $('#carta-borrar-no').focus(); });
  $('#carta-borrar-no').addEventListener('click', function () { confirmar.hidden = true; });
  $('#carta-borrar-si').addEventListener('click', function () {
    campos.para.value = ''; campos.cuerpo.value = ''; campos.firma.value = '';
    campos.despedida.value = 'Con amor,'; campos.lugar.value = hoy();
    try { window.localStorage.removeItem(CLAVE); } catch (e) { /* nada */ }
    confirmar.hidden = true;
    actualizar();
    aviso('Carta borrada. Empezá cuando quieras.');
  });

  cargar(); pintarTipos(); pintarAyuda(); actualizar(true);
})();
