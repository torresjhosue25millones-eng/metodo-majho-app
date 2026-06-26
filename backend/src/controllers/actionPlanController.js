const { initDb, nextId } = require('../database/init');

// 30-day plans for each vibration type
const PLANS = {
  I: {
    name: 'Plan Índigo', color: '#4B0082',
    days: [
      // SEMANA 1: Despertar y Conectar — despertar la consciencia de la mamá sobre
      // quién es su hijo/a energéticamente, y comenzar a conectar con sus ritmos.
      { week: 1, theme: 'Despertar y Conectar', title: 'El Primer Encuentro', emoji: '💙', duration_min: 25,
        morning: { duration_min: 10, activity: 'Antes de que se levante, respira tres veces y suelta cualquier expectativa del día. Cuando despierte, mírale a los ojos 10 segundos antes de hablar — solo para reconocer quién es hoy.' },
        afternoon: { duration_min: 10, activity: 'Dedica 10 minutos a observar a tu hijo/a sin intervenir: su energía, sus movimientos, su forma de explorar. No corrijas, no dirijas. Solo observa con amor.' },
        night: { duration_min: 5, activity: 'Antes de dormir, susúrrale: "Hoy te vi de verdad." Quédense en silencio un momento juntos.' },
        tip: 'Los niños Índigo necesitan límites claros pero también espacios sin reglas donde puedan simplemente ser. Ofrécele hoy 15 minutos sin ninguna instrucción.',
        mom_affirmation: 'Estoy aprendiendo a ver a mi hijo/a con ojos nuevos, sin el filtro de mis expectativas.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Su Mundo Interior', emoji: '🌀', duration_min: 25,
        morning: { duration_min: 10, activity: 'Durante el desayuno, pregúntale: "Si pudieras cambiar algo del mundo, ¿qué sería?" Escucha sin juzgar ni corregir la respuesta.' },
        afternoon: { duration_min: 10, activity: 'Invítalo/a a dibujar o construir algo que represente ese cambio que imaginó. No necesita tener sentido para ti — solo para él/ella.' },
        night: { duration_min: 5, activity: 'Repitan juntos en voz baja: "Mi visión importa y el mundo la necesita."' },
        tip: 'Evita la sobreestimulación de pantallas antes de dormir; los Índigo procesan ideas grandes y necesitan calma nocturna real.',
        mom_affirmation: 'La visión de mi hijo/a es valiosa, aunque todavía no comprenda todo su alcance.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Honrar su Intensidad', emoji: '🔥', duration_min: 25,
        morning: { duration_min: 10, activity: 'Si surge un momento de frustración intensa hoy, antes de calmarlo, di: "Veo que sientes esto muy fuerte." Dale 5 segundos de silencio para sentirse visto.' },
        afternoon: { duration_min: 10, activity: 'Ofrécele una actividad física donde pueda canalizar su energía: correr, golpear una almohada, bailar fuerte. La intensidad necesita salida, no represión.' },
        night: { duration_min: 5, activity: 'Antes de dormir, respiren juntos 5 veces lento, contando en voz alta. Es un ancla para su sistema nervioso.' },
        tip: 'Las comidas con mucha azúcar refinada pueden intensificar su energía ya elevada — prioriza proteína y vegetales en la cena.',
        mom_affirmation: 'La intensidad de mi hijo/a no es un problema a resolver, es una fuerza que aprendo a acompañar.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'El Porqué de Todo', emoji: '❓', duration_min: 25,
        morning: { duration_min: 10, activity: 'Cuando le pidas algo hoy, añade siempre el porqué: "Te pido esto porque..." Observa si su cooperación cambia.' },
        afternoon: { duration_min: 10, activity: 'Pregúntale una regla de la casa que no le parezca justa. Escucha su argumento completo antes de responder.' },
        night: { duration_min: 5, activity: 'Agradece en voz alta una cosa que él/ella te enseñó hoy sobre cuestionar el mundo.' },
        tip: 'Evita dar órdenes sin contexto esta semana; un Índigo que entiende el "por qué" coopera desde el respeto, no el miedo.',
        mom_affirmation: 'No necesito tener siempre la razón. Puedo explicar y también puedo escuchar.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Su Sentido de Justicia', emoji: '⚖️', duration_min: 25,
        morning: { duration_min: 10, activity: 'Crea un mini "consejo familiar" de 10 minutos esta mañana donde pueda nombrar algo que le parezca injusto en casa.' },
        afternoon: { duration_min: 10, activity: 'Juntos, elijan una acción pequeña y concreta para corregir esa injusticia, aunque sea simbólica.' },
        night: { duration_min: 5, activity: 'Dile: "Gracias por ayudarnos a ser más justos." Déjale sentir que su voz cambia las cosas.' },
        tip: 'Honra su sentido de justicia incluso cuando te incomode — es una de sus mayores fortalezas a largo plazo.',
        mom_affirmation: 'El sentido de justicia de mi hijo/a hará del mundo un lugar mejor. Lo apoyo, aunque a veces me desafíe.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Su Tribu de Almas', emoji: '🤝', duration_min: 25,
        morning: { duration_min: 10, activity: 'Pregúntale qué busca en un amigo/a de verdad. Anota sus palabras exactas.' },
        afternoon: { duration_min: 10, activity: 'Ayúdale a identificar, entre las personas de su vida, quién cumple esas cualidades. Hablen sobre cómo cultivar ese vínculo.' },
        night: { duration_min: 5, activity: 'Recuérdale: "Mereces amistades que te vean tal como eres."' },
        tip: 'Los Índigo prefieren pocos vínculos profundos a muchos superficiales — no fuerces la socialización amplia.',
        mom_affirmation: 'Confío en que mi hijo/a encontrará su tribu de almas en el momento correcto.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Celebrar la Semana 1', emoji: '🎉', duration_min: 25,
        morning: { duration_min: 10, activity: 'Escribe en tu diario 3 cosas nuevas que descubriste de tu hijo/a esta semana.' },
        afternoon: { duration_min: 10, activity: 'Comparte una de ellas con él/ella: "Esta semana aprendí que tú..." Observa su reacción.' },
        night: { duration_min: 5, activity: 'Cierren la semana con un abrazo largo y la frase: "Te veo. Te admiro. Sigo aprendiendo de ti."' },
        tip: 'Celebra los avances pequeños — el reconocimiento constante nutre la autoestima del niño/a Índigo más que cualquier premio.',
        mom_affirmation: 'Cada semana que elijo verlo/a de verdad, profundizo el amor entre nosotros.' },
      // SEMANA 2: Comprender y Honrar
      { week: 2, theme: 'Comprender y Honrar', title: 'El Líder que Es', emoji: '👑', reflection: '¿En qué espacios se muestra el liderazgo natural de mi hijo/a?', activity: 'Dale hoy una responsabilidad de liderazgo real: que organice una actividad familiar, que decida el menú de la cena o que resuelva un problema del hogar.', affirmation: 'Confío en la capacidad de liderazgo de mi hijo/a.', duration_min: 20 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Su Intuición es Real', emoji: '🔮', reflection: '¿Cuándo mi hijo/a tuvo una intuición que resultó ser correcta?', activity: 'Practica con tu hijo/a: "¿Cómo crees que se siente hoy...?" Sobre alguien de la familia. Luego confirma si su percepción era acertada. Valida su radar emocional.', affirmation: 'La intuición de mi hijo/a es un don que merece ser honrado.', duration_min: 15 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Libertad con Estructura', emoji: '🗽', reflection: '¿Qué estructuras en casa funcionan para mi hijo/a y cuáles generan constante conflicto?', activity: 'Negocia con tu hijo/a una rutina que él/ella ayude a diseñar. Que proponga los horarios para sus responsabilidades. Pruébalo una semana.', affirmation: 'La libertad con responsabilidad desarrolla su carácter.', duration_min: 25 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Canalizar la Rebeldía', emoji: '⚡', reflection: '¿A qué causa justa podría dedicar energía mi hijo/a esta semana?', activity: 'Ayuda a tu hijo/a a identificar una causa que le apasione: animales, medio ambiente, justicia social. Busquen juntos una acción concreta que puedan hacer hoy.', affirmation: 'La rebeldía de mi hijo/a transformada en acción cambia el mundo.', duration_min: 20 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Conversaciones Reales', emoji: '💬', reflection: '¿Cuándo fue la última conversación profunda que tuve con mi hijo/a?', activity: 'Apaga todas las pantallas esta noche. Pregunta a tu hijo/a: "¿Qué es lo que más te preocupa del mundo?" y "¿Qué es lo que más te da esperanza?" Escucha.', affirmation: 'Las conversaciones profundas son el alimento del alma de mi hijo/a.', duration_min: 30 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Su Inteligencia Única', emoji: '🧠', reflection: '¿En qué tipo de inteligencia brilla especialmente mi hijo/a?', activity: 'Identifica el estilo de aprendizaje de tu hijo/a y busca un recurso (libro, video, actividad) que se adapte a ese estilo. Ofrécesel sin presión.', affirmation: 'La inteligencia de mi hijo/a va más allá de las notas escolares.', duration_min: 20 },
      { week: 2, theme: 'Comprender y Honrar', title: 'El Espacio que Necesita', emoji: '🏠', reflection: '¿Tiene mi hijo/a un espacio físico que sienta completamente suyo?', activity: 'Crea o mejora el espacio personal de tu hijo/a. Deja que lo decore a su manera, sin imponer tu gusto. Un espacio propio es fundamental para el niño/a Índigo.', affirmation: 'Mi hijo/a necesita y merece su espacio sagrado.', duration_min: 30 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Celebrar la Semana 2', emoji: '✨', reflection: '¿Qué cambió en mi relación con mi hijo/a durante esta segunda semana?', activity: 'Escribe una carta corta a tu hijo/a (que puede guardar para leer cuando sea mayor) sobre lo que admiras de su forma de ver el mundo.', affirmation: 'El amor que le expreso hoy moldea su autoestima para siempre.', duration_min: 20 },
      // SEMANA 3: Transformar y Sanar
      { week: 3, theme: 'Transformar y Sanar', title: 'Mis Propias Heridas', emoji: '💊', reflection: '¿Qué de mi historia personal me dificulta entender a mi hijo/a Índigo?', activity: 'Escribe en tu diario: "Cuando mi hijo/a hace X, yo reacciono con Y porque en el fondo me recuerda a..."  Honra lo que sientas sin juzgarte.', affirmation: 'Sanar mis heridas es el acto de amor más grande hacia mi hijo/a.', duration_min: 25 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Disculpa Reparadora', emoji: '🙏', reflection: '¿Hay algún momento reciente donde reaccioné desde el miedo con mi hijo/a?', activity: 'Si puedes identificar un momento donde heriste a tu hijo/a, ofrece una disculpa real: "Cuando hice X, te lastimé. Lo siento. La próxima vez voy a..."', affirmation: 'Pedir disculpas a mi hijo/a le enseña integridad y dignidad.', duration_min: 15 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Límites desde el Amor', emoji: '🌊', reflection: '¿Mis límites nacen del control o del amor genuino?', activity: 'Elige un límite que genere conflicto con tu hijo/a. Reformúlalo desde el amor: en lugar de "No puedes hacer X", prueba "Entiendo que quieres X. No podemos porque... ¿Cómo lo resolvemos juntos?"', affirmation: 'Mis límites desde el amor crean seguridad, no resentimiento.', duration_min: 20 },
      { week: 3, theme: 'Transformar y Sanar', title: 'El Niño/a que Fui', emoji: '👶', reflection: '¿Qué necesitaba yo de niña que no recibí y que ahora puedo darle a mi hijo/a?', activity: 'Medita 5 minutos pensando en tu niña interior. Luego escríbele una carta ofreciéndole lo que necesitaba. Esto sana tu árbol genealógico y beneficia a tu hijo/a.', affirmation: 'Al sanar mi niña interior, libero a mi hijo/a de cargas que no son suyas.', duration_min: 25 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Regulación Emocional', emoji: '🌡️', reflection: '¿Cómo es mi regulación emocional cuando estoy bajo presión?', activity: 'Practica hoy la técnica STOP: Stop (para), Take a breath (respira), Observe (observa qué sientes), Proceed (actúa con intención). Úsala al menos una vez con tu hijo/a.', affirmation: 'Mi regulación emocional es el mayor regalo que le doy a mi hijo/a.', duration_min: 15 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Soltar el Control', emoji: '🎈', reflection: '¿En qué áreas intento controlar demasiado a mi hijo/a?', activity: 'Elige una cosa que normalmente controlas y suéltala hoy. Deja que tu hijo/a tome esa decisión de manera autónoma. Observa lo que pasa sin intervenir.', affirmation: 'Soltar el control no es abandono, es confianza en el alma de mi hijo/a.', duration_min: 20 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Celebrar la Semana 3', emoji: '🌸', reflection: '¿Qué transformación observo en mí y en mi relación con mi hijo/a?', activity: 'Crea un ritual de gratitud con tu hijo/a: nombren juntos 3 cosas que agradecen de la semana y una cosa que aprendieron.', affirmation: 'Cada semana que practico el amor consciente, cambia el destino de mi familia.', duration_min: 20 },
      // SEMANA 4: Celebrar e Integrar
      { week: 4, theme: 'Celebrar e Integrar', title: 'Su Misión de Vida', emoji: '🚀', reflection: '¿Qué crees que vino a transformar tu hijo/a en este mundo?', activity: 'Habla con tu hijo/a sobre la idea de misión de vida. Pregúntale: "¿Qué harías si supieras que no puedes fallar?" Escucha y celebra su respuesta.', affirmation: 'Mi hijo/a vino a este mundo con un propósito sagrado que apoyo con todo mi amor.', duration_min: 25 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Ambiente que Florece', emoji: '🌿', reflection: '¿El entorno de mi hijo/a potencia o limita sus dones?', activity: 'Evalúa juntos la escuela, actividades y círculo social de tu hijo/a. ¿Hay algo que cambiar para que tenga un ambiente más favorable a sus dones?', affirmation: 'Creo el ambiente donde los dones de mi hijo/a pueden florecer.', duration_min: 25 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'La Causa que Mueve', emoji: '🌍', reflection: '¿Qué proyecto o causa le daría sentido y propósito a mi hijo/a hoy?', activity: 'Ayuda a tu hijo/a a iniciar un proyecto pequeño pero significativo: un jardín, ayudar en un refugio, crear algo para compartir. Que sea de su elección.', affirmation: 'Apoyo la acción de mi hijo/a en el mundo con confianza y alegría.', duration_min: 30 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Autenticidad Total', emoji: '💎', reflection: '¿Mi hijo/a puede ser completamente auténtico/a conmigo sin miedo al juicio?', activity: 'Dile a tu hijo/a: "Puedes contarme cualquier cosa. No voy a juzgarte. Solo estoy aquí para escucharte." Crea ese espacio de seguridad total hoy.', affirmation: 'En mi presencia, mi hijo/a puede ser completamente él/ella misma.', duration_min: 20 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Rituales de Conexión', emoji: '🕯️', reflection: '¿Qué ritual semanal podría crear con mi hijo/a que los conecte profundamente?', activity: 'Diseña con tu hijo/a un ritual semanal único para los dos: puede ser un desayuno especial, una caminata nocturna, un juego secreto. Que sea solo de ustedes dos.', affirmation: 'Los rituales de amor crean memorias que sostienen el alma de mi hijo/a.', duration_min: 20 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'El Guerrero de Luz', emoji: '⚔️', reflection: '¿Cómo ha cambiado mi visión de mi hijo/a Índigo en estos 30 días?', activity: 'Crea un "diploma de honor" para tu hijo/a que celebre sus cualidades Índigo específicas. Léeselo en voz alta mirándole a los ojos.', affirmation: 'Mi hijo/a Índigo es exactamente quien el mundo necesita. Lo honro con todo mi amor.', duration_min: 20 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Celebrar la Semana 4', emoji: '🏆', reflection: '¿Qué promesa le hago a mi hijo/a para los próximos 30 días?', activity: 'Haz una promesa concreta a tu hijo/a y escríbela juntos. Una promesa realista que puedas cumplir. Pégala en un lugar visible de la casa.', affirmation: 'Mi compromiso con el camino consciente es el mayor acto de amor de mi vida.', duration_min: 25 },
      // Días 29-30
      { week: 5, theme: 'Tu Legado Comienza', title: 'Carta a mi Hijo/a Futuro', emoji: '📜', reflection: '¿Cómo imagino a mi hijo/a Índigo en 10 años si cultivo sus dones hoy?', activity: 'Escribe una carta a tu hijo/a de 10 años en el futuro. Descríbele el ser increíble que se está convirtiendo. Guarda la carta para dársela en esa fecha.', affirmation: 'Las semillas que siembro hoy florecen en el ser que mi hijo/a está destinado a ser.', duration_min: 30 },
      { week: 5, theme: 'Tu Legado Comienza', title: 'El Próximo Capítulo', emoji: '🌅', reflection: '¿Cuál es el próximo paso en mi camino como mamá consciente de un Índigo?', activity: 'Define 3 intenciones concretas para los próximos 30 días de crianza consciente. Compártelas con alguien de confianza para que te apoye en el proceso.', affirmation: 'Este es solo el comienzo. Mi camino sagrado continúa con amor, valentía y consciencia.', duration_min: 20 },
    ],
  },
  C: {
    name: 'Plan Cristal', color: '#9B8EC4',
    days: [
      { week: 1, theme: 'Despertar y Conectar', title: 'La Sensibilidad como Don', emoji: '💜', duration_min: 25,
        morning: { duration_min: 10, activity: 'Antes de empezar el día, pregúntale cómo se siente su cuerpo hoy — no qué planes tiene, sino cómo está su energía.' },
        afternoon: { duration_min: 10, activity: 'Creen juntos un "refugio de calma": un rincón con almohadas suaves, luz tenue y sus objetos favoritos, al que pueda ir cuando lo necesite.' },
        night: { duration_min: 5, activity: 'Antes de dormir, pregúntale: "¿Qué sentiste hoy que fue demasiado?" Solo escucha, sin resolver.' },
        tip: 'Evita ambientes ruidosos o muy iluminados antes de dormir — los niños Cristal absorben estímulos intensamente.',
        mom_affirmation: 'La sensibilidad de mi hijo/a es un don espiritual que aprendo a proteger, no a corregir.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Mundo Energético', emoji: '🌊', duration_min: 25,
        morning: { duration_min: 10, activity: 'Observa en qué ambientes parece más tranquilo/a tu hijo/a hoy y anótalo.' },
        afternoon: { duration_min: 10, activity: 'Anota también dónde parece agotarse más. Al final del día, comparen el mapa juntos: "Me recargo en... me agoto en..."' },
        night: { duration_min: 5, activity: 'Agradece en voz alta el lugar que más paz le dio hoy.' },
        tip: 'Reduce el ruido de fondo (TV, conversaciones tensas) durante las comidas; el sistema nervioso Cristal necesita silencio para digerir bien.',
        mom_affirmation: 'Cuido el campo energético de mi hogar como cuido el corazón de mi hijo/a.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'El Lenguaje del Amor', emoji: '🫂', duration_min: 25,
        morning: { duration_min: 10, activity: 'Pregúntale: "¿Cuál es tu cosa favorita que hacemos juntos?" Su respuesta revela cómo prefiere recibir amor.' },
        afternoon: { duration_min: 10, activity: 'Haz exactamente esa actividad con él/ella hoy, con toda tu atención puesta ahí, sin distracciones.' },
        night: { duration_min: 5, activity: 'Dale amor en su lenguaje identificado: un abrazo largo, una palabra tierna, o simplemente tu presencia callada.' },
        tip: 'Los niños Cristal sienten más el tono de voz que las palabras — cuida cómo dices las cosas, no solo qué dices.',
        mom_affirmation: 'Aprendo a amar a mi hijo/a en el idioma que su alma realmente comprende.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Sus Conexiones Especiales', emoji: '🐱', duration_min: 25,
        morning: { duration_min: 10, activity: 'Lleven una planta, mascota o foto de la naturaleza a la mesa del desayuno y hablen de animales o lugares que ama.' },
        afternoon: { duration_min: 10, activity: 'Visiten un parque o espacio natural. Déjalo/a liderar la exploración sin apurarlo.' },
        night: { duration_min: 5, activity: 'Pregúntale qué fue lo que más le gustó de la naturaleza hoy y agradézcanlo juntos.' },
        tip: 'La conexión con la naturaleza regula profundamente el sistema nervioso de un niño/a Cristal — priorízala sobre actividades en interiores esta semana.',
        mom_affirmation: 'Honro la conexión de mi hijo/a con la naturaleza como parte esencial de su bienestar.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Lo que Absorbe', emoji: '🧽', duration_min: 25,
        morning: { duration_min: 10, activity: 'Antes de que tu hijo/a despierte, revisa el "clima emocional" de tu hogar: ¿hay tensión sin resolver? Suaviza lo que puedas.' },
        afternoon: { duration_min: 10, activity: 'Evita exponerlo a noticias pesadas o conversaciones de adultos cargadas de estrés hoy.' },
        night: { duration_min: 5, activity: 'Hagan un pequeño ritual de "soltar": sacudir las manos juntos, como si soltaran lo absorbido del día.' },
        tip: 'Reduce una fuente de energía densa en casa esta semana — una conversación tensa recurrente, ruido excesivo, o caos visual.',
        mom_affirmation: 'Mi estado interior es el clima de mi hogar. Hoy elijo cuidar mi propia calma por el bienestar de mi hijo/a.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Tiempo de Recarga', emoji: '🔋', duration_min: 25,
        morning: { duration_min: 10, activity: 'Pregúntale cuánto tiempo solo/a necesita hoy para sentirse bien, y respeta esa respuesta sin negociarla.' },
        afternoon: { duration_min: 10, activity: 'Protege ese tiempo de soledad sin llenarlo de actividades — déjalo/a simplemente estar, sin productividad.' },
        night: { duration_min: 5, activity: 'Antes de dormir, agradécele por cuidar su propia energía hoy.' },
        tip: 'No interpretes su necesidad de soledad como rechazo — es autorregulación, no desconexión.',
        mom_affirmation: 'El tiempo de soledad de mi hijo/a es sagrado, igual que el mío.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Celebrar la Semana 1', emoji: '🎉', duration_min: 25,
        morning: { duration_min: 10, activity: 'Escribe 3 momentos de esta semana donde la sensibilidad de tu hijo/a fue una fortaleza.' },
        afternoon: { duration_min: 10, activity: 'Compártelas con él/ella una por una, mirándole a los ojos.' },
        night: { duration_min: 5, activity: 'Cierren la semana abrazados en silencio por un minuto completo.' },
        tip: 'Celebra la sensibilidad en voz alta esta semana — el mundo a menudo le dice que es "demasiado"; tu hogar debe decirle lo contrario.',
        mom_affirmation: 'Cada semana aprendo a honrar más profundamente el alma sensible de mi hijo/a.' },
      { week: 2, theme: 'Comprender y Honrar', title: 'Su Arte Interior', emoji: '🎨', reflection: '¿Qué forma de expresión artística le hace brillar más?', activity: 'Facilita hoy una sesión de arte libre: pintura, música, arcilla, danza. Sin instrucciones, sin resultado esperado. Solo expresión pura.', affirmation: 'El arte es el idioma del alma de mi hijo/a. Lo nutro con espacio y materiales.', duration_min: 45 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Límites Energéticos', emoji: '🛡️', reflection: '¿Sabe mi hijo/a decir "no" cuando algo le drena la energía?', activity: 'Enseña hoy a tu hijo/a la técnica del "escudo de luz": visualizar una burbuja de luz dorada que los protege de energías pesadas. Practica juntos.', affirmation: 'Mi hijo/a tiene el derecho y el poder de proteger su campo energético.', duration_min: 20 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Las Emociones de Otros', emoji: '🌈', reflection: '¿Cómo reconocer cuando mi hijo/a está sintiendo emociones que no son suyas?', activity: 'Enseña a tu hijo/a la pregunta mágica: "¿Esta emoción es mía o la capté de alguien más?" Si no es suya, sacúdase las manos y suéltenla juntos.', affirmation: 'Mi hijo/a puede sentir todo con amor y aun así saber quién es.', duration_min: 20 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Animales y Sanación', emoji: '🦋', reflection: '¿Cómo podría integrar más la conexión de mi hijo/a con los animales en su vida?', activity: 'Visita un refugio de animales, cuida una planta especial juntos, o simplemente observen pájaros en el parque. Honra esa conexión sagrada.', affirmation: 'A través de los animales, mi hijo/a se conecta con la sabiduría del planeta.', duration_min: 40 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Sobreestimulación', emoji: '🔇', reflection: '¿Cuáles son las señales de que mi hijo/a está sobreestimulado/a?', activity: 'Aprende a reconocer las señales de sobreestimulación de tu hijo/a específico. Hoy practica intervenir ANTES de que llegue al límite, no después.', affirmation: 'Anticipo las necesidades de mi hijo/a y creo espacios de paz proactivamente.', duration_min: 15 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Rituales de Limpieza', emoji: '🌿', reflection: '¿Qué rituales de limpieza energética podríamos tener en nuestra familia?', activity: 'Crea un ritual de limpieza para después de la escuela: sal gruesa en la entrada, incienso, música suave, 5 minutos de silencio antes de hacer actividades. Hazlo hoy.', affirmation: 'Los rituales de limpieza protegen la sensibilidad sagrada de mi hijo/a.', duration_min: 20 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Celebrar la Semana 2', emoji: '✨', reflection: '¿Qué ritual o práctica nueva incorporé esta semana que le beneficia a mi hijo/a?', activity: 'Crea con tu hijo/a un "libro de sus dones Cristal": decoren un cuaderno juntos y escriban dentro sus cualidades especiales.', affirmation: 'Celebro los dones únicos de mi hijo/a Cristal con orgullo y amor.', duration_min: 30 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Mi Propia Sensibilidad', emoji: '💊', reflection: '¿Cómo fue mi propia sensibilidad tratada en mi infancia?', activity: 'Escribe sobre cómo tu familia trató tu sensibilidad cuando eras niña. ¿La honraron o la minimizaron? ¿Qué sanación necesitas en relación a esto?', affirmation: 'Al honrar mi propia sensibilidad, libero a mi hijo/a de repetir mi historia.', duration_min: 25 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Cuando Dije "No Llores"', emoji: '😢', reflection: '¿Cuántas veces intenté detener el llanto de mi hijo/a en lugar de acompañarlo?', activity: 'La próxima vez que tu hijo/a llore hoy, en lugar de detenerlo di: "Aquí estoy. Puedes llorar. Estoy contigo." Siéntate cerca sin intentar resolver ni calmar.', affirmation: 'Las lágrimas de mi hijo/a son sagradas. No las detengo, las acompaño.', duration_min: 15 },
      { week: 3, theme: 'Transformar y Sanar', title: 'El Trauma del Volumen', emoji: '🔊', reflection: '¿Cuánto ruido y caos hay en el ambiente de mi hijo/a en un día normal?', activity: 'Calcula el "nivel de ruido" de tu hogar. Establece al menos 30 minutos de silencio intencional durante el día. Sin TV, sin música, sin conversaciones altas.', affirmation: 'El silencio es el alimento más nutritivo para el alma de mi hijo/a Cristal.', duration_min: 30 },
      { week: 3, theme: 'Transformar y Sanar', title: 'La Telepatía Familiar', emoji: '📡', reflection: '¿Mi hijo/a sabe cosas que no debería saber de manera lógica?', activity: 'Practica hoy la comunicación intuitiva: en silencio, envíale mentalmente a tu hijo/a un color o imagen. Luego pregúntale qué recibió. Valida su percepción.', affirmation: 'La telepatía de mi hijo/a es un don que honro con respeto.', duration_min: 15 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Sanando Juntos', emoji: '🌱', reflection: '¿Hay alguna herida emocional compartida entre mi hijo/a y yo que necesite sanar?', activity: 'Busca un profesional (terapeuta, consteladora) si hay algo que sientes que necesita un acompañamiento más profundo. Dar ese paso es un acto de valentía y amor.', affirmation: 'Pedir ayuda cuando la necesito es señal de fortaleza, no de debilidad.', duration_min: 15 },
      { week: 3, theme: 'Transformar y Sanar', title: 'La Música que Sana', emoji: '🎵', reflection: '¿Qué música calma, carga o inspira a mi hijo/a?', activity: 'Crea una "playlist del alma" con tu hijo/a: canciones que los calman, que los alegran, que los llenan de energía. Úsenla conscientemente durante el día.', affirmation: 'La música es medicina para el alma sensible de mi hijo/a.', duration_min: 30 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Celebrar la Semana 3', emoji: '🌸', reflection: '¿Qué transformación noto en el ambiente emocional de mi hogar?', activity: 'Preparen juntos una ceremonia de limpieza del hogar: velas, sahumerio o agua con sal, con intención de renovar la energía del espacio familiar.', affirmation: 'Mi hogar es un templo de amor y paz para el alma sensible de mi hijo/a.', duration_min: 30 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'El Sanador que Es', emoji: '✨', reflection: '¿En qué situaciones has visto a tu hijo/a sanar con su presencia o palabras?', activity: 'Cuéntale a tu hijo/a sobre una vez que lo viste sanar a alguien (o a ti) simplemente con su presencia. Nombra ese don específicamente.', affirmation: 'Mi hijo/a es un sanador/a de almas. Lo veo, lo nombro y lo celebro.', duration_min: 20 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Cristales y Naturaleza', emoji: '💎', reflection: '¿Qué cristales o elementos naturales resuenan más con mi hijo/a?', activity: 'Visita una tienda de cristales con tu hijo/a y deja que elija uno por intuición. Explícale las propiedades y creen juntos un ritual de activación.', affirmation: 'Honro la conexión de mi hijo/a con los reinos naturales y minerales.', duration_min: 45 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Su Vida Social Consciente', emoji: '🫶', reflection: '¿El círculo social de mi hijo/a lo nutre o lo drena?', activity: 'Evalúa con tu hijo/a sus amistades usando la pregunta: "¿Cuando estás con...? ¿Cómo te sientes después?" Ayúdale a identificar sus relaciones nutritivas.', affirmation: 'Mi hijo/a tiene el derecho de rodearse solo de energías que lo nutran.', duration_min: 20 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Dejar Ir el Exceso', emoji: '🎈', reflection: '¿De qué actividades, compromisos o relaciones podría liberar a mi hijo/a?', activity: 'Simplifica la agenda de tu hijo/a. Los niños Cristal necesitan espacios vacíos. Elimina al menos una actividad extracurricular si tienes demasiadas.', affirmation: 'El tiempo libre y el silencio son sagrados para mi hijo/a.', duration_min: 15 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Ritual de Gratitud', emoji: '🙏', reflection: '¿Por qué 3 características de mi hijo/a Cristal estoy más agradecida?', activity: 'Escribe y comparte con tu hijo/a una lista de 10 dones que has descubierto en él/ella durante estos 30 días. Léelos en voz alta mientras le miras a los ojos.', affirmation: 'Soy inmensamente afortunada de ser la mamá de este ser de luz Cristal.', duration_min: 20 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'El Próximo Nivel', emoji: '🌟', reflection: '¿Qué práctica de protección energética me comprometo a mantener para mi hijo/a?', activity: 'Diseña un "protocolo de energía" para tu familia: qué hacen al llegar a casa, cómo limpian el espacio, cómo se protegen antes de eventos sociales grandes.', affirmation: 'Soy la guardiana amorosa del campo energético de mi familia.', duration_min: 25 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Celebrar la Semana 4', emoji: '🏆', reflection: '¿Cuál es la transformación más grande que experimenté como mamá en estos 28 días?', activity: 'Celebra con tu hijo/a estos 28 días. Preparen juntos algo especial: una cena, un paseo, una actividad que él/ella elija.', affirmation: 'Cada día que practico la crianza consciente, transformo el linaje de mi familia.', duration_min: 60 },
      { week: 5, theme: 'Tu Legado Comienza', title: 'Carta para el Futuro', emoji: '📜', reflection: '¿Qué quiero que recuerde mi hijo/a Cristal de su infancia?', activity: 'Escribe una carta a tu hijo/a describiendo la persona luminosa que ya es y la que está destinada a ser. Guárdala para compartirla en un momento especial.', affirmation: 'El amor consciente que doy hoy forma el alma de mi hijo/a para toda la vida.', duration_min: 30 },
      { week: 5, theme: 'Tu Legado Comienza', title: 'El Siguiente Capítulo', emoji: '🌅', reflection: '¿Cuál es mi siguiente paso en este camino de crianza consciente?', activity: 'Define 3 intenciones para los próximos 30 días. Escríbelas, fírmalas y pégalas donde puedas verlas cada mañana.', affirmation: 'Mi camino como mamá consciente de un Cristal apenas comienza. Lo recorro con amor y sabiduría.', duration_min: 20 },
    ],
  },
  A: {
    name: 'Plan Arcoíris', color: '#E8A4B8',
    days: [
      { week: 1, theme: 'Despertar y Conectar', title: 'La Alegría como Medicina', emoji: '🌈', duration_min: 25,
        morning: { duration_min: 10, activity: 'Empiecen el día con algo que los haga reír genuinamente: un chiste, un video, cosquillas.' },
        afternoon: { duration_min: 10, activity: 'Dedica 10 minutos a una actividad puramente divertida, sin objetivo productivo.' },
        night: { duration_min: 5, activity: 'Pregúntale cuál fue el momento más alegre del día y revívanlo juntos en palabras.' },
        tip: 'La risa compartida regula el sistema nervioso de toda la familia — no la subestimes como "solo diversión".',
        mom_affirmation: 'La alegría de mi hijo/a es medicina. Hoy elijo recibirla sin apurarla.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'El Dador Natural', emoji: '🎁', duration_min: 25,
        morning: { duration_min: 10, activity: 'Observa cómo tu hijo/a comparte espontáneamente hoy — comida, ayuda, abrazos.' },
        afternoon: { duration_min: 10, activity: 'Nombra en voz alta cada acto de generosidad que veas: "Vi que compartiste tu juguete. Eso fue hermoso."' },
        night: { duration_min: 5, activity: 'Agradécele específicamente por un gesto generoso de hoy.' },
        tip: 'Enséñale también a recibir, no solo a dar — pregúntale qué necesita él/ella hoy.',
        mom_affirmation: 'La generosidad natural de mi hijo/a es un regalo que el mundo necesita ver.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Energía en Movimiento', emoji: '⚡', duration_min: 25,
        morning: { duration_min: 10, activity: 'Antes de cualquier tarea, dale 10 minutos de movimiento libre: bailar, saltar, correr sin reglas.' },
        afternoon: { duration_min: 10, activity: 'Repite ese movimiento libre por la tarde — su energía necesita salida regular, no contención.' },
        night: { duration_min: 5, activity: 'Una respiración profunda y lenta antes de dormir para bajar revoluciones.' },
        tip: 'Evita largos periodos sentado/a sin movimiento — un Arcoíris con energía contenida se vuelve irritable, no porque esté mal, sino porque necesita moverse.',
        mom_affirmation: 'El movimiento es el lenguaje sagrado del cuerpo de mi hijo/a. Lo honro sin pedirle que se "calme" todo el tiempo.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'El Color de su Alma', emoji: '🎨', duration_min: 25,
        morning: { duration_min: 10, activity: 'Déjalo/a elegir los colores de su ropa o su desayuno hoy, sin intervenir en su elección.' },
        afternoon: { duration_min: 10, activity: 'Hagan juntos una actividad de arte con colores libres: pintura, plastilina, dibujo.' },
        night: { duration_min: 5, activity: 'Pregúntale qué color representa cómo se sintió hoy y por qué.' },
        tip: 'Rodéalo de colores vivos en su espacio — los niños Arcoíris vibran visualmente con la paleta de su entorno.',
        mom_affirmation: 'Los colores son la música visual del alma de mi hijo/a. La celebro.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Inclusión Natural', emoji: '🤗', duration_min: 25,
        morning: { duration_min: 10, activity: 'Habla con tu hijo/a sobre alguien que esté solo o triste en su entorno (escuela, familia).' },
        afternoon: { duration_min: 10, activity: 'Anímalo/a a hacer un gesto de inclusión hoy: invitar a jugar, sentarse junto a alguien solo.' },
        night: { duration_min: 5, activity: 'Si lo hizo, nómbralo: "Vi que incluiste a alguien hoy. Eso fue un acto de amor."' },
        tip: 'Su corazón inclusivo es una fortaleza social rara — protégela de quienes intenten aprovecharse de su generosidad.',
        mom_affirmation: 'El corazón de mi hijo/a no deja a nadie fuera. Es amor en acción.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'La Recuperación Rápida', emoji: '🌟', duration_min: 25,
        morning: { duration_min: 10, activity: 'Si surge una emoción difícil hoy, acompáñala sin apurar su resolución: "Eso duele. Estoy aquí."' },
        afternoon: { duration_min: 10, activity: 'Deja que su naturaleza alegre procese la emoción a su propio ritmo, sin forzar que "ya esté bien".' },
        night: { duration_min: 5, activity: 'Reconoce su resiliencia: "Viste cómo lo superaste hoy. Eso es fortaleza."' },
        tip: 'No apresures su proceso emocional solo porque suele recuperarse rápido — déjale sentir todo lo que necesite sentir.',
        mom_affirmation: 'Mi hijo/a tiene una resiliencia natural extraordinaria, y también merece tiempo para sentir.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Celebrar la Semana 1', emoji: '🎉', duration_min: 25,
        morning: { duration_min: 10, activity: 'Empiecen un "diario de alegrías": un cuaderno donde anoten juntos algo que los hizo sonreír cada día.' },
        afternoon: { duration_min: 10, activity: 'Escriban hoy la primera entrada juntos, recordando momentos de la semana.' },
        night: { duration_min: 5, activity: 'Lean en voz alta lo que escribieron y agradezcan la semana juntos.' },
        tip: 'Cultivar la alegría conscientemente (no solo esperar que pase) fortalece su don natural sin agotarlo.',
        mom_affirmation: 'La alegría es una práctica sagrada que cultivo con intención en mi familia.' },
      { week: 2, theme: 'Comprender y Honrar', title: 'El Sanador Alegre', emoji: '✨', reflection: '¿Cómo cambia la energía de una habitación cuando entra mi hijo/a?', activity: 'Observa hoy el efecto que tiene la presencia de tu hijo/a en otros: en la familia, en extraños. Nómbralo: "¿Viste cómo esa señora sonrió cuando te acercaste?"', affirmation: 'Mi hijo/a tiene el don de elevar la vibración de todo espacio que habita.', duration_min: 15 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Discernimiento Amoroso', emoji: '🔍', reflection: '¿Sabe mi hijo/a identificar cuando alguien toma de su energía sin dar nada a cambio?', activity: 'Habla con tu hijo/a sobre las relaciones nutritivas vs drenantes. Usa metáforas simples: "Hay personas que te llenan como un vaso y hay otras que lo vacían. ¿Cuáles tienes en tu vida?"', affirmation: 'Mi hijo/a puede dar desde el amor sin perder su propio corazón.', duration_min: 20 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Creatividad sin Límites', emoji: '🎭', reflection: '¿Qué proyectos creativos ha querido hacer mi hijo/a que yo no le he dado el tiempo o espacio?', activity: 'Deja que hoy tu hijo/a emprenda un proyecto creativo sin interferencia. Puede ser construir algo, crear una historia, hacer una obra de teatro. Tú solo observas y aplaudes.', affirmation: 'La creatividad de mi hijo/a es infinita y merece espacio para desplegarse.', duration_min: 60 },
      { week: 2, theme: 'Comprender y Honrar', title: 'El Amor que Da Sin Pedir', emoji: '💝', reflection: '¿Hay momentos donde la generosidad de mi hijo/a lo pone en desventaja?', activity: 'Enseña a tu hijo/a que dar desde el corazón es hermoso, pero que también debe darse a sí mismo/a. Practiquen juntos el autoamor: un abrazo a sí mismo, una frase de amor propia.', affirmation: 'Mi hijo/a se ama a sí mismo/a y desde ese amor da a los demás.', duration_min: 15 },
      { week: 2, theme: 'Comprender y Honrar', title: 'La Tierra como Hogar', emoji: '🌍', reflection: '¿Cómo expresa mi hijo/a su amor por el planeta?', activity: 'Hagan un acto de amor por la Tierra hoy: plantar algo, limpiar un espacio natural, reducir plásticos. Los Arcoíris son sanadores del planeta.', affirmation: 'Mi hijo/a tiene un amor innato por la Tierra que cultivo y honro.', duration_min: 30 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Juego Sagrado', emoji: '🎮', reflection: '¿El juego de mi hijo/a suele incluir a todos o es más solitario?', activity: 'Organiza un juego inclusivo donde tu hijo/a sea el líder: él/ella diseña las reglas, el equipo y la actividad. Sigue su liderazgo alegre con total confianza.', affirmation: 'A través del juego, mi hijo/a enseña al mundo cómo convivir en armonía.', duration_min: 30 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Celebrar la Semana 2', emoji: '🌸', reflection: '¿Qué nueva faceta del don de mi hijo/a descubrí esta semana?', activity: 'Prepara una "fiesta de reconocimiento" para tu hijo/a en casa: su comida favorita, sus canciones, un pequeño discurso tuyo celebrando quién es.', affirmation: 'Celebrar a mi hijo/a regularmente nutre su autoestima y su misión.', duration_min: 60 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Cuando la Alegría Esconde', emoji: '🎭', reflection: '¿Hay momentos donde mi hijo/a usa la alegría para no mostrar su dolor?', activity: 'Pregúntale hoy a tu hijo/a: "¿Hay algo que te esté molestando o entristeciendo que no me hayas contado?" Crea un espacio de seguridad total para esa respuesta.', affirmation: 'Mi hijo/a puede mostrarme toda su gama emocional, no solo su alegría.', duration_min: 20 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Mi Propia Alegría', emoji: '🌻', reflection: '¿Qué tan presente está la alegría genuina en mi propia vida?', activity: 'Haz hoy algo que te genere alegría genuina, completamente para ti. Tu hijo/a Arcoíris necesita ver que la alegría adulta también es posible y real.', affirmation: 'Mi alegría auténtica es el mejor modelo que puedo darle a mi hijo/a.', duration_min: 30 },
      { week: 3, theme: 'Transformar y Sanar', title: 'El Límite Amoroso', emoji: '🌊', reflection: '¿Me cuesta establecer límites porque no quiero que mi hijo/a deje de ser feliz?', activity: 'Establece hoy un límite que has venido postergando. Hazlo con amor y firmeza: "Te quiero tanto que te pido esto." La firmeza amorosa no apaga la alegría, la sostiene.', affirmation: 'Los límites amorosos dan estructura al corazón generoso de mi hijo/a.', duration_min: 15 },
      { week: 3, theme: 'Transformar y Sanar', title: 'No Todo es Felicidad', emoji: '🌧️', reflection: '¿Cómo reacciono cuando mi hijo/a no está alegre o tiene un mal día?', activity: 'Normaliza el mal humor con tu hijo/a: "Hoy no tienes ganas de estar alegre, y eso está bien. No tienes que ser feliz todo el tiempo." Valida su humanidad completa.', affirmation: 'Mi hijo/a tiene permiso de ser humano/a en toda su gama emocional.', duration_min: 15 },
      { week: 3, theme: 'Transformar y Sanar', title: 'La Energía que Protege', emoji: '🛡️', reflection: '¿Sabe mi hijo/a cuándo ha dado suficiente y necesita recargarse?', activity: 'Enséñale a tu hijo/a señales de que ya dio suficiente hoy: "Cuando te sientas vacío/a o malhumorado/a, eso significa que necesitas recargarte." Busquen juntos sus formas favoritas de recarga.', affirmation: 'Enseño a mi hijo/a a dar desde la abundancia, nunca desde el vacío.', duration_min: 20 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Sanando el Ancestro', emoji: '🌿', reflection: '¿Qué patrones de tristeza oculta o alegría fingida vienen de mi árbol familiar?', activity: 'Reflexiona sobre la historia emocional de tu familia: ¿era permitido estar triste? ¿Se esperaba que todos estuviéramos contentos? Escribe sobre ello en tu diario.', affirmation: 'Rompo los patrones de mi linaje al permitirme y permitirle a mi hijo/a sentir todo.', duration_min: 25 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Celebrar la Semana 3', emoji: '🌸', reflection: '¿Qué transformación noto en la vida emocional de mi hijo/a?', activity: 'Creen juntos un mural de emociones: papel grande, pinturas, y que pinten cómo se han sentido durante estas 3 semanas. Honren todos los colores, todos los sentimientos.', affirmation: 'Las emociones son el lenguaje del alma. Todas son bienvenidas en mi hogar.', duration_min: 45 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'El Legado de la Alegría', emoji: '🌟', reflection: '¿Cómo imagino el impacto de mi hijo/a en el mundo dentro de 20 años?', activity: 'Crea con tu hijo/a un "mapa de sueños": un collage o dibujo de cómo imagina que el mundo será mejor gracias a sus acciones. Sin límites de imaginación.', affirmation: 'Mi hijo/a llegó a hacer del mundo un lugar más alegre y amoroso.', duration_min: 45 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'La Comunidad que Crea', emoji: '🤝', reflection: '¿Hay una comunidad que mi hijo/a podría ayudar a crear o a unir?', activity: 'Ayuda a tu hijo/a a organizar un evento simple donde pueda reunir a personas: una merienda con vecinos, un juego en el parque, una causa solidaria pequeña.', affirmation: 'Mi hijo/a tiene el don de crear comunidad y pertenencia donde va.', duration_min: 90 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Abundancia y Gratitud', emoji: '🌻', reflection: '¿Tenemos una práctica de gratitud en familia?', activity: 'Inaugura hoy una práctica de gratitud familiar: cada noche en la cena, cada uno dice una cosa que agradece del día. Mi hijo/a Arcoíris liderará esto naturalmente.', affirmation: 'La gratitud es el imán de la abundancia. La practico con mi familia cada día.', duration_min: 10 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'El Amor que Transforma', emoji: '💫', reflection: '¿Cómo ha transformado a nuestra familia tener un Arcoíris entre nosotros?', activity: 'Pide a cada miembro de la familia que comparta cómo la presencia de tu hijo/a Arcoíris ha cambiado su vida para mejor. Hagan un círculo de amor y gratitud.', affirmation: 'Mi hijo/a es una bendición que transformó a toda nuestra familia.', duration_min: 30 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Rituales de Alegría', emoji: '🎊', reflection: '¿Qué rituales de alegría podemos establecer como familia permanentemente?', activity: 'Diseña con tu familia 3 rituales de alegría permanentes: uno diario, uno semanal y uno mensual. Que tu hijo/a Arcoíris sea el guardián de esos rituales.', affirmation: 'La alegría es una práctica sagrada que cultivo conscientemente en mi familia.', duration_min: 25 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Celebrar la Semana 4', emoji: '🏆', reflection: '¿Quién soy yo hoy como mamá, comparada con quien era hace 28 días?', activity: 'Organiza una celebración real con tu hijo/a y si puedes con la familia. Celebren estos 30 días de consciencia. Que sea una fiesta llena de colores y alegría.', affirmation: 'Me comprometo a ser la mamá consciente que mi hijo/a Arcoíris merece y necesita.', duration_min: 90 },
      { week: 5, theme: 'Tu Legado Comienza', title: 'Carta al Mundo', emoji: '📜', reflection: '¿Qué mensaje le daría mi hijo/a al mundo si tuviera un micrófono?', activity: 'Ayuda a tu hijo/a a escribir o dibujar su "carta al mundo": qué quiere que todos sepan, qué quiere que cambie, qué quiere aportar.', affirmation: 'La voz de mi hijo/a Arcoíris es un regalo que el mundo necesita escuchar.', duration_min: 30 },
      { week: 5, theme: 'Tu Legado Comienza', title: 'El Siguiente Capítulo', emoji: '🌅', reflection: '¿Cuál es mi compromiso con la crianza consciente de mi hijo/a Arcoíris?', activity: 'Escribe un "manifiesto de mamá" personal: 5 principios que guiarán tu crianza de ahora en adelante. Pégalo en la puerta de tu cuarto.', affirmation: 'Cada día que elijo la consciencia sobre el automatismo, cambio el destino de mi familia para siempre.', duration_min: 20 },
    ],
  },
  D: {
    name: 'Plan Diamante', color: '#7CB9A8',
    days: [
      { week: 1, theme: 'Despertar y Conectar', title: 'El Silencio que Habla', emoji: '💎', duration_min: 25,
        morning: { duration_min: 10, activity: 'Comiencen el día con 5 minutos de silencio compartido antes de hablar de planes o tareas.' },
        afternoon: { duration_min: 10, activity: 'Repite ese silencio compartido por la tarde, sin pantallas, solo respirando juntos.' },
        night: { duration_min: 5, activity: 'Pregúntale cómo se sintió el silencio de hoy para él/ella.' },
        tip: 'No llenes cada momento de estímulo — el niño/a Diamante necesita espacios vacíos para procesar su mundo interior.',
        mom_affirmation: 'El silencio es el idioma del alma de mi hijo/a. Aprendo a habitarlo con él/ella.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'La Sabiduría Antigua', emoji: '📚', duration_min: 25,
        morning: { duration_min: 10, activity: 'Lleva un cuaderno contigo hoy y anota cualquier frase profunda o inusual que diga tu hijo/a.' },
        afternoon: { duration_min: 10, activity: 'Pregúntale sobre algo que dijo y pídele que te explique más — entra en su forma de pensar sin corregirla.' },
        night: { duration_min: 5, activity: 'Lean juntos lo que anotaste hoy y agradécele por compartir su sabiduría.' },
        tip: 'Evita minimizar sus observaciones profundas con frases como "eso no lo entiendes todavía" — su percepción suele ser más aguda de lo que aparenta.',
        mom_affirmation: 'Recibo la sabiduría de mi hijo/a con humildad, sin necesitar entenderla del todo.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Más Allá de Este Mundo', emoji: '🌌', duration_min: 25,
        morning: { duration_min: 10, activity: 'Crea un momento de apertura: "Puedes contarme cualquier cosa que sientas o veas. Aquí es válido."' },
        afternoon: { duration_min: 10, activity: 'Si comparte algo inusual (un sueño, una sensación, una percepción), escucha sin escepticismo ni necesidad de explicarlo racionalmente.' },
        night: { duration_min: 5, activity: 'Agradécele su confianza al compartir su mundo interior contigo.' },
        tip: 'No necesitas creer literalmente todo lo que comparte — solo necesitas hacerle sentir seguro/a al compartirlo.',
        mom_affirmation: 'La realidad de mi hijo/a es más amplia que la mía. La recibo sin juicio.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'La Perspectiva Cósmica', emoji: '🔭', duration_min: 25,
        morning: { duration_min: 10, activity: 'Comenta brevemente un tema grande del mundo (sin alarmar) y pregúntale qué piensa al respecto.' },
        afternoon: { duration_min: 10, activity: 'Escucha su respuesta completa antes de dar tu opinión. Pregúntale: "¿Qué harías tú?"' },
        night: { duration_min: 5, activity: 'Dile algo que aprendiste de su perspectiva hoy.' },
        tip: 'Cuida la cantidad de información pesada del mundo que recibe — su empatía cósmica puede absorber demasiado sin filtro.',
        mom_affirmation: 'La perspectiva de mi hijo/a me enseña a ver el mundo con más claridad.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Su Relación con el Tiempo', emoji: '⏳', duration_min: 25,
        morning: { duration_min: 10, activity: 'Observa hoy si tu hijo/a parece vivir más en el presente, el futuro, o en un tiempo propio.' },
        afternoon: { duration_min: 10, activity: 'No apresures sus procesos — dale tiempo extra para tareas que normalmente le tomarían "demasiado".' },
        night: { duration_min: 5, activity: 'Agradécele su ritmo único, sin compararlo con el de otros niños.' },
        tip: 'Evita los horarios extremadamente rígidos esta semana; su relación con el tiempo es distinta y necesita flexibilidad.',
        mom_affirmation: 'Mi hijo/a existe a su propio ritmo. Hoy elijo no apresurarlo.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'El Observador Sereno', emoji: '👁️', duration_min: 25,
        morning: { duration_min: 10, activity: 'Antes de que comience el caos del día, observa cómo se mantiene tu hijo/a en momentos de estrés ajeno.' },
        afternoon: { duration_min: 10, activity: 'Si lo ves sereno/a en medio del caos, nómbralo: "Vi que te mantuviste tranquilo/a. ¿Qué sentiste por dentro?"' },
        night: { duration_min: 5, activity: 'Agradécele ser un ancla de calma para la familia hoy.' },
        tip: 'No le pidas que "reaccione más" como los demás — su calma es una fortaleza, no una falta de interés.',
        mom_affirmation: 'La serenidad de mi hijo/a es un ancla sagrada para nuestra familia.' },
      { week: 1, theme: 'Despertar y Conectar', title: 'Celebrar la Semana 1', emoji: '🎉', duration_min: 25,
        morning: { duration_min: 10, activity: 'Recuerda y anota cuántas veces esta semana tu hijo/a te enseñó algo, directa o indirectamente.' },
        afternoon: { duration_min: 10, activity: 'Cuéntale específicamente qué aprendiste de él/ella esta semana.' },
        night: { duration_min: 5, activity: 'Cierren la semana en silencio compartido, agradeciendo sin palabras.' },
        tip: 'Reconocer en voz alta su sabiduría refuerza su confianza sin necesidad de exigirle que la demuestre todo el tiempo.',
        mom_affirmation: 'Mi hijo/a es mi maestro/a y yo soy el suyo. Aprendemos juntos, un día a la vez.' },
      { week: 2, theme: 'Comprender y Honrar', title: 'La Misión que Trajo', emoji: '🚀', reflection: '¿Cuál sientes que es la misión de vida de tu hijo/a en esta tierra?', activity: 'Medita 10 minutos sobre la misión de tu hijo/a. Sin pensar, solo sintiendo. Luego escribe lo que llegó. Compártelo con él/ella si sientes que está listo.', affirmation: 'Mi hijo/a trajo una misión sagrada. Mi papel es acompañarla, no definirla.', duration_min: 25 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Acceso a la Información', emoji: '📡', reflection: '¿Mi hijo/a parece saber cosas sin haberlas aprendido por canales convencionales?', activity: 'Esta semana, cuando tu hijo/a diga algo que no podría saber de manera convencional, no lo corrijas ni lo desestimes. Solo di: "Qué interesante. Cuéntame más."', affirmation: 'Mi hijo/a accede a dimensiones de conocimiento que yo apenas empiezo a comprender.', duration_min: 15 },
      { week: 2, theme: 'Comprender y Honrar', title: 'El Propósito Compartido', emoji: '🌟', reflection: '¿Cómo puedo yo contribuir a que la misión de mi hijo/a se cumpla?', activity: 'Pregúntale a tu hijo/a: "Si pudieras hacer algo muy importante para el mundo, ¿qué sería?" Luego pregúntate: ¿Qué puedo yo hacer para apoyar eso?', affirmation: 'Soy el puente entre la misión de mi hijo/a y el mundo que la necesita.', duration_min: 20 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Navegando lo 3D', emoji: '🌊', reflection: '¿En qué aspectos de la vida cotidiana le cuesta más a mi hijo/a adaptarse?', activity: 'Identifica 3 situaciones de la vida cotidiana que le resultan especialmente difíciles. Busca estrategias que lo ayuden a navegar lo material sin perder su esencia.', affirmation: 'Ayudo a mi hijo/a a navegar el mundo físico sin que pierda su conexión espiritual.', duration_min: 25 },
      { week: 2, theme: 'Comprender y Honrar', title: 'El Lenguaje Sagrado', emoji: '🗣️', reflection: '¿Cómo se comunica mi hijo/a más allá de las palabras?', activity: 'Practica comunicación no verbal con tu hijo/a: siéntense frente a frente en silencio y traten de "enviarse" pensamientos o imágenes. Luego comparten lo que recibieron.', affirmation: 'Me abro a todas las formas de comunicación que mi hijo/a Diamante me ofrece.', duration_min: 20 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Su Mundo Interior Rico', emoji: '🌈', reflection: '¿Dedica mi hijo/a tiempo suficiente a explorar su mundo interior?', activity: 'Facilita hoy tiempo de contemplación para tu hijo/a: en silencio, en la naturaleza o con música tranquila. Sin productividad. Solo siendo.', affirmation: 'El mundo interior de mi hijo/a es tan vasto como el universo. Lo respeto.', duration_min: 30 },
      { week: 2, theme: 'Comprender y Honrar', title: 'Celebrar la Semana 2', emoji: '✨', reflection: '¿Qué nueva comprensión de la naturaleza multidimensional de mi hijo/a tengo?', activity: 'Visita con tu hijo/a un lugar de poder: un templo, una montaña, el mar, un bosque. Observen en silencio. Luego compartan lo que cada uno sintió.', affirmation: 'Los lugares sagrados son el hábitat natural del alma de mi hijo/a Diamante.', duration_min: 120 },
      { week: 3, theme: 'Transformar y Sanar', title: 'La Desconexión Aparente', emoji: '🌫️', reflection: '¿Hay momentos donde mi hijo/a parece "no estar" completamente aquí?', activity: 'La próxima vez que sientas que tu hijo/a "se fue" a otro lugar, no lo fuerces a volver. Espera con paciencia. Cuando regrese, pregunta con suavidad: "¿Dónde estuviste?"', affirmation: 'Los viajes interiores de mi hijo/a son sagrados. No los interrumpo.', duration_min: 15 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Mi Expansión Espiritual', emoji: '🌱', reflection: '¿Estoy yo expandiendo mi propia espiritualidad para poder acompañar a mi hijo/a?', activity: 'Lee hoy 20 minutos de un libro espiritual que te desafíe. Medita. Ora. El camino de tu hijo/a te llama a expandirte también.', affirmation: 'El camino de mi hijo/a me invita a crecer espiritualmente. Acepto esa invitación.', duration_min: 30 },
      { week: 3, theme: 'Transformar y Sanar', title: 'El Sistema Educativo', emoji: '🏫', reflection: '¿El sistema escolar actual apoya o frena el desarrollo de mi hijo/a?', activity: 'Evalúa honestamente la experiencia escolar de tu hijo/a. Si hay algo que no funciona, busca alternativas: homeschooling parcial, actividades extracurriculares especiales, conversación con docentes.', affirmation: 'Soy la abogada de las necesidades únicas de mi hijo/a Diamante ante cualquier sistema.', duration_min: 25 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Las Preguntas Existenciales', emoji: '🌀', reflection: '¿Cómo respondo cuando mi hijo/a hace preguntas que no puedo responder?', activity: 'La próxima vez que tu hijo/a haga una pregunta existencial, en lugar de buscar una respuesta rápida, di: "Esa es una pregunta muy profunda. Pensémosla juntos." Exploren sin necesitar resolverla.', affirmation: 'No necesito tener todas las respuestas. Lo que mi hijo/a necesita es que explore las preguntas conmigo.', duration_min: 20 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Anclaje al Cuerpo', emoji: '🌍', reflection: '¿Tiene mi hijo/a una buena conexión con su cuerpo físico?', activity: 'Practica con tu hijo/a ejercicios de anclaje: caminar descalzo sobre pasto o tierra, abrazo de árbol, poner las manos bajo agua fría. El cuerpo es el hogar del alma.', affirmation: 'Ayudo a mi hijo/a a habitar su cuerpo con amor mientras mantiene su consciencia expandida.', duration_min: 20 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Mi Humildad como Mamá', emoji: '🙏', reflection: '¿Acepto que mi hijo/a en muchos aspectos sabe más que yo?', activity: 'Hoy, pídele consejo a tu hijo/a sobre algo de tu vida. Pregúntale: "¿Qué harías tú en mi lugar?" Escucha desde la humildad genuina.', affirmation: 'Me humillo ante la sabiduría de mi hijo/a. Ambos somos maestros y alumnos.', duration_min: 20 },
      { week: 3, theme: 'Transformar y Sanar', title: 'Celebrar la Semana 3', emoji: '🌸', reflection: '¿Qué transformaciones observo en mí misma como resultado de criar a mi hijo/a Diamante?', activity: 'Escribe sobre tu propia expansión espiritual en estos 21 días. ¿Qué crees hoy que no creías antes? ¿Qué has abierto en ti misma?', affirmation: 'Criar a mi hijo/a Diamante me está transformando en la mejor versión de mí misma.', duration_min: 25 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'El Portal Interdimensional', emoji: '🌀', reflection: '¿Cómo puedo yo ser un canal para apoyar la misión cósmica de mi hijo/a?', activity: 'Crea un "altar familiar": un espacio en casa con objetos significativos, donde puedan meditar, orar o simplemente conectar juntos con algo más grande.', affirmation: 'Mi hogar es un portal sagrado para el trabajo espiritual de mi familia.', duration_min: 30 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'La Tribu de Almas', emoji: '💫', reflection: '¿Hay otras familias con niños similares con quienes pueda conectar?', activity: 'Busca comunidades de familias con niños conscientes en tu ciudad o en línea. La tribu de almas afines es fundamental para el desarrollo de tu hijo/a Diamante.', affirmation: 'Busco activamente la tribu que nutra el camino de mi hijo/a.', duration_min: 30 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Conocimiento Multidimensional', emoji: '📖', reflection: '¿Qué recursos (libros, maestros, experiencias) podrían expandir el mundo de mi hijo/a?', activity: 'Investiga recursos adaptados a la espiritualidad infantil: libros, docentes especiales, grupos de meditación para niños. Comparte uno con tu hijo/a hoy.', affirmation: 'Facilito los recursos que alimentan la evolución espiritual de mi hijo/a.', duration_min: 30 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'La Ecuanimidad que Enseña', emoji: '⚖️', reflection: '¿Cómo manejo yo las crisis para modelar la ecuanimidad que mi hijo/a ya tiene?', activity: 'Observa hoy cómo tu hijo/a maneja un desafío cotidiano. Aprende de su ecuanimidad. Luego aplica lo que observaste en tu propia respuesta ante algo difícil.', affirmation: 'Mi hijo/a Diamante me enseña la ecuanimidad con su ejemplo silencioso.', duration_min: 15 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'El Regalo de su Presencia', emoji: '🎁', reflection: '¿Qué ha traído a mi vida la presencia de mi hijo/a que no tenía antes?', activity: 'Escribe una lista de 20 cosas que la presencia de tu hijo/a ha traído a tu vida: expansión, profundidad, espiritualidad, humildad, amor. Lee la lista en voz alta.', affirmation: 'Mi hijo/a Diamante es el mayor regalo que he recibido en esta vida. Lo honro con gratitud infinita.', duration_min: 20 },
      { week: 4, theme: 'Celebrar e Integrar', title: 'Celebrar la Semana 4', emoji: '🏆', reflection: '¿Cómo ha cambiado mi vida espiritual desde que soy mamá de mi hijo/a Diamante?', activity: 'Organiza una ceremonia sagrada con tu hijo/a: enciendan una vela, siéntense en silencio, háblenle al universo con gratitud. Creen un ritual propio que sea solo de ustedes.', affirmation: 'Soy una madre que camina el sendero espiritual junto a su hijo/a. Ese es mi mayor logro.', duration_min: 45 },
      { week: 5, theme: 'Tu Legado Comienza', title: 'El Legado Multidimensional', emoji: '📜', reflection: '¿Qué legado quiero que mi hijo/a Diamante deje en este planeta?', activity: 'Escribe una visión: cómo imaginas el impacto de tu hijo/a en el mundo. No pongas límites. Escribe desde la fe y el amor total. Compártela con él/ella.', affirmation: 'Mi hijo/a Diamante tiene un legado cósmico que apenas estamos empezando a vislumbrar.', duration_min: 30 },
      { week: 5, theme: 'Tu Legado Comienza', title: 'El Siguiente Nivel', emoji: '🌅', reflection: '¿A qué nivel de consciencia me invita mi hijo/a Diamante a llegar?', activity: 'Comprométete con una práctica espiritual diaria personal: meditación, oración, diario. Tu propia expansión es el suelo donde florece el camino de tu hijo/a.', affirmation: 'Mi camino espiritual y el de mi hijo/a son uno. Avanzo con valentía, amor y consciencia infinita.', duration_min: 20 },
    ],
  },
};

function getPlan(req, res) {
  const db = initDb();
  const plan = db.get('action_plans').find({ user_id: req.userId }).value();
  if (!plan) return res.json({ plan: null });

  const completedDays = db.get('plan_progress')
    .filter({ plan_id: plan.id })
    .map('day_number')
    .value();

  const typeData = PLANS[plan.vibration_type];
  const days = typeData ? typeData.days.map((d, i) => ({
    ...d, day: i + 1, completed: completedDays.includes(i + 1),
  })) : [];

  res.json({ plan, days, type_name: typeData?.name, type_color: typeData?.color, completed_days: completedDays.length });
}

function createPlan(req, res) {
  const { vibration_type, child_id } = req.body;
  if (!vibration_type || !PLANS[vibration_type]) {
    return res.status(400).json({ error: 'Tipo de vibración inválido' });
  }

  const db = initDb();
  db.get('action_plans').remove({ user_id: req.userId }).write();
  db.get('plan_progress').remove({ user_id: req.userId }).write();

  const plan = {
    id: nextId('action_plans'),
    user_id: req.userId,
    child_id: child_id || null,
    vibration_type,
    started_at: new Date().toISOString(),
    current_day: 1,
  };
  db.get('action_plans').push(plan).write();

  const typeData = PLANS[vibration_type];
  const days = typeData.days.map((d, i) => ({ ...d, day: i + 1, completed: false }));

  res.status(201).json({ plan, days, type_name: typeData.name, type_color: typeData.color });
}

function completeDay(req, res) {
  const db = initDb();
  const dayNumber = Number(req.params.day);
  const plan = db.get('action_plans').find({ user_id: req.userId }).value();
  if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });

  const exists = db.get('plan_progress').find({ plan_id: plan.id, day_number: dayNumber }).value();
  if (!exists) {
    db.get('plan_progress').push({
      id: nextId('plan_progress'),
      plan_id: plan.id,
      user_id: req.userId,
      day_number: dayNumber,
      completed_at: new Date().toISOString(),
    }).write();
  }

  const nextDay = Math.max(plan.current_day, dayNumber + 1);
  db.get('action_plans').find({ id: plan.id }).assign({ current_day: nextDay }).write();

  const completedCount = db.get('plan_progress').filter({ plan_id: plan.id }).value().length;
  res.json({ success: true, completed_days: completedCount, next_day: nextDay });
}

function uncompleteDay(req, res) {
  const db = initDb();
  const dayNumber = Number(req.params.day);
  const plan = db.get('action_plans').find({ user_id: req.userId }).value();
  if (!plan) return res.status(404).json({ error: 'Plan no encontrado' });

  db.get('plan_progress').remove({ plan_id: plan.id, day_number: dayNumber }).write();
  res.json({ success: true });
}

module.exports = { getPlan, createPlan, completeDay, uncompleteDay };
