const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const path = require('path');

const adapter = new FileSync(path.join(__dirname, '../../db.json'));
const db = low(adapter);

function nextId(collection) {
  const items = db.get(collection).value();
  if (!items || items.length === 0) return 1;
  return Math.max(...items.map(i => i.id)) + 1;
}

function initDb() {
  db.defaults({
    users: [],
    children: [],
    modules: [],
    lessons: [],
    user_progress: [],
    journal_entries: [],
    affirmations: [],
    user_affirmations: [],
    questionnaire_results: [],
    action_plans: [],
    plan_progress: [],
    emergency_uses: [],
  }).write();

  const existingModules = db.get('modules').value();
  const needsReseed = existingModules.length === 0 || existingModules[0].letter !== undefined || existingModules[0].age_range === '3-7';
  if (needsReseed) {
    db.set('modules', []).set('lessons', []).write();
    seed();
  }
  return db;
}

function seed() {
  const modules = [
    { id: 1, title: 'Embarazo Sagrado', subtitle: 'El portal de una nueva alma', description: 'El embarazo es una de las experiencias más sagradas del universo. Tu cuerpo es el templo por donde llega un alma a esta dimensión. Aprende a vivir cada etapa con consciencia, amor y espiritualidad profunda.', age_range: 'embarazo', age_label: 'Embarazo', color: '#C9748A', icon: '🤰', order_num: 1, lessons_count: 5 },
    { id: 2, title: 'Tu Bebé Canal de Abundancia', subtitle: '0 a 2 años · El amor hecho cuerpo', description: 'Tu bebé llegó como un canal puro de amor divino. Estos primeros años son los más sagrados para el vínculo. Aprende a leer su alma, respetar su ritmo y crear una base espiritual sólida.', age_range: '0-2', age_label: '0 a 2 años', color: '#7CB9A8', icon: '👶', order_num: 2, lessons_count: 5 },
    { id: 3, title: 'Despertar de la Infancia', subtitle: '2 a 6 años · La magia se despierta', description: 'Entre los 2 y 6 años el niño vive en un estado de consciencia expandida donde la magia y la realidad se funden. Es la etapa más espiritual de la vida. Aprende a honrar y acompañar este despertar.', age_range: '2-6', age_label: '2 a 6 años', color: '#9B8EC4', icon: '🌱', order_num: 3, lessons_count: 5 },
    { id: 4, title: 'Pequeños Magos de Luz', subtitle: '6 a 12 años · Los dones despiertan', description: 'Entre los 6 y 12 años los niños conscientes comienzan a manifestar sus dones espirituales únicos. Es el momento de acompañar su identidad sagrada, sus talentos y su propósito de vida.', age_range: '6-12', age_label: '6 a 12 años', color: '#D4AF37', icon: '✨', order_num: 4, lessons_count: 5 },
    { id: 5, title: 'Adolescentes Nueva Tierra', subtitle: '12 a 17 años · La misión se revela', description: 'Los adolescentes conscientes de hoy son los constructores de la Nueva Tierra. Aprende a acompañar esta etapa transformadora desde la consciencia y el amor.', age_range: '12-17', age_label: '12 a 17 años', color: '#3D1C32', icon: '🌟', order_num: 5, lessons_count: 5 },
  ];

  const lessonsData = {
    1: [
      { title: 'Tu Embarazo como Iniciación Espiritual', content: 'El embarazo no es solo un proceso biológico: es una iniciación sagrada. Desde el momento de la concepción, un alma eligió venir a través de ti. Esta elección no fue al azar. Existe un contrato sagrado entre tú y ese ser. En esta lección exploraremos cómo vivir el embarazo como el camino espiritual más poderoso que puede existir, llenando cada semana de consciencia, gratitud y conexión profunda con el alma que llega.', duration_min: 20 },
      { title: 'Conectando con el Alma que Llega', content: 'Tu bebé ya te escucha, ya te siente, ya te ama. Desde las primeras semanas, existe una comunicación sutil entre su alma y la tuya. Aprende las prácticas de conexión intrauterina: la meditación de bienvenida, las conversaciones sagradas con tu vientre, la música como puente de amor. Esta conexión temprana es el fundamento de un vínculo que durará toda la vida.', duration_min: 18 },
      { title: 'El Cuerpo como Templo Sagrado', content: 'Durante el embarazo, tu cuerpo se convierte en el templo más sagrado del universo: el hogar de un alma nueva. Honrar este templo es honrar a quien lo habita. Aprende a alimentarte con consciencia, a mover tu cuerpo con gratitud, a descansar como práctica espiritual y a establecer rituales de amor hacia tu vientre sagrado cada día.', duration_min: 15 },
      { title: 'Preparando el Nido Consciente', content: 'El espacio físico que preparas para tu bebé es una extensión de tu amor. Más allá de la decoración, existe una preparación energética y espiritual del hogar. Aprende a limpiar la energía del espacio, a llenar el cuarto del bebé con intención sagrada, a crear rituales de bienvenida y a establecer el nido como un santuario de amor donde ese ser podrá florecer.', duration_min: 15 },
      { title: 'El Parto como Portal Sagrado', content: 'El parto es uno de los portales más poderosos que existen. Ya sea vaginal, por cesárea, en casa o en hospital: es un momento de magia cósmica donde un alma cruza el velo para llegar a este plano. Aprende a preparar tu mente, cuerpo y alma para este momento sagrado, sabiendo que estás siendo guiada por algo más grande que tú.', duration_min: 22 },
    ],
    2: [
      { title: 'El Recién Nacido y su Sabiduría Innata', content: 'Tu recién nacido acaba de atravesar el portal más grande de la existencia. Aún recuerda de dónde viene. Esa mirada profunda no es vacía: está procesando dos mundos a la vez. Aprende a leer el lenguaje del alma de tu bebé, a respetar su ritmo de adaptación y a honrar que viene con una sabiduría mucho más antigua que la nuestra.', duration_min: 18 },
      { title: 'La Lactancia como Acto Sagrado', content: 'La lactancia, cuando se elige y puede practicarse, es mucho más que nutrición: es un canal de transmisión de amor, energía e información espiritual. Y si eliges otra forma de alimentar a tu bebé, ese también es un acto de amor sagrado. Lo que importa es la intención con que lo haces.', duration_min: 15 },
      { title: 'El Apego Consciente', content: 'El apego seguro es el fundamento de toda salud espiritual y emocional. Un bebé que sabe que su mamá siempre vuelve, que no está solo en el universo, que su llanto es escuchado: ese bebé puede confiar en la vida. Aprende los fundamentos del apego consciente desde la perspectiva de la crianza espiritual.', duration_min: 20 },
      { title: 'Los Sueños del Bebé Espiritual', content: 'Los bebés pasan la mayor parte del tiempo durmiendo porque siguen viajando entre mundos. Sus sonrisas durante el sueño, sus sobresaltos: son comunicaciones de su alma en proceso de integración. Aprende a crear rituales de sueño sagrado que honren este proceso.', duration_min: 12 },
      { title: 'Los Primeros Pasos de la Consciencia', content: 'Cuando tu bebé comienza a gatear, ponerse de pie y dar sus primeros pasos, está eligiendo su relación con la gravedad y con este plano físico. Honra cada paso como el acto sagrado que es, sin prisa, sin comparaciones, solo con amor.', duration_min: 15 },
    ],
    3: [
      { title: 'La Imaginación como Portal Espiritual', content: 'Entre los 2 y 6 años, los niños viven en un estado de trance creativo natural. Sus "amigos imaginarios" no siempre son imaginarios. Aprende a honrar y proteger este estado sagrado de consciencia en lugar de apresurarte a llenarlos de "realidad".', duration_min: 18 },
      { title: 'Las Rabietas como Maestras Espirituales', content: 'Las rabietas no son manipulación ni mala conducta: son tormentas emocionales de un ser cuyo sistema nervioso aún está desarrollándose. Desde la perspectiva espiritual, son purgas energéticas y oportunidades de conexión profunda. Aprende a acompañarlas sin engancharte, desde un lugar de amor firme.', duration_min: 20 },
      { title: 'El Juego Sagrado en la Primera Infancia', content: 'Para un niño de esta edad, el juego es su trabajo sagrado, su meditación, su camino espiritual. Aprende a crear espacios de juego libre y sagrado donde la creatividad florezca sin interrupciones ni direcciones adultas innecesarias.', duration_min: 15 },
      { title: 'Los Miedos Nocturnos y la Espiritualidad', content: 'Los monstruos bajo la cama no son solo fruto de la imaginación: a veces los niños sensibles perciben energías que los adultos no ven. Sus miedos nocturnos merecen ser tomados en serio y acompañados con rituales de protección amorosa.', duration_min: 16 },
      { title: 'Sembrando Semillas de Consciencia', content: 'Esta etapa es el momento más fértil para sembrar las semillas de la espiritualidad consciente. No desde la religión impuesta, sino desde la experiencia viva: gratitud, admiración por la naturaleza, conversaciones sobre el alma. Lo que plantes aquí florecerá toda la vida.', duration_min: 20 },
    ],
    4: [
      { title: 'Descubriendo los Dones Especiales', content: 'Entre los 6 y 12 años, los niños conscientes comienzan a mostrar claramente sus dones espirituales únicos: algunos son videntes, otros sanadores energéticos, otros tienen telepatía, otros son líderes naturales. Aprende a identificar, honrar y acompañar los dones específicos de tu hijo/a.', duration_min: 20 },
      { title: 'La Intuición en los Niños Conscientes', content: 'La intuición es el lenguaje del alma. Los niños conscientes de esta edad tienen un sexto sentido muy desarrollado que necesita ser validado y cultivado. Aprende a crear prácticas de desarrollo intuitivo apropiadas para esta edad.', duration_min: 18 },
      { title: 'Relaciones Sagradas con sus Pares', content: 'Los niños conscientes a menudo se sienten diferentes de sus pares y pueden sufrir por ello. Aprende a acompañar sus relaciones sociales desde la consciencia: límites, autenticidad, liderazgo amoroso y cómo encontrar su tribu de almas afines.', duration_min: 16 },
      { title: 'La Escuela desde la Consciencia', content: 'El sistema educativo tradicional raramente está diseñado para los niños conscientes de hoy. Aprende a complementar la educación escolar con aprendizajes que nutran el alma: inteligencia emocional, propósito de vida y talentos espirituales.', duration_min: 20 },
      { title: 'Rituales de Conexión para Esta Etapa', content: 'Los rituales familiares se vuelven especialmente poderosos en esta etapa. Crea rituales que honren el crecimiento de tu hijo/a: el ritual de cumpleaños espiritual, los círculos de conversación, los diarios de sueños. Estos rituales crean contenedores sagrados de espiritualidad.', duration_min: 15 },
    ],
    5: [
      { title: 'El Adolescente como Ser de Luz', content: 'Los adolescentes de hoy no son los rebeldes sin causa de generaciones anteriores. Son seres de luz con una misión específica en la Nueva Tierra. Su "rebeldía" es frecuentemente su alma diciéndote que el mundo que le propones no le alcanza. Aprende a verlo/a desde esta perspectiva transformadora.', duration_min: 22 },
      { title: 'La Identidad y el Propósito', content: 'La crisis de identidad adolescente es en realidad una búsqueda espiritual profunda: ¿Quién soy? ¿Para qué vine? Aprende a acompañar esta búsqueda sagrada sin responderla tú misma, sino creando el espacio para que tu adolescente descubra sus propias respuestas.', duration_min: 20 },
      { title: 'Navegando las Redes con Consciencia', content: 'Las redes sociales son el territorio de los adolescentes actuales. La estrategia consciente: enseñarles a ser creadores conscientes de contenido, a cuidar su energía digital, a discernir la información y a usar la tecnología como herramienta de su misión.', duration_min: 18 },
      { title: 'El Amor Romántico Consciente', content: 'El primer amor es una de las experiencias espirituales más intensas de la vida. Acompañar a tu adolescente en sus primeras relaciones románticas desde la consciencia, el respeto y sin drama es uno de los regalos más grandes que puedes darle.', duration_min: 20 },
      { title: 'Su Misión en la Nueva Tierra', content: 'Tu adolescente llegó a esta tierra con una misión específica que forma parte de la transformación colectiva de la humanidad. Ayudarlo/a a conectar con ese propósito es el acto de crianza más elevado que existe.', duration_min: 25 },
    ],
  };

  const affirmations = [
    { id: 1, text: 'Soy la madre perfecta para mi hijo/a. Fui elegida para este camino sagrado.', category: 'autoamor', author: 'Método MAJHO' },
    { id: 2, text: 'Mi presencia es el regalo más poderoso que le puedo dar a mi hijo/a.', category: 'presencia', author: 'Método MAJHO' },
    { id: 3, text: 'Confío en la sabiduría de mi cuerpo y mi instinto maternal.', category: 'confianza', author: 'Método MAJHO' },
    { id: 4, text: 'Cada día aprendo, cada día crezco, y eso me hace mejor madre.', category: 'crecimiento', author: 'Método MAJHO' },
    { id: 5, text: 'Mi amor por mi hijo/a es infinito y eterno.', category: 'amor', author: 'Método MAJHO' },
    { id: 6, text: 'Tengo la capacidad de crear un hogar lleno de paz y armonía.', category: 'hogar', author: 'Método MAJHO' },
    { id: 7, text: 'Honro mi proceso y me permito ser humana y perfectamente imperfecta.', category: 'autoamor', author: 'Método MAJHO' },
    { id: 8, text: 'Mi hijo/a y yo crecemos juntos en este camino espiritual.', category: 'espiritualidad', author: 'Método MAJHO' },
    { id: 9, text: 'Soy un canal de amor divino para mi familia.', category: 'espiritualidad', author: 'Método MAJHO' },
    { id: 10, text: 'Mis emociones son válidas y las acepto con amor.', category: 'autoamor', author: 'Método MAJHO' },
    { id: 11, text: 'Cada momento con mi hijo/a es sagrado y único.', category: 'presencia', author: 'Método MAJHO' },
    { id: 12, text: 'Confío en el proceso de la vida y en el camino de mi hijo/a.', category: 'confianza', author: 'Método MAJHO' },
    { id: 13, text: 'Soy fuerte, capaz y llena de amor.', category: 'autoamor', author: 'Método MAJHO' },
    { id: 14, text: 'El juego es sagrado y lo honro en nuestra familia.', category: 'presencia', author: 'Método MAJHO' },
    { id: 15, text: 'Respiro profundo y me conecto con mi corazón de madre.', category: 'mindfulness', author: 'Método MAJHO' },
    { id: 16, text: 'Mi hijo/a llegó a este mundo con una misión sagrada y yo la acompaño.', category: 'espiritualidad', author: 'Método MAJHO' },
    { id: 17, text: 'Honro la vibración única de mi hijo/a y la nutro con amor.', category: 'espiritualidad', author: 'Método MAJHO' },
    { id: 18, text: 'Mi hogar es un templo de amor, paz y crecimiento consciente.', category: 'hogar', author: 'Método MAJHO' },
  ];

  let lessonId = 1;
  const allLessons = [];
  Object.entries(lessonsData).forEach(([moduleId, lessons]) => {
    lessons.forEach((l, i) => {
      allLessons.push({ id: lessonId++, module_id: Number(moduleId), order_num: i + 1, ...l });
    });
  });

  db.set('modules', modules).set('lessons', allLessons).set('affirmations', affirmations).write();
}

module.exports = { initDb, nextId };
