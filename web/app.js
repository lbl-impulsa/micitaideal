/* Mi Cita Ideal — interacción de la página. Sin servidores, sin cookies, sin datos personales. */
(function () {
  'use strict';
  var M = window.MCI;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var sinMov = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- Utilidades ---------- */
  var avisoT;
  function aviso(txt) {
    var el = $('#aviso');
    el.textContent = txt;
    el.classList.add('ver');
    clearTimeout(avisoT);
    avisoT = setTimeout(function () { el.classList.remove('ver'); }, 2800);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function azar(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function whatsapp(txt) { return 'https://wa.me/?text=' + encodeURIComponent(txt); }
  function copiarRespaldo(txt) {
    var ta = document.createElement('textarea');
    ta.value = txt;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    aviso(ok ? 'Copiado. Ahora pegalo donde quieras.' : 'No se pudo copiar. Mantené apretado el texto para copiarlo.');
  }
  function copiar(txt) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(function () {
          aviso('Copiado. Ahora pegalo donde quieras.');
        }, function () { copiarRespaldo(txt); });
        return;
      }
    } catch (e) { /* sigue al respaldo */ }
    copiarRespaldo(txt);
  }
  function irA(el) {
    el.scrollIntoView({ behavior: sinMov ? 'auto' : 'smooth', block: 'start' });
  }

  /* ---------- Generador ---------- */
  var PASOS = [
    { clave: 'etapa', corto: 'Capítulo', tipo: 'uno', titulo: '¿En qué capítulo están?', ayuda: 'Así sabemos si toca romper el hielo o preparar la gran pregunta.',
      opciones: [
        { v: 'conocer', t: 'Me gusta alguien', s: 'Todavía no salimos. Pura mirada cómplice.' },
        { v: 'primera', t: 'Primera cita', s: 'Ya quedamos. Ahora hay que ver qué hacemos.' },
        { v: 'pareja', t: 'Somos pareja', s: 'Queremos salir de la rutina del delivery.' },
        { v: 'propuesta', t: 'Quiero proponer algo', s: 'Novios, convivir o el gran sí.' }
      ] },
    { clave: 'presupuesto', corto: 'Billetera', tipo: 'uno', num: true, titulo: '¿Cómo está la billetera?', ayuda: 'Sin juicio. Las mejores citas no siempre son las más caras.',
      opciones: [
        { v: 1, t: 'Modo ahorro', s: 'La billetera está en terapia.' },
        { v: 2, t: 'Equilibrado', s: 'Un gustito, sin hipotecar nada.' },
        { v: 3, t: 'Vale la pena', s: 'Hoy se tira la casa por la ventana.' }
      ] },
    { clave: 'duracion', corto: 'Tiempo', tipo: 'uno', num: true, titulo: '¿Cuánto tiempo tienen?', ayuda: 'Contá desde que se encuentran hasta que se despiden.',
      opciones: [
        { v: 1, t: '1 hora', s: 'Un café y a casa, sin presión.' },
        { v: 2, t: 'Media tarde', s: 'Lo justo para que pase algo.' },
        { v: 3, t: 'Día completo', s: 'Agenda libre y celular en silencio.' },
        { v: 4, t: 'Fin de semana', s: 'Escapada oficial.' }
      ] },
    { clave: 'lugar', corto: 'Lugar', tipo: 'uno', titulo: '¿Adentro o afuera?', ayuda: 'Si el pronóstico es dudoso, igual cada cita trae su plan B.',
      opciones: [
        { v: 'adentro', t: 'Bajo techo', s: 'Sillón, mesa o lugar cerrado.' },
        { v: 'afuera', t: 'Al aire libre', s: 'Que corra el aire.' },
        { v: 'igual', t: 'Me da igual', s: 'Que decida el clima.' }
      ] },
    { clave: 'energia', corto: 'Energía', tipo: 'uno', num: true, titulo: '¿Con cuánta energía vienen?', ayuda: 'Con honestidad: nadie los va a obligar a escalar.',
      opciones: [
        { v: 1, t: 'Modo mantita', s: 'Charlar, comer, existir.' },
        { v: 2, t: 'Intermedio', s: 'Algo de movimiento, sin transpirar mucho.' },
        { v: 3, t: 'Modo aventura', s: 'Queremos una anécdota.' }
      ] },
    { clave: 'mios', corto: 'Tus gustos', tipo: 'varios', titulo: '¿Qué te gusta a vos?', ayuda: 'Elegí todo lo que quieras.' },
    { clave: 'suyos', corto: 'Sus gustos', tipo: 'varios', titulo: '¿Y a esa persona?', ayuda: 'Si no sabés, adiviná. También es parte del encanto.' }
  ];
  var resp = { etapa: null, presupuesto: null, duracion: null, lugar: null, energia: null, mios: [], suyos: [] };
  var paso = 0;
  var maxPaso = 0;
  var avanceT = null;
  var cargaT = null;
  var ultimaLista = [];
  var tarjeta = $('#tarjeta');

  function etiquetaDe(p, v) {
    for (var k = 0; k < p.opciones.length; k++) { if (p.opciones[k].v === v) return p.opciones[k].t; }
    return '';
  }
  function valorCorto(i) {
    var p = PASOS[i];
    var v = resp[p.clave];
    if (p.tipo === 'varios') return i < maxPaso || i < paso ? (v.length ? v.length + (v.length === 1 ? ' elegido' : ' elegidos') : 'Sorpresa') : '';
    return v === null ? '' : etiquetaDe(p, v);
  }
  function pasoListo(i) {
    var p = PASOS[i];
    return p.tipo === 'varios' ? true : resp[p.clave] !== null;
  }

  function pintarPasos() {
    $('#lista-pasos').innerHTML = PASOS.map(function (p, i) {
      var cls = i === paso ? 'actual' : (i < maxPaso || (i <= maxPaso && pasoListo(i) && i !== paso) ? 'hecho' : '');
      return '<li class="' + cls + '"><button type="button" data-ir="' + i + '"' + (i > maxPaso ? ' disabled' : '') + (i === paso ? ' aria-current="step"' : '') + '>' +
        '<span class="num">' + (i + 1) + '</span><span>' + p.corto + '</span><span class="valor">' + esc(valorCorto(i)) + '</span></button></li>';
    }).join('');
  }

  function pintarPaso(enfocar) {
    var p = PASOS[paso];
    var cuerpo;
    if (p.tipo === 'uno') {
      cuerpo = '<div class="opciones" role="group" aria-labelledby="preg">' + p.opciones.map(function (o) {
        return '<button type="button" class="opcion" data-v="' + esc(o.v) + '" aria-pressed="' + (resp[p.clave] === o.v) + '">' +
          '<span class="t">' + esc(o.t) + '</span><span class="s">' + esc(o.s) + '</span></button>';
      }).join('') + '</div>';
    } else {
      cuerpo = '<div class="chips" role="group" aria-labelledby="preg">' + M.GUSTOS.map(function (g) {
        return '<button type="button" class="chip" data-g="' + g[0] + '" aria-pressed="' + (resp[p.clave].indexOf(g[0]) !== -1) + '">' + esc(g[1]) + '</button>';
      }).join('') + '</div>';
    }
    var ultimo = paso === PASOS.length - 1;
    tarjeta.innerHTML =
      '<div class="progreso" aria-hidden="true"><span style="width:' + Math.round((paso + 1) / PASOS.length * 100) + '%"></span></div>' +
      '<p class="paso-num">Paso ' + (paso + 1) + ' de ' + PASOS.length + '</p>' +
      '<h3 id="preg" tabindex="-1">' + esc(p.titulo) + '</h3>' +
      '<p class="ayuda">' + esc(p.ayuda) + '</p>' + cuerpo +
      '<div class="nav-paso">' +
      '<button type="button" class="btn-texto" data-accion="atras"' + (paso === 0 ? ' hidden' : '') + '>Atrás</button><span></span>' +
      '<button type="button" class="btn btn-vino" data-accion="siguiente" id="btn-sig">' + textoSiguiente() + '</button>' +
      '</div>';
    actualizarSiguiente();
    pintarPasos();
    if (enfocar) { var h = $('#preg'); if (h) h.focus({ preventScroll: true }); }
  }

  function textoSiguiente() {
    var p = PASOS[paso];
    if (paso === PASOS.length - 1) return resp.suyos.length ? 'Armar nuestras citas' : 'No sé, sorpréndanme';
    if (p.tipo === 'varios') return resp[p.clave].length ? 'Siguiente' : 'Saltear';
    return 'Siguiente';
  }
  function actualizarSiguiente() {
    var b = $('#btn-sig');
    if (!b) return;
    b.textContent = textoSiguiente();
    b.disabled = PASOS[paso].tipo === 'uno' && resp[PASOS[paso].clave] === null;
  }

  function ir(i) {
    clearTimeout(avanceT);
    paso = Math.max(0, Math.min(PASOS.length - 1, i));
    if (paso > maxPaso) maxPaso = paso;
    pintarPaso(true);
  }

  tarjeta.addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b || !tarjeta.contains(b)) return;
    var p = PASOS[paso];
    if (b.hasAttribute('data-v')) {
      var v = p.num ? Number(b.getAttribute('data-v')) : b.getAttribute('data-v');
      resp[p.clave] = v;
      tarjeta.querySelectorAll('.opcion').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      actualizarSiguiente();
      pintarPasos();
      clearTimeout(avanceT);
      avanceT = setTimeout(function () { ir(paso + 1); }, sinMov ? 0 : 260);
    } else if (b.hasAttribute('data-g')) {
      var g = b.getAttribute('data-g');
      var lista = resp[p.clave];
      var pos = lista.indexOf(g);
      if (pos === -1) lista.push(g); else lista.splice(pos, 1);
      b.setAttribute('aria-pressed', String(pos === -1));
      actualizarSiguiente();
    } else if (b.getAttribute('data-accion') === 'atras') {
      ir(paso - 1);
    } else if (b.getAttribute('data-accion') === 'siguiente') {
      if (paso === PASOS.length - 1) generar(); else ir(paso + 1);
    } else if (b.getAttribute('data-accion') === 'ver') {
      irA($('#resultados'));
    } else if (b.getAttribute('data-accion') === 'reiniciar') {
      reiniciar();
    }
  });
  $('#lista-pasos').addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-ir]');
    if (b && !b.disabled) ir(Number(b.getAttribute('data-ir')));
  });

  var MENSAJES = ['Consultando a Cupido…', 'Negociando con el clima…', 'Midiendo el nivel de mariposas…', 'Descartando el plan de siempre…', 'Imprimiendo las entradas…'];
  function generar() {
    clearTimeout(cargaT);
    maxPaso = PASOS.length - 1;
    tarjeta.innerHTML = '<div class="cargando"><svg class="latido" aria-hidden="true"><use href="#corazon"/></svg><p id="msg-carga">' + MENSAJES[0] + '</p></div>';
    pintarPasos();
    var k = 0;
    var total = sinMov ? 1 : MENSAJES.length;
    (function rotar() {
      k++;
      if (k >= total) { mostrarResultados(); return; }
      cargaT = setTimeout(function () { var m = $('#msg-carga'); if (m) m.textContent = MENSAJES[k]; rotar(); }, sinMov ? 0 : 480);
    })();
  }

  var F_ETAPA = { conocer: 'Para romper el hielo', primera: 'Para una primera cita', pareja: 'Para ustedes dos', propuesta: 'Para la gran pregunta' };
  var F_PRES = { 1: 'en modo ahorro', 2: 'con presupuesto equilibrado', 3: 'sin mirar la billetera' };
  var F_DUR = { 1: 'con una hora libre', 2: 'con media tarde libre', 3: 'con el día entero', 4: 'con un fin de semana por delante' };
  var F_EN = { 1: 'y ganas de mantita', 2: 'y energía intermedia', 3: 'y ganas de aventura' };

  function mostrarResultados() {
    ultimaLista = M.recomendar(resp);
    var n = ultimaLista.length;
    $('#res-titulo').textContent = n + ' citas para ustedes';
    $('#res-resumen').textContent = F_ETAPA[resp.etapa] + ', ' + F_PRES[resp.presupuesto] + ', ' + F_DUR[resp.duracion] + ' ' + F_EN[resp.energia] +
      '. Abran una entrada para ver el plan completo y, cuando la hagan, sellen el pasaporte.';
    $('#lista-tickets').innerHTML = ultimaLista.map(function (o, k) { return ticketHTML(o, k); }).join('');
    $('#resultados').hidden = false;
    tarjeta.innerHTML = '<div class="listo"><p class="paso-num">Listo</p><h3 id="preg" tabindex="-1">Sus ' + n + ' citas ya están impresas.</h3>' +
      '<p class="ayuda">Bajen para verlas. Si quieren otra cosa, cambien cualquier respuesta desde la lista de pasos.</p>' +
      '<div class="botonera"><button type="button" class="btn btn-vino" data-accion="ver">Ver las citas</button>' +
      '<button type="button" class="btn-texto" data-accion="reiniciar">Empezar de cero</button></div></div>';
    paso = PASOS.length - 1;
    pintarPasos();
    irA($('#resultados'));
    setTimeout(function () { $('#res-titulo').focus({ preventScroll: true }); }, sinMov ? 0 : 450);
  }

  function ticketHTML(o, k) {
    var c = o.cita;
    var esPropuesta = resp.etapa === 'propuesta';
    var sellada = estaSellada(c.id);
    var razones = o.razones.length ? o.razones.join('. ').replace(/^./, function (x) { return x.toLowerCase(); }) + '.' : 'tiene todo para salir bien.';
    var det = 'det-' + c.id;
    var invTxt = c.inv;
    var html = '<article class="ticket" style="--i:' + k + '" data-id="' + c.id + '">' +
      '<div class="ticket-cuerpo">' +
      '<h3>' + esc(c.n) + '</h3>' +
      '<p class="resumen">' + esc(c.r) + '</p>' +
      '<ul class="datos"><li>' + M.PRESUP[c.p] + '</li><li>' + M.DURA[c.d] + '</li><li>' + M.LUGAR[c.l] + '</li></ul>' +
      '<p class="porque"><strong>Por qué esta:</strong> ' + esc(razones) + '</p>' +
      '<div class="ticket-acciones">' +
      '<button type="button" class="btn btn-vino btn-chico" data-ver="' + c.id + '" aria-expanded="false" aria-controls="' + det + '">Ver el plan</button>' +
      '<button type="button" class="btn btn-linea btn-chico" data-sellar="' + c.id + '" aria-pressed="' + sellada + '">' + (sellada ? 'Sellada' : '¡La hicimos!') + '</button>' +
      '</div></div>' +
      '<div class="ticket-talon" aria-label="Compatibilidad ' + o.pct + ' por ciento">' +
      '<span class="talon-chico">Admite</span><span class="talon-dos">2</span><span class="talon-raya"></span>' +
      '<span class="talon-chico">Match</span><span class="talon-pct">' + o.pct + '%</span>' +
      '<span class="talon-serie">N.º ' + String(c.num).padStart(3, '0') + '</span></div>' +
      '<div class="ticket-detalle" id="' + det + '" hidden>' +
      '<div class="bloque"><h4>Cómo prepararla</h4><ul class="checklist">' + c.prep.map(function (t, j) {
        return '<li><label><input type="checkbox" id="chk-' + c.id + '-' + j + '"><span>' + esc(t) + '</span></label></li>';
      }).join('') + '</ul></div>' +
      '<div class="bloque"><h4>' + (esPropuesta ? 'La frase del momento' : 'Para invitar') + '</h4><p class="cita-texto">' + esc(invTxt) + '</p>' +
      '<div class="botonera"><button type="button" class="btn btn-linea btn-chico" data-copiar="inv" data-cita="' + c.id + '">Copiar</button>' +
      (esPropuesta ? '' : '<a class="btn btn-linea btn-chico" href="' + whatsapp(invTxt) + '" target="_blank" rel="noopener">Mandar por WhatsApp</a>') + '</div></div>' +
      '<div class="bloque"><h4>Preguntas para charlar</h4><ul class="preguntas">' + c.q.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul></div>' +
      '<div class="bloque"><h4>Toque especial</h4><p>' + esc(c.t) + '</p><h4 style="margin-top:16px">Plan B</h4><p>' + esc(c.b) + '</p></div>' +
      '<div class="bloque bloque-ancho"><h4>Al día siguiente</h4><p class="cita-texto">' + esc(c.s) + '</p>' +
      '<div class="botonera"><button type="button" class="btn btn-linea btn-chico" data-copiar="s" data-cita="' + c.id + '">Copiar mensaje</button></div></div>' +
      ((resp.etapa === 'conocer' || resp.etapa === 'primera') ? '<p class="seguridad bloque-ancho"><strong>Primera cita segura:</strong> lugar con gente, avisale a alguien de confianza dónde vas a estar y volvé por tu cuenta.</p>' : '') +
      '</div></article>';
    return html;
  }

  function buscarCita(id) {
    for (var k = 0; k < M.CITAS.length; k++) { if (M.CITAS[k].id === id) return M.CITAS[k]; }
    return null;
  }

  $('#lista-tickets').addEventListener('click', function (ev) {
    var b = ev.target.closest('button');
    if (!b) return;
    if (b.hasAttribute('data-ver')) {
      var det = document.getElementById(b.getAttribute('aria-controls'));
      var abrir = det.hidden;
      det.hidden = !abrir;
      b.setAttribute('aria-expanded', String(abrir));
      b.textContent = abrir ? 'Cerrar el plan' : 'Ver el plan';
      b.closest('.ticket').classList.toggle('abierto', abrir);
    } else if (b.hasAttribute('data-copiar')) {
      var c = buscarCita(b.getAttribute('data-cita'));
      if (c) copiar(b.getAttribute('data-copiar') === 'inv' ? c.inv : c.s);
    } else if (b.hasAttribute('data-sellar')) {
      sellar(b.getAttribute('data-sellar'));
    }
  });

  function reiniciar() {
    resp = { etapa: null, presupuesto: null, duracion: null, lugar: null, energia: null, mios: [], suyos: [] };
    paso = 0;
    maxPaso = 0;
    $('#resultados').hidden = true;
    $('#lista-tickets').innerHTML = '';
    pintarPaso(false);
    irA($('#generador'));
  }
  $('#cambiar').addEventListener('click', function () {
    paso = 0;
    pintarPaso(false);
    irA($('#generador'));
    setTimeout(function () { var h = $('#preg'); if (h) h.focus({ preventScroll: true }); }, sinMov ? 0 : 450);
  });
  $('#de-cero').addEventListener('click', reiniciar);

  /* ---------- Pasaporte (solo en este dispositivo) ---------- */
  var CLAVE = 'mci-pasaporte';
  var GIROS = [-8, 6, -4, 9, -10, 5, -6, 8, -3, 7];
  function cargarPasaporte() {
    try {
      var x = JSON.parse(window.localStorage.getItem(CLAVE) || '[]');
      return Array.isArray(x) ? x : [];
    } catch (e) { return []; }
  }
  function guardarPasaporte() {
    try { window.localStorage.setItem(CLAVE, JSON.stringify(pasaporte)); } catch (e) { /* sin almacenamiento: queda en memoria */ }
  }
  var pasaporte = cargarPasaporte();
  function estaSellada(id) {
    for (var k = 0; k < pasaporte.length; k++) { if (pasaporte[k].id === id) return true; }
    return false;
  }
  function hoy() {
    var d = new Date();
    return String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0');
  }
  function sellar(id) {
    if (estaSellada(id)) { aviso('Esa cita ya tiene su sello. Repetirla también vale.'); return; }
    var c = buscarCita(id);
    if (!c) return;
    pasaporte.push({ id: id, n: c.n, f: hoy() });
    guardarPasaporte();
    pintarPasaporte(true);
    document.querySelectorAll('[data-sellar="' + id + '"]').forEach(function (b) { b.textContent = 'Sellada'; b.setAttribute('aria-pressed', 'true'); });
    var n = pasaporte.length;
    if (n === 5 || n === 10) { confeti(); aviso(n === 5 ? '¡Cinco sellos! Desbloquearon la cita secreta.' : '¡Pasaporte completo! Son oficialmente expertos.'); }
    else aviso('¡Sello nuevo! Van ' + n + '.');
  }
  function pintarPasaporte(nuevo) {
    var n = pasaporte.length;
    var html = '';
    for (var i = 0; i < 10; i++) {
      var s = pasaporte[i];
      if (s) {
        html += '<div class="sello lleno' + (nuevo && i === n - 1 ? ' nuevo' : '') + '" style="--rot:' + GIROS[i] + 'deg" title="' + esc(s.n) + '">' +
          '<span>N.º ' + (i + 1) + '</span><strong>Hecha</strong><span>' + esc(s.f) + '</span></div>';
      } else {
        html += '<div class="sello"><span>' + (i + 1) + '</span></div>';
      }
    }
    $('#sellos').innerHTML = html;
    $('#cuenta').innerHTML = (n > 10 ? n + ' <small>sellos</small>' : n + ' <small>de 10 sellos</small>');
    var logro;
    if (n === 0) logro = 'Todavía no hay sellos. La primera cita es la que más cuesta.';
    else if (n < 5) logro = 'Van ' + n + '. Buen ritmo. Con 5 sellos se desbloquea una cita secreta.';
    else if (n < 10) logro = '<strong>Cita secreta desbloqueada:</strong> la cita al revés. Empiecen por el postre, sigan con la charla profunda y terminen saludándose como si fuera la primera vez.';
    else logro = '<strong>Pasaporte completo.</strong> Son oficialmente expertos en citas. Los ebooks los esperan para el próximo nivel.';
    $('#logro').innerHTML = logro;
    var ult = pasaporte.slice(-3).reverse().map(function (s) { return s.n; });
    $('#ultimas').textContent = ult.length ? 'Últimas selladas: ' + ult.join(', ') + '.' : 'Los sellos aparecen acá cuando marcan una cita como hecha.';
    $('#vaciar-zona').hidden = n === 0 || !$('#vaciar-confirmar').hidden;
  }
  $('#vaciar').addEventListener('click', function () {
    $('#vaciar-zona').hidden = true;
    $('#vaciar-confirmar').hidden = false;
    $('#vaciar-si').focus();
  });
  $('#vaciar-no').addEventListener('click', function () {
    $('#vaciar-confirmar').hidden = true;
    pintarPasaporte(false);
    $('#vaciar').focus();
  });
  $('#vaciar-si').addEventListener('click', function () {
    pasaporte = [];
    guardarPasaporte();
    $('#vaciar-confirmar').hidden = true;
    pintarPasaporte(false);
    document.querySelectorAll('[data-sellar]').forEach(function (b) { b.textContent = '¡La hicimos!'; b.setAttribute('aria-pressed', 'false'); });
    aviso('Pasaporte vacío. A llenarlo de nuevo.');
  });

  /* ---------- Tragamonedas ---------- */
  var T = M.TRAGAMONEDAS;
  var rodillos = [
    { el: $('#r-donde'), datos: T.donde, val: 'En la terraza' },
    { el: $('#r-que'), datos: T.que, val: 'armen una playlist de 10 canciones cada uno' },
    { el: $('#r-giro'), datos: T.giro, val: 'con música de los 80' }
  ];
  function textoMaquina() { return rodillos[0].val + ', ' + rodillos[1].val + ', ' + rodillos[2].val + '.'; }
  function mensajeMaquina() { return 'Plan para nosotros: ' + textoMaquina().charAt(0).toLowerCase() + textoMaquina().slice(1) + ' ¿Te prendés?'; }
  function actualizarMaquina() {
    $('#maquina-texto').textContent = textoMaquina();
    $('#maquina-wa').href = whatsapp(mensajeMaquina());
  }
  $('#girar').addEventListener('click', function () {
    var btn = this;
    btn.disabled = true;
    var terminados = 0;
    rodillos.forEach(function (r, i) {
      var valEl = r.el.querySelector('.val');
      var final = azar(r.datos);
      if (sinMov) { r.val = final; valEl.textContent = final; terminados++; return; }
      r.el.classList.add('girando');
      var iv = setInterval(function () { valEl.textContent = azar(r.datos); }, 75);
      setTimeout(function () {
        clearInterval(iv);
        r.el.classList.remove('girando');
        r.val = final;
        valEl.textContent = final;
        terminados++;
        if (terminados === rodillos.length) { actualizarMaquina(); btn.disabled = false; }
      }, 650 + i * 420);
    });
    if (sinMov) { actualizarMaquina(); btn.disabled = false; }
  });
  $('#maquina-copiar').addEventListener('click', function () { copiar(mensajeMaquina()); });

  /* ---------- Frases para invitar ---------- */
  var tono = 'romantico';
  var indiceFrase = 0;
  var NIVELES = [
    [20, 'Tranqui como domingo a la tarde'],
    [45, 'Un cosquilleo simpático'],
    [70, 'Mariposas haciendo aeróbic'],
    [90, 'Mariposas en estampida'],
    [100, 'Alerta roja: respirá hondo']
  ];
  function tonoPorNervios(v) { return v <= 25 ? 'directo' : v <= 50 ? 'gracioso' : v <= 75 ? 'romantico' : 'timido'; }
  function armarFrase() {
    var plan = ($('#plan').value || '').trim() || 'algo lindo';
    var lista = M.FRASES[tono];
    var f = lista[indiceFrase % lista.length].replace('{plan}', plan);
    f = f.replace(/(^|[.!?]\s+)¿([a-záéíóúñ])/g, function (m, a, b) { return a + '¿' + b.toUpperCase(); });
    f = f.charAt(0).toUpperCase() + f.slice(1);
    $('#frase').textContent = f;
    $('#frase-wa').href = whatsapp(f);
  }
  function marcarTono() {
    document.querySelectorAll('#tonos .chip').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-tono') === tono)); });
  }
  $('#nervios').addEventListener('input', function () {
    var v = Number(this.value);
    for (var k = 0; k < NIVELES.length; k++) { if (v <= NIVELES[k][0]) { $('#nivel').textContent = NIVELES[k][1]; break; } }
    var t = tonoPorNervios(v);
    if (t !== tono) { tono = t; indiceFrase = 0; marcarTono(); armarFrase(); }
  });
  $('#tonos').addEventListener('click', function (ev) {
    var b = ev.target.closest('[data-tono]');
    if (!b) return;
    tono = b.getAttribute('data-tono');
    indiceFrase = 0;
    marcarTono();
    armarFrase();
  });
  $('#plan').addEventListener('input', armarFrase);
  document.querySelectorAll('[data-plan]').forEach(function (b) {
    b.addEventListener('click', function () { $('#plan').value = b.getAttribute('data-plan'); armarFrase(); });
  });
  $('#otra-frase').addEventListener('click', function () { indiceFrase++; armarFrase(); });
  $('#frase-copiar').addEventListener('click', function () { copiar($('#frase').textContent); });

  /* ---------- Confeti de corazones ---------- */
  function confeti() {
    if (sinMov) return;
    var c = $('#confeti');
    var ctx = c.getContext && c.getContext('2d');
    if (!ctx) return;
    var dpr = window.devicePixelRatio || 1;
    var W = window.innerWidth, H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var colores = ['#E8505B', '#C9A35B', '#7A1F3D', '#F6D6D3'];
    var ps = [];
    for (var i = 0; i < 70; i++) {
      ps.push({ x: Math.random() * W, y: -20 - Math.random() * H * 0.4, vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, r: 6 + Math.random() * 8, a: Math.random() * 6.28, va: (Math.random() - 0.5) * 0.2, col: colores[i % colores.length] });
    }
    var inicio = null;
    function corazon(p) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.scale(p.r / 12, p.r / 12);
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.bezierCurveTo(-10, -4, -6, -12, 0, -6);
      ctx.bezierCurveTo(6, -12, 10, -4, 0, 4);
      ctx.fillStyle = p.col;
      ctx.fill();
      ctx.restore();
    }
    function cuadro(t) {
      if (!inicio) inicio = t;
      ctx.clearRect(0, 0, W, H);
      ps.forEach(function (p) { p.x += p.vx; p.y += p.vy; p.a += p.va; corazon(p); });
      if (t - inicio < 2200) requestAnimationFrame(cuadro); else ctx.clearRect(0, 0, W, H);
    }
    requestAnimationFrame(cuadro);
  }

  /* ---------- Inicio ---------- */
  pintarPaso(false);
  pintarPasaporte(false);
  actualizarMaquina();
  armarFrase();
})();
