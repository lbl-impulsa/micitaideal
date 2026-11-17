/* Mi Cita Ideal — base de citas y motor de recomendación.
   Todo corre en el navegador: no se envía ni se guarda nada en servidores. */
(function (raiz) {
  'use strict';

  var ETAPAS = {
    conocer: 'Me gusta alguien',
    primera: 'Primera cita',
    pareja: 'Somos pareja',
    propuesta: 'Quiero proponer algo'
  };
  var PRESUP = { 1: 'Modo ahorro', 2: 'Equilibrado', 3: 'Vale la pena' };
  var DURA = { 1: '1 hora', 2: 'Media tarde', 3: 'Día completo', 4: 'Fin de semana' };
  var LUGAR = { adentro: 'Bajo techo', afuera: 'Al aire libre', ambos: 'Adentro o afuera' };
  var ENERGIA = { 1: 'Modo mantita', 2: 'Intermedio', 3: 'Modo aventura' };
  /* [clave, etiqueta, texto para las razones, plural] */
  var GUSTOS = [
    ['comida', 'Comida', 'la comida', false],
    ['musica', 'Música', 'la música', false],
    ['arte', 'Arte y museos', 'el arte', false],
    ['naturaleza', 'Naturaleza', 'la naturaleza', false],
    ['deporte', 'Deporte', 'el deporte', false],
    ['juegos', 'Juegos', 'jugar', false],
    ['pelis', 'Pelis y series', 'las pelis y series', true],
    ['libros', 'Libros', 'leer', false],
    ['animales', 'Animales', 'los animales', true],
    ['viajes', 'Viajes', 'viajar', false],
    ['relax', 'Relax', 'el relax', false]
  ];
  var GUSTO_TXT = {};
  var GUSTO_PLURAL = {};
  GUSTOS.forEach(function (g) { GUSTO_TXT[g[0]] = g[2]; GUSTO_PLURAL[g[0]] = g[3]; });
  function gusta(g) { return (GUSTO_PLURAL[g] ? 'gustan ' : 'gusta ') + GUSTO_TXT[g]; }

  /* e: etapas · p: presupuesto 1-3 · d: duración 1-4 · l: lugar · en: energía 1-3 · i: gustos */
  var CITAS = [
    { id: 'cafe-mision', n: 'Café con misión secreta', e: ['conocer', 'primera'], p: 1, d: 1, l: 'adentro', en: 1, i: ['comida', 'juegos'],
      r: 'Un café común, pero cada uno trae una pregunta rara escrita en un papelito.',
      prep: ['Elegí un café tranquilo, con mesas y buena luz', 'Escribí una pregunta curiosa en un papel y guardala', 'Proponé 1 hora: si fluye, se estira'],
      inv: '¿Un café esta semana? Traigo una pregunta rara en el bolsillo; vos traé otra.',
      q: ['¿Cuál es el mejor consejo que te dieron y nunca seguiste?', '¿Qué te hace perder la noción del tiempo?', '¿Qué plato te define?'],
      t: 'Al final, intercambien los papelitos y que cada uno se lleve el del otro.',
      b: 'Si el café está lleno, pidan para llevar y caminen.',
      s: 'Todavía pienso en tu respuesta del papelito. Te debo una revancha.' },

    { id: 'helado-moneda', n: 'Helado y caminata a cara o ceca', e: ['conocer', 'primera', 'pareja'], p: 1, d: 1, l: 'afuera', en: 2, i: ['comida', 'naturaleza'],
      r: 'Compran helado y en cada esquina decide una moneda: cara a la derecha, ceca a la izquierda.',
      prep: ['Elegí una heladería en una zona linda para caminar', 'Llevá una moneda', 'Pongan un límite: 10 esquinas y vuelven'],
      inv: 'Plan simple: helado y una caminata donde decide una moneda. ¿Te prendés?',
      q: ['¿Qué gusto de helado no pedirías ni loco?', '¿Sos de planificar o de improvisar?', '¿Cuál es tu rincón favorito de la ciudad?'],
      t: 'Saquen una foto en la esquina número 10, donde sea que caigan.',
      b: 'Si llueve, helado adentro y la moneda decide los temas de charla.',
      s: 'La moneda tenía buen gusto. ¿La consultamos para la próxima?' },

    { id: 'feria-regalito', n: 'Feria con regalito de presupuesto ridículo', e: ['conocer', 'primera', 'pareja'], p: 1, d: 2, l: 'afuera', en: 2, i: ['comida', 'arte'],
      r: 'Van a una feria con un monto chiquito cada uno y se compran un regalo sorpresa.',
      prep: ['Buscá una feria de artesanías o un mercado de fin de semana', 'Acuerden un monto chico para cada uno', 'Sepárense 15 minutos para elegir el regalo'],
      inv: '¿Vamos a la feria el sábado? Regla: un regalito sorpresa con un presupuesto ridículo.',
      q: ['¿Qué objeto de tu casa tiene la mejor historia?', '¿Qué regalo te hizo más feliz de chico?', '¿Coleccionás algo, aunque sea sin querer?'],
      t: 'Envuelvan el regalo con lo que tengan a mano, aunque sea una servilleta.',
      b: 'Si no hay feria, vale un supermercado grande: regalo comestible.',
      s: 'Mi regalito ya tiene lugar en el escritorio. Muy buena elección.' },

    { id: 'clase-prueba', n: 'Clase de algo que ninguno sabe hacer', e: ['conocer', 'primera', 'pareja'], p: 2, d: 1, l: 'adentro', en: 3, i: ['deporte', 'arte', 'musica'],
      r: 'Baile, cerámica o escalada para principiantes. Hacer el ridículo juntos une más que mil cafés.',
      prep: ['Buscá clases de prueba para principiantes', 'Elegí algo que ninguno haya hecho nunca', 'Llevá ropa cómoda y agua'],
      inv: 'Idea medio loca: una clase de prueba de algo que ninguno sabe hacer. ¿Baile, cerámica o escalada?',
      q: ['¿Qué aprenderías si tuvieras tiempo infinito?', '¿Cuál fue tu peor clase de gimnasia en la escuela?', '¿Sos más de competir o de reírte?'],
      t: 'Premio para quien lo haga peor: le pagan el jugo.',
      b: 'Si no hay cupo, un tutorial en una plaza y mucha dignidad.',
      s: 'Oficialmente sos mejor que yo en esto. Exijo revancha.' },

    { id: 'juegos-mesa', n: 'Bar de juegos de mesa con apuesta simbólica', e: ['conocer', 'primera', 'pareja'], p: 2, d: 1, l: 'adentro', en: 1, i: ['juegos', 'comida'],
      r: 'Eligen un juego que ninguno conozca. Quien pierde elige el próximo plan.',
      prep: ['Buscá un bar o café con juegos de mesa', 'Reservá si es fin de semana', 'Definan la apuesta: quien pierde elige el próximo plan'],
      inv: '¿Una partida de juegos de mesa esta semana? Te aviso que con las cartas soy de otro planeta.',
      q: ['¿Qué juego de tu infancia volverías a jugar?', '¿Respetás el reglamento o inventás reglas nuevas?', '¿Cuál es tu talento más inútil?'],
      t: 'Llevá un trofeo absurdo, como una tapita, para quien gane.',
      b: 'Si está lleno, cartas en cualquier café.',
      s: 'Exijo revancha. El trofeo de tapita no se queda con vos para siempre.' },

    { id: 'museo-detectives', n: 'Museo en modo detectives', e: ['conocer', 'primera', 'pareja'], p: 1, d: 2, l: 'adentro', en: 1, i: ['arte', 'libros'],
      r: 'Cada uno elige en secreto su obra favorita y el otro tiene tres intentos para adivinarla.',
      prep: ['Elegí un museo o muestra con entrada gratis o barata', 'Fijate días y horarios antes de ir', 'Recorran separados 20 minutos y reencuéntrense en la salida'],
      inv: '¿Vamos a un museo en modo detectives? Cada uno elige una obra en secreto y el otro adivina.',
      q: ['¿Qué obra te llevarías a tu casa si nadie mira?', '¿Qué te emocionó la última vez, aunque sea una pavada?', 'Si fueras un cuadro, ¿de qué color serías?'],
      t: 'Al final, cada uno cuenta por qué eligió esa obra.',
      b: 'Si el museo está cerrado, jueguen lo mismo con murales o vidrieras del barrio.',
      s: 'Sigo pensando en la obra que elegiste. Tenés buen ojo.' },

    { id: 'picnic-playlist', n: 'Picnic al atardecer con playlist compartida', e: ['primera', 'pareja'], p: 1, d: 2, l: 'afuera', en: 1, i: ['musica', 'naturaleza', 'comida'],
      r: 'Una manta, algo rico para picar y una playlist que arman entre los dos.',
      prep: ['El día antes, armen juntos una playlist: 10 canciones cada uno', 'Elegí un parque o mirador con vista al oeste', 'Prepará una canasta con cosas fáciles de comer con la mano', 'Llevá manta, un parlante chico y una bolsa para la basura'],
      inv: '¿Te animás a un picnic el sábado al atardecer? Yo llevo la comida, vos la música.',
      q: ['¿Qué canción te lleva directo a tu infancia?', '¿Cuál fue el mejor atardecer que viste?', 'Si esta playlist fuera la banda sonora del año, ¿qué canción falta?'],
      t: 'Escondé una nota en la canasta con la razón de una de tus canciones.',
      b: 'Si llueve, picnic en un café con mesas junto a la ventana y la misma playlist.',
      s: 'Todavía tengo la canción 4 en la cabeza. ¿Repetimos con otra playlist?' },

    { id: 'karaoke', n: 'Karaoke sin vergüenza', e: ['primera', 'pareja'], p: 2, d: 1, l: 'adentro', en: 3, i: ['musica'],
      r: 'Cada uno elige la canción del otro. No hay escapatoria.',
      prep: ['Buscá un karaoke con salas privadas o una noche de karaoke en un bar', 'Anoten 3 canciones para el otro', 'Calentá la voz en el camino (o no: es más gracioso)'],
      inv: 'Propuesta peligrosa: karaoke, y cada uno elige la canción del otro. ¿Te animás?',
      q: ['¿Qué canción cantás cuando nadie te escucha?', '¿Qué recital no te perderías jamás?', '¿Qué canción te recuerda a tus 15?'],
      t: 'Dedicale una canción, con presentación y todo.',
      b: 'Si no hay karaoke cerca, bar con música en vivo y se canta bajito.',
      s: 'Todavía me recupero de tu versión de anoche. Fue histórica.' },

    { id: 'cocina-pais', n: 'Cocina de un país al azar', e: ['pareja'], p: 1, d: 2, l: 'adentro', en: 2, i: ['comida', 'viajes'],
      r: 'Señalan un país con los ojos cerrados en un mapa y cocinan algo típico de ahí.',
      prep: ['Elijan el país al azar con el dedo en un mapa', 'Busquen una receta fácil y hagan la lista de compras', 'Hagan las compras juntos: es parte de la cita'],
      inv: 'Plan para el finde: elegimos un país al azar y cocinamos algo típico. Si sale mal, pedimos pizza.',
      q: ['¿A qué país viajarías mañana?', '¿Cuál es la comida más rara que probaste?', '¿Qué plato de tu familia tiene historia?'],
      t: 'Pongan música de ese país y aprendan a decir salud en su idioma.',
      b: 'Si la receta fracasa, la pizza también tiene pasaporte.',
      s: 'Ya estoy eligiendo el próximo país. Spoiler: hay postre.' },

    { id: 'cine-premios', n: 'Cine en casa con premios inventados', e: ['pareja'], p: 1, d: 2, l: 'adentro', en: 1, i: ['pelis', 'comida'],
      r: 'Doble función: cada uno elige una peli y al final entregan premios absurdos.',
      prep: ['Cada uno elige una película sin decirle al otro', 'Preparen pochoclos y una bebida especial', 'Escriban 3 premios: mejor peinado, peor decisión, villano más simpático'],
      inv: 'Te invito a una doble función en casa. Hay premios, pochoclos y cero spoilers.',
      q: ['¿Qué peli viste más veces de las que admitirías?', '¿Con qué personaje te identificás demasiado?', '¿Qué serie empezarías conmigo?'],
      t: 'Hagan entradas de papel con asiento asignado.',
      b: 'Si se duermen en la segunda, el premio es para el sillón.',
      s: 'El premio a mejor compañía de sillón ya tiene dueño.' },

    { id: 'desayuno-hotel', n: 'Desayuno de hotel en casa', e: ['pareja'], p: 2, d: 1, l: 'adentro', en: 1, i: ['comida', 'relax'],
      r: 'Menú impreso, servilleta en el brazo y servicio a la cama. Cinco estrellas sin salir de casa.',
      prep: ['Comprá algo rico: medialunas, frutas, jugo', 'Escribí un menú con nombres pomposos', 'Prepará una bandeja con una flor o una nota'],
      inv: 'Mañana tenés reserva en el hotel más exclusivo de la ciudad. El check-in es en la cama.',
      q: ['¿Cuál fue el mejor desayuno de tu vida?', '¿Qué harías con un día entero sin obligaciones?', '¿Qué hotel o lugar soñás conocer?'],
      t: 'Dejá una encuesta de satisfacción en la bandeja.',
      b: 'Si no da para la cama, mantel en el piso del living.',
      s: 'Su opinión es importante para nosotros: ¿cuándo vuelve a reservar?' },

    { id: 'amanecer-termo', n: 'Amanecer con termo', e: ['pareja'], p: 1, d: 1, l: 'afuera', en: 2, i: ['naturaleza', 'relax'],
      r: 'Despertador temprano, termo caliente y el sol saliendo solo para ustedes.',
      prep: ['Fijate a qué hora sale el sol', 'Elegí un lugar con vista al este: costanera, plaza alta o terraza', 'Prepará el termo y algo para comer'],
      inv: 'Plan raro pero hermoso: ver el amanecer juntos. Yo llevo el termo.',
      q: ['¿Sos de mañana o de noche, con honestidad?', '¿Qué te gustaría que te pase este año?', '¿Qué momento simple te hace feliz?'],
      t: 'Cuando salga el sol, cada uno dice un deseo en voz alta.',
      b: 'Si está nublado, el amanecer es en la cocina con desayuno largo.',
      s: 'Valió cada minuto de sueño perdido. ¿Repetimos con atardecer?' },

    { id: 'bici-sorpresa', n: 'Bicicletas con parada sorpresa', e: ['primera', 'pareja'], p: 1, d: 2, l: 'afuera', en: 3, i: ['deporte', 'naturaleza'],
      r: 'Un paseo en bici donde cada uno elige una parada secreta para el otro.',
      prep: ['Consigan bicis: propias, alquiladas o del sistema público', 'Armen un recorrido con ciclovía y sin apuro', 'Cada uno elige en secreto una parada: una vista, una plaza, un kiosco'],
      inv: '¿Paseo en bici el domingo? Cada uno elige una parada sorpresa.',
      q: ['¿Qué lugar de la ciudad me mostrarías?', '¿Te animarías a un viaje largo en bici?', '¿Cuál es tu recuerdo favorito al aire libre de chico?'],
      t: 'En tu parada, tené algo preparado: una fruta, una foto, una historia.',
      b: 'Si llueve, caminata con paraguas y las paradas son cafés.',
      s: 'Tu parada sorpresa gana por lejos. La mía la mejoro la próxima.' },

    { id: 'pueblo-cercano', n: 'Escapada al pueblo que nunca visitaron', e: ['pareja'], p: 2, d: 3, l: 'afuera', en: 2, i: ['viajes', 'comida'],
      r: 'Eligen un pueblo a menos de dos horas y lo recorren como turistas curiosos.',
      prep: ['Busquen pueblos a menos de 2 horas', 'Averigüen qué es típico: una comida, una plaza, una feria', 'Salgan temprano y pongan el celular en modo avión en el viaje'],
      inv: '¿Nos escapamos un día a un pueblo que no conozcamos? Yo armo la playlist del viaje.',
      q: ['¿Qué lugar querés conocer antes de fin de año?', '¿Sos de llevar todo planeado o de perderte?', '¿Cuál fue tu mejor viaje y por qué?'],
      t: 'Mándense una postal desde el pueblo a sus propias casas.',
      b: 'Si el clima no acompaña, recorrido de cafés y almacenes del pueblo.',
      s: 'Ya extraño el pueblo. ¿El próximo lo elegís vos?' },

    { id: 'finde-sin-celu', n: 'Fin de semana sin celulares', e: ['pareja'], p: 3, d: 4, l: 'ambos', en: 1, i: ['naturaleza', 'relax', 'viajes'],
      r: 'Cabaña, glamping o casita: dos días con los celulares guardados en una caja.',
      prep: ['Reservá un alojamiento tranquilo, con naturaleza cerca', 'Llevá cartas, un libro y comida rica', 'Armen la caja de celulares: se abre solo por emergencias'],
      inv: 'Tengo una idea: un finde solos y sin celulares. ¿Te animás al detox?',
      q: ['¿Qué hacías antes de tener celular?', '¿Qué te gustaría que hagamos más seguido?', '¿Dónde te ves en 5 años?'],
      t: 'Escriban una carta corta para leer el último día.',
      b: 'Si llueve todo el finde, mejor: maratón de juegos y siestas.',
      s: 'Volver al mundo fue duro. Ya pienso en la próxima escapada.' },

    { id: 'cena-pasos', n: 'Cena de pasos con menú escrito a mano', e: ['pareja'], p: 2, d: 2, l: 'adentro', en: 1, i: ['comida'],
      r: 'Tres pasos en casa, con nombres ridículamente elegantes en un menú escrito a mano.',
      prep: ['Pensá entrada, principal y postre sencillos', 'Escribí el menú con nombres pomposos', 'Velas, mantel y la mejor vajilla que tengas'],
      inv: 'Esta noche hay reserva para dos en mi casa. Código de vestimenta: comodidad elegante.',
      q: ['¿Qué comida te hace sentir en casa?', '¿Qué plato tenés que probar sí o sí?', '¿Qué momento de este año merece un brindis?'],
      t: 'Sumá al menú un plato del chef que sea un recuerdo de ustedes.',
      b: 'Si algo se quema, el menú pasa a llamarse experiencia rústica.',
      s: 'El chef agradece la visita y ya piensa el menú de la próxima.' },

    { id: 'spa-casero', n: 'Spa en casa', e: ['pareja'], p: 1, d: 2, l: 'adentro', en: 1, i: ['relax'],
      r: 'Toallas tibias, música tranquila y masajes por turnos. Cero apuro.',
      prep: ['Prepará toallas, cremas y velas', 'Armá una playlist tranquila de 1 hora', 'Dejá frutas o algo liviano para después'],
      inv: 'Reservé un spa para esta noche. Queda en mi casa y la atención es personalizada.',
      q: ['¿Qué te ayuda a desconectar de verdad?', '¿Qué te preocupa y nunca contás?', '¿Cómo sería tu día perfecto de descanso?'],
      t: 'Colgá un cartelito de No molestar en la puerta.',
      b: 'Si no hay ganas de masajes, pies en agua tibia y charla.',
      s: 'Mi espalda y yo te agradecemos. Cinco estrellas.' },

    { id: 'caminata-cima', n: 'Caminata con picnic en la cima', e: ['pareja'], p: 1, d: 3, l: 'afuera', en: 3, i: ['naturaleza', 'deporte'],
      r: 'Un sendero corto, una mochila con comida y la vista como premio.',
      prep: ['Elegí un sendero fácil o intermedio y mirá el pronóstico', 'Llevá agua, protector solar y calzado cómodo', 'Avisale a alguien a dónde van y a qué hora vuelven'],
      inv: '¿Caminata el sábado? Hay picnic con vista arriba de todo.',
      q: ['¿Qué paisaje te deja sin palabras?', '¿Qué desafío físico te dejó con más orgullo?', '¿A qué lugar del mundo te gustaría subir?'],
      t: 'Llevá algo chiquito para brindar en la cima.',
      b: 'Si el clima falla, picnic en el living con fotos de montañas en la tele.',
      s: 'Me duelen las piernas, pero la vista lo vale. ¿Próxima cima?' },

    { id: 'show-desconocido', n: 'Recital de una banda que no conocen', e: ['primera', 'pareja'], p: 2, d: 1, l: 'ambos', en: 3, i: ['musica'],
      r: 'Eligen un show chico de alguien que ninguno escuchó nunca. Sorpresa garantizada.',
      prep: ['Buscá la agenda de música en vivo de la semana', 'Elijan uno al azar, sin escuchar antes', 'Compren entradas y lleguen temprano'],
      inv: 'Plan aventurero: vamos a ver a una banda que ninguno conoce. ¿Te animás?',
      q: ['¿Cuál fue tu primer recital?', '¿Qué música te pone de buen humor sí o sí?', '¿Qué canción pondrías en nuestra playlist?'],
      t: 'Llévense un recuerdo de la banda, aunque sea un sticker.',
      b: 'Si no hay entradas, música en vivo en un bar o una plaza.',
      s: 'Ahora somos fans de una banda que nadie conoce. Me encanta.' },

    { id: 'libro-ciegas', n: 'Librería y libro a ciegas', e: ['conocer', 'primera', 'pareja'], p: 1, d: 1, l: 'adentro', en: 1, i: ['libros', 'arte'],
      r: 'Cada uno elige un libro para el otro según lo poco (o mucho) que lo conoce.',
      prep: ['Elegí una librería grande o de usados', 'Pónganse un límite de precio', 'Sepárense 15 minutos y elijan el libro del otro'],
      inv: '¿Vamos a una librería? Cada uno elige un libro para el otro. Es un test de cuánto nos conocemos.',
      q: ['¿Qué libro te cambió la cabeza?', '¿Qué leías a los 15?', 'Si tu vida fuera un libro, ¿cómo se llamaría?'],
      t: 'Escribí una dedicatoria corta en la primera página.',
      b: 'Si no hay presupuesto, intercambien un libro que ya tengan.',
      s: 'Voy por el capítulo dos y tu elección me encanta.' },

    { id: 'refugio-animales', n: 'Tarde de voluntariado con animales', e: ['conocer', 'primera', 'pareja'], p: 1, d: 2, l: 'afuera', en: 2, i: ['animales'],
      r: 'Pasear perros o ayudar en un refugio. Ternura y buena acción en la misma cita.',
      prep: ['Contactá a un refugio y preguntá si reciben voluntarios por una tarde', 'Llevá ropa que se pueda ensuciar', 'Sumá algo para donar: alimento o mantas'],
      inv: 'Plan distinto: ayudar una tarde en un refugio de animales. ¿Te gustan los perros?',
      q: ['¿Qué mascota tuviste o te gustaría tener?', '¿Sos más de perros, de gatos o de plantas?', '¿Qué causa te mueve?'],
      t: 'Nombren al perro más simpático padrino oficial de la cita.',
      b: 'Si no hay turnos, paseo por un parque con perros y donación online.',
      s: 'Todavía pienso en el perrito de orejas raras. ¿Volvemos?' },

    { id: 'fotos-consignas', n: 'Desafío de fotos con 10 consignas', e: ['conocer', 'primera', 'pareja'], p: 1, d: 2, l: 'afuera', en: 2, i: ['arte', 'naturaleza'],
      r: 'Salen con una lista de 10 fotos para sacar. Gana quien complete más.',
      prep: ['Escribí 10 consignas: algo rojo, una sombra rara, un perro con estilo', 'Elegí un barrio lindo para caminar', 'Pónganse 90 minutos de tiempo'],
      inv: '¿Te sumás a un desafío de fotos? Tengo 10 consignas y cero talento.',
      q: ['¿Qué foto de tu celular no borrarías nunca?', '¿Qué te llama la atención cuando caminás?', '¿Qué lugar del mundo te gustaría fotografiar?'],
      t: 'Elijan la mejor foto de cada uno y mándenla a imprimir.',
      b: 'Si llueve, las consignas se hacen en un museo o un centro comercial.',
      s: 'Tu foto del perro con estilo merece un premio. Ya la imprimí.' },

    { id: 'cena-sincronizada', n: 'Cena sincronizada a distancia', e: ['conocer', 'pareja'], p: 1, d: 1, l: 'adentro', en: 1, i: ['comida', 'pelis'],
      r: 'Misma receta, misma hora y videollamada abierta. La distancia se achica.',
      prep: ['Elijan una receta fácil y compren lo mismo', 'Acuerden la hora y prueben la videollamada antes', 'Pongan la misma playlist o la misma peli de fondo'],
      inv: '¿Cenamos juntos esta noche, cada uno en su casa? Misma receta, misma hora y videollamada.',
      q: ['¿Qué haríamos primero si estuviéramos en el mismo lugar?', '¿Qué te hizo reír hoy?', '¿Qué comida te recuerda a tu casa?'],
      t: 'Mandale un postre por delivery como sorpresa.',
      b: 'Si se corta internet, sigan por audios.',
      s: 'Fue como cenar juntos. Ya quiero la versión en persona.' },

    { id: 'noche-estrellas', n: 'Noche de estrellas', e: ['pareja'], p: 1, d: 1, l: 'afuera', en: 1, i: ['naturaleza', 'relax'],
      r: 'Una manta, un lugar oscuro y una app de constelaciones para inventar historias.',
      prep: ['Buscá un lugar seguro y con poca luz: terraza, campo o patio', 'Bajá una app gratuita de constelaciones', 'Llevá manta, abrigo y algo caliente'],
      inv: '¿Salimos a mirar estrellas? Prometo inventarle nombres a las constelaciones.',
      q: ['¿Creés que hay vida en otros planetas?', '¿Qué le preguntarías a tu yo de dentro de 10 años?', '¿Qué deseo le pedirías a una estrella fugaz?'],
      t: 'Bauticen una estrella con un nombre que solo ustedes entiendan.',
      b: 'Si está nublado, documental del espacio con las luces apagadas.',
      s: 'Nuestra estrella sigue ahí. Anoche la saludé.' },

    { id: 'capsula-tiempo', n: 'Cápsula del tiempo', e: ['pareja'], p: 1, d: 1, l: 'adentro', en: 1, i: ['libros', 'arte'],
      r: 'Escriben cartas y guardan objetos en una caja que se abre dentro de un año.',
      prep: ['Conseguí una caja linda o un frasco', 'Cada uno escribe una carta al otro y otra a su yo futuro', 'Sumen objetos: una entrada, una foto, un ticket'],
      inv: 'Quiero hacer algo con vos que termine dentro de un año. ¿Armamos una cápsula del tiempo?',
      q: ['¿Qué te gustaría que cambie en un año?', '¿Qué cosa de hoy no querés olvidar?', '¿Qué predicción hacés sobre nosotros?'],
      t: 'Agenden la fecha de apertura en el calendario de los dos.',
      b: 'Si no hay caja, un sobre cerrado y firmado sirve igual.',
      s: 'Ya marqué la fecha. Faltan 364 días.' },

    { id: 'ruta-sabores', n: 'Ruta de sabores en tres paradas', e: ['primera', 'pareja'], p: 2, d: 2, l: 'afuera', en: 2, i: ['comida'],
      r: 'Entrada en un lugar, plato principal en otro y postre en un tercero.',
      prep: ['Elegí 3 lugares cerca entre sí', 'Reservá el del plato principal si hace falta', 'Presentá el plan como si fuera una misión'],
      inv: '¿Una cena en tres paradas? Entrada, principal y postre, cada uno en un lugar distinto.',
      q: ['¿Cuál es tu comida de consuelo?', '¿Qué plato pedís siempre, en todos lados?', '¿Qué lugar de comida recomendarías a ciegas?'],
      t: 'Que la última parada la elija la otra persona, sin decirte.',
      b: 'Si llueve, hagan la ruta en un mercado techado.',
      s: 'El postre ganó la noche. ¿Volvemos a esa tercera parada?' },

    { id: 'kayak', n: 'Kayak o paddle al atardecer', e: ['pareja'], p: 2, d: 2, l: 'afuera', en: 3, i: ['deporte', 'naturaleza'],
      r: 'Remar juntos es una prueba de equipo. Y de risas.',
      prep: ['Buscá un lugar que alquile kayaks o tablas con guía', 'Mirá el clima y el viento', 'Llevá ropa que se pueda mojar y una muda seca'],
      inv: '¿Te animás a remar conmigo? Prometo no hundirnos (mucho).',
      q: ['¿Qué deporte siempre quisiste probar?', '¿Sos más de mar, río o pileta?', '¿Qué hacés cuando algo te sale mal?'],
      t: 'Al terminar, merienda con vista al agua.',
      b: 'Si hay mucho viento, bote a pedal o caminata por la orilla.',
      s: 'Somos un gran equipo de remo. Mis brazos opinan distinto.' },

    { id: 'noche-retro', n: 'Noche retro de juegos y golosinas', e: ['pareja'], p: 1, d: 2, l: 'adentro', en: 2, i: ['juegos', 'pelis'],
      r: 'Juegos de cuando eran chicos, golosinas de la infancia y una tabla de puntajes en la heladera.',
      prep: ['Buscá juegos de la infancia: consola vieja, cartas o juegos de mesa', 'Compren las golosinas que comían de chicos', 'Armen una tabla de puntajes en un papel'],
      inv: 'Noche retro: juegos de cuando éramos chicos y golosinas de la infancia. ¿Te prendés?',
      q: ['¿Cuál era tu juego favorito de chico?', '¿Qué golosina extrañás?', '¿Qué dibujito mirabas sin falta?'],
      t: 'Hacé una medalla de cartón para quien gane.',
      b: 'Si no hay consola, ludo, oca o cartas.',
      s: 'La tabla de puntajes dice que me debés una revancha.' },

    { id: 'juntada-grupo', n: 'Juntada con amigos y momento a solas', e: ['conocer'], p: 1, d: 2, l: 'ambos', en: 2, i: ['comida', 'juegos'],
      r: 'Una juntada con amigos en común: menos presión y más chances de charlar.',
      prep: ['Armá una juntada chica con amigos en común', 'Proponé un plan con actividad: pizzas, juegos o asado', 'Buscá un momento para charlar a solas sin forzarlo'],
      inv: 'Estamos armando una juntada el sábado con amigos. ¿Te sumás?',
      q: ['¿Cómo conociste a los demás?', '¿Qué plan te salva un domingo aburrido?', '¿Qué te hace reír sí o sí?'],
      t: 'Ofrecete a acompañar a esa persona a comprar algo: ahí aparece el momento a solas.',
      b: 'Si la juntada se cae, proponé el mismo plan para dos, sin presión.',
      s: 'Qué buena juntada. Me quedé con ganas de seguir la charla.' },

    { id: 'paseo-perros', n: 'Paseo con perros por la plaza', e: ['conocer', 'primera'], p: 1, d: 1, l: 'afuera', en: 2, i: ['animales', 'naturaleza'],
      r: 'Si alguno tiene perro, es la excusa perfecta. Si no, se pide uno prestado.',
      prep: ['Proponé una plaza o parque con gente y árboles', 'Llevá agua para el perro y bolsitas', 'Plan corto: 45 minutos, sin compromiso'],
      inv: 'Mi perro pide conocerte. ¿Paseo por la plaza el domingo?',
      q: ['¿Cómo se llamaba tu primera mascota?', '¿Qué raza de perro serías?', '¿Cuál es tu plaza favorita y por qué?'],
      t: 'Llevá un premio para el perro del otro: puntos dobles.',
      b: 'Si llueve, café y fotos de mascotas de por medio.',
      s: 'Mi perro pregunta cuándo es el próximo paseo. Yo también.' },

    /* ——— Propuestas ——— */
    { id: 'donde-empezo', n: 'Volver al lugar donde empezó todo', e: ['propuesta'], p: 1, d: 1, l: 'ambos', en: 1, i: ['comida', 'naturaleza', 'relax'],
      r: 'Recrean su primera cita, pero esta vez con una pregunta guardada en el bolsillo.',
      prep: ['Volvé al lugar donde se conocieron o tuvieron su primera cita', 'Pedí lo mismo que aquella vez, si se puede', 'Llevá algo que simbolice la pregunta: una nota, un llavero o un anillo'],
      inv: 'Acá empezó todo. Y me gustaría que acá empiece lo que sigue. ¿Me decís que sí?',
      q: ['¿Te acordás qué pensaste de mí ese día?', '¿Qué fue lo que más te sorprendió de nosotros?', '¿Qué querés que vivamos este año?'],
      t: 'Si hay alguien de confianza cerca, que saque fotos de lejos, sin que se note.',
      b: 'Si el lugar ya no existe, recrealo en casa con fotos de esa época.',
      s: 'Gracias por el sí. Fue el mejor día del año (y de varios).' },

    { id: 'busqueda-tesoro', n: 'Búsqueda del tesoro con la pregunta al final', e: ['propuesta'], p: 1, d: 2, l: 'ambos', en: 2, i: ['juegos', 'arte'],
      r: 'Pistas escondidas en lugares importantes para ustedes. La última pista es la pregunta.',
      prep: ['Elegí 4 o 5 lugares con significado (pueden ser rincones de la casa)', 'Escribí pistas que lleven de un lugar al siguiente', 'En el último punto, esperá con la pregunta'],
      inv: 'Esta fue la última pista. La respuesta la tenés vos: ¿seguimos escribiendo esta historia juntos?',
      q: ['¿Qué lugar te recuerda más a nosotros?', '¿Cuál fue nuestra mejor aventura?', '¿Qué te gustaría que hagamos por primera vez?'],
      t: 'Que cada pista incluya un recuerdo escrito de ese lugar.',
      b: 'Si el clima no ayuda, búsqueda dentro de casa con las mismas pistas.',
      s: 'Todavía guardo todas las pistas. Son nuestro mapa.' },

    { id: 'cena-historia', n: 'Cena con el menú de su historia', e: ['propuesta'], p: 2, d: 2, l: 'adentro', en: 1, i: ['comida'],
      r: 'Cada plato recuerda un momento de la relación. El postre viene con la pregunta.',
      prep: ['Elegí 3 momentos importantes y un plato para cada uno', 'Escribí un menú con el nombre de cada momento', 'Prepará el postre con la pregunta en una nota'],
      inv: 'El postre de hoy se llama nuestro próximo capítulo. ¿Lo empezamos juntos?',
      q: ['¿Qué momento nuestro elegirías para un plato?', '¿Cuándo supiste que esto iba en serio?', '¿Qué tradición te gustaría que tengamos?'],
      t: 'Guarden el menú firmado por los dos.',
      b: 'Si cocinar no es lo tuyo, pedí la comida y armá vos el menú.',
      s: 'El menú ya está enmarcado. El postre fue el mejor de mi vida.' },

    { id: 'mirador', n: 'Mirador al atardecer, solos', e: ['propuesta'], p: 1, d: 1, l: 'afuera', en: 1, i: ['naturaleza', 'relax'],
      r: 'Un lugar alto, el sol bajando y nadie alrededor. Un clásico por algo.',
      prep: ['Buscá un mirador tranquilo y fijate la hora del atardecer', 'Llegá 30 minutos antes para elegir el lugar', 'Llevá manta y algo para brindar después'],
      inv: 'Elegí la mejor vista que encontré para hacerte la pregunta más importante. ¿Me decís que sí?',
      q: ['¿Qué te imaginás para nosotros en 5 años?', '¿Qué te hace sentir en casa?', '¿Qué te gustaría que celebremos cada año?'],
      t: 'Que suene de fondo su canción, bajito.',
      b: 'Si se nubla, terraza o balcón con luces y la misma canción.',
      s: 'El atardecer más lindo y la respuesta más linda.' },

    { id: 'album-pagina', n: 'Álbum con la última página en blanco', e: ['propuesta'], p: 1, d: 1, l: 'adentro', en: 1, i: ['arte', 'libros'],
      r: 'Un álbum con su historia en fotos. La última página tiene solo la pregunta.',
      prep: ['Imprimí de 15 a 20 fotos de momentos importantes', 'Armá el álbum en orden y escribí una frase debajo de cada foto', 'En la última página, escribí la pregunta'],
      inv: 'Esta página todavía está en blanco. ¿La llenamos juntos?',
      q: ['¿Cuál es tu foto favorita de nosotros?', '¿Qué foto nos falta sacar?', '¿Qué momento te gustaría repetir?'],
      t: 'Dejá una lapicera al lado: la respuesta se escribe ahí.',
      b: 'Si no llegás a imprimir, un video con las fotos y la pregunta al final.',
      s: 'La última página ya tiene respuesta. Y es mi favorita.' },

    { id: 'escapada-pregunta', n: 'Escapada con la pregunta en la última noche', e: ['propuesta'], p: 3, d: 4, l: 'ambos', en: 2, i: ['viajes', 'relax'],
      r: 'Un viaje corto donde todo es especial y la pregunta llega en la última cena.',
      prep: ['Reservá un lugar que a esa persona le encante', 'Planeá la última noche distinta: cena, terraza o fogón', 'Avisá en el alojamiento si querés que preparen algo'],
      inv: 'Este viaje fue hermoso, y quiero que sea el primero de muchos. ¿Me decís que sí?',
      q: ['¿Cuál fue el mejor momento del viaje?', '¿A dónde iríamos en el próximo?', '¿Qué aprendiste de nosotros este año?'],
      t: 'Llevá una foto de su primer viaje para mostrarla en ese momento.',
      b: 'Si llueve la última noche, la pregunta va igual: adentro y con velas.',
      s: 'El viaje terminó, pero lo que empezó recién arranca.' },

    { id: 'llave-cajita', n: 'Una llave en una cajita (para convivir)', e: ['propuesta'], p: 1, d: 1, l: 'adentro', en: 1, i: ['relax', 'comida'],
      r: 'Para proponer vivir juntos: una copia de la llave envuelta como regalo.',
      prep: ['Hacé una copia de la llave o conseguí un llavero si todavía no hay casa', 'Guardala en una cajita linda', 'Elegí un momento tranquilo, con algo rico'],
      inv: 'Esta llave abre una puerta, pero lo que te propongo es un hogar. ¿Vivimos juntos?',
      q: ['¿Cómo imaginás nuestra casa?', '¿Qué costumbre tuya no negociarías?', '¿Qué planta, mascota o mueble no puede faltar?'],
      t: 'Sumá un llavero con algo de ustedes dos.',
      b: 'Si todavía no hay casa, la cajita trae un mapa del barrio soñado.',
      s: 'Ya estoy haciendo lugar en el placard. Oficialmente.' },

    { id: 'taza-pregunta', n: 'Desayuno con la pregunta en la taza', e: ['propuesta'], p: 1, d: 1, l: 'adentro', en: 1, i: ['comida', 'relax'],
      r: 'Un desayuno normal, hasta que la taza se vacía y aparece la pregunta en el fondo.',
      prep: ['Conseguí una taza y un marcador para cerámica, o mandala a personalizar', 'Escribí la pregunta en el fondo o en la base', 'Prepará el desayuno favorito de esa persona'],
      inv: 'Ahí está la pregunta. Tomate tu tiempo: el café no se enfría tan rápido.',
      q: ['¿Qué te gustaría que hagamos todos los domingos?', '¿Qué es lo que más te gusta de nuestras mañanas?', '¿Qué sueño tenemos pendiente?'],
      t: 'Tené lista otra taza que diga sí, para brindar.',
      b: 'Si no conseguís taza, la pregunta va debajo del plato.',
      s: 'Cada vez que tomo café en esa taza me acuerdo del sí.' }
  ];
  CITAS.forEach(function (c, k) { c.num = k + 1; });

  var RAZON_ENERGIA = { 1: 'Ideal para el modo mantita', 2: 'Movimiento justo, sin transpirar de más', 3: 'Garantiza anécdota' };
  var RAZON_DURA = { 1: 'Entra justo en una hora', 2: 'Pensada para media tarde', 3: 'Llena el día justo', 4: 'Hecha para un fin de semana' };
  var A_DISTANCIA = ['cena-sincronizada'];

  function recomendar(r) {
    var mios = r.mios || [];
    var suyos = r.suyos || [];
    var comunes = mios.filter(function (g) { return suyos.indexOf(g) !== -1; });
    var union = mios.concat(suyos.filter(function (g) { return mios.indexOf(g) === -1; }));
    var P = r.presupuesto, D = r.duracion;

    var pool = CITAS.filter(function (c) { return c.e.indexOf(r.etapa) !== -1; });
    var lista = pool.filter(function (c) { return c.p <= P && c.d <= D; });
    /* Si quedan pocas, sumamos las que se pasan apenas de tiempo o de presupuesto */
    if (lista.length < 6) {
      lista = lista.concat(pool.filter(function (c) { return lista.indexOf(c) === -1 && c.p <= P && c.d === D + 1; }));
    }
    if (lista.length < 4) {
      lista = lista.concat(pool.filter(function (c) { return lista.indexOf(c) === -1 && c.p === P + 1 && c.d <= D + 1; }));
    }
    if (lista.length < 3) lista = pool.slice();

    var MAX = 16;
    var puntuadas = lista.map(function (c) {
      var s = 0;
      var razones = [];
      var avisos = [];
      if (c.d > D) { s -= 3; avisos.push('Dura un poco más, pero vale la pena'); }
      if (c.p > P) { s -= 3; avisos.push('Se pasa un poquito del presupuesto'); }
      if (A_DISTANCIA.indexOf(c.id) !== -1) { s -= 3; avisos.push('Ideal si están lejos'); }

      var g, k, pi = 0, gComun = null, gSuyo = null, gMio = null;
      for (k = 0; k < c.i.length; k++) {
        g = c.i[k];
        if (comunes.indexOf(g) !== -1) { pi += 3; if (!gComun) gComun = g; }
        else if (suyos.indexOf(g) !== -1) { pi += 1.5; if (!gSuyo) gSuyo = g; }
        else if (mios.indexOf(g) !== -1) { pi += 1.5; if (!gMio) gMio = g; }
      }
      if (!union.length) pi = 3;
      s += Math.min(pi, 6);
      if (gComun) razones.push('A los dos les ' + gusta(gComun));
      else if (gSuyo) razones.push('A esa persona le ' + gusta(gSuyo) + ': punto para vos');
      else if (gMio) razones.push('Te ' + gusta(gMio) + ' y se va a notar');

      var dif = Math.abs(c.en - r.energia);
      s += dif === 0 ? 2 : (dif === 1 ? 1 : 0);
      if (dif === 0) razones.push(RAZON_ENERGIA[c.en]);

      if (r.lugar === 'igual' || c.l === 'ambos' || c.l === r.lugar) {
        s += 2;
        if (r.lugar !== 'igual' && c.l === r.lugar) razones.push(c.l === 'afuera' ? 'Al aire libre, como pidieron' : 'Bajo techo, como pidieron');
      }

      if (c.d === D) { s += 3; razones.push(RAZON_DURA[c.d]); }
      else if (c.d === D - 1) s += 2;
      else if (c.d < D) s += 1;

      if (c.p === P) { s += 3; if (c.p === 1) razones.push('Cuida la billetera'); }
      else if (c.p < P) { s += 2; razones.push('Cuesta menos de lo que pensabas gastar'); }

      var pct = Math.max(52, Math.min(99, Math.round(58 + 41 * s / MAX)));
      return { cita: c, puntos: s, pct: pct, razones: avisos.concat(razones).slice(0, 2) };
    });

    puntuadas.sort(function (a, b) { return b.puntos - a.puntos || a.cita.num - b.cita.num; });
    return puntuadas.slice(0, 10);
  }

  var TRAGAMONEDAS = {
    donde: ['En el living', 'En una plaza', 'En la terraza', 'En un mercado', 'Frente al agua', 'En la cocina', 'En un mirador', 'En una librería', 'En el balcón', 'En la vereda, con reposeras'],
    que: ['cocinen algo que ninguno sabe hacer', 'armen una playlist de 10 canciones cada uno', 'jueguen a las 20 preguntas', 'dibujen un retrato del otro en 5 minutos', 'hagan un picnic improvisado', 'planeen un viaje imaginario', 'miren fotos de cuando eran chicos', 'inventen un licuado con nombre propio', 'aprendan un baile de un video', 'escriban una carta para abrir en un año', 'armen un rompecabezas', 'prueben 3 snacks que nunca comieron'],
    giro: ['con música de los 80', 'sin celulares', 'con código de vestimenta ridículo', 'hablando con acento extranjero', 'con premio para quien pierda', 'a la luz de las velas', 'con cronómetro de 30 minutos', 'con 5 minutos de silencio total', 'con un brindis por algo chiquito', 'con una foto como prueba', 'decidiendo todo con una moneda', 'con sombrero obligatorio']
  };

  var FRASES = {
    directo: ['Me gustaría verte. ¿Te va {plan} el sábado?', 'Tengo ganas de {plan}, y de que sea con vos. ¿Qué día te queda bien?', 'Te propongo {plan} esta semana. Elegí el día y yo me encargo del resto.'],
    gracioso: ['Hice un análisis muy serio y la conclusión es que tenemos que ir a {plan}. ¿Cuándo?', 'Mi agenda está tremendamente libre para {plan} con vos. Mi dignidad, también.', 'Te propongo {plan}. Si sale mal, te debo un helado. Si sale bien, también.'],
    romantico: ['Hay un plan que me da vueltas hace días: {plan} con vos. ¿Te gustaría?', 'Me encantaría regalarte una tarde: {plan}, sin apuro. ¿Te sumás?', 'Pensé en vos cuando imaginé {plan}. ¿Lo hacemos realidad?'],
    timido: ['No me sale muy bien esto, pero... ¿te gustaría {plan} algún día?', 'Te escribo y borro hace un rato, así que va directo: ¿{plan} conmigo?', 'Sin presión: si algún día tenés ganas de {plan}, me encantaría que sea conmigo.']
  };

  var API = { ETAPAS: ETAPAS, PRESUP: PRESUP, DURA: DURA, LUGAR: LUGAR, ENERGIA: ENERGIA, GUSTOS: GUSTOS, CITAS: CITAS, recomendar: recomendar, TRAGAMONEDAS: TRAGAMONEDAS, FRASES: FRASES };
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
  else raiz.MCI = API;
})(this);
