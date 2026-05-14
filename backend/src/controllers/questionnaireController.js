const { initDb, nextId } = require('../database/init');

const VIBRATION_TYPES = {
  I: {
    key: 'indigo',
    name: 'Niño/a Índigo',
    emoji: '💙',
    color: '#4B0082',
    bg: '#F0E6FF',
    tagline: 'Guerrero/a espiritual, aquí para transformar el mundo',
    description: 'Los Niños Índigo llegaron a este planeta con una misión clara: transformar los sistemas caducos del mundo. Son almas antiguas, guerreros espirituales que llegaron antes que nadie. Su "rebeldía" no es desobediencia: es su alma que sabe que el mundo necesita cambiar. Son líderes natos, profundamente intuitivos y tienen un sentido agudo de la justicia que no pueden ignorar.',
    characteristics: [
      'Líder nato, no acepta jerarquías sin fundamento',
      'Intuición poderosa y muy desarrollada',
      'Sensibilidad extrema ante la injusticia',
      'Dificultad con sistemas y rutinas rígidas',
      'Inteligencia fuera de lo común',
      'Puede ser diagnosticado con TDA/TDAH',
      'Pocos amigos pero vínculos muy profundos',
      'Sentido innato de su propósito de vida',
    ],
    parenting_tips: [
      'Explica siempre el PORQUÉ de las reglas, nunca impongas sin razón',
      'Respeta su autonomía y necesidad de tomar decisiones',
      'Canaliza su energía en causas que le apasionen',
      'Valida su percepción de la injusticia, no la minimices',
      'Busca educación alternativa o complementa la convencional',
      'Crea espacios de diálogo donde su voz sea realmente escuchada',
    ],
  },
  C: {
    key: 'cristal',
    name: 'Niño/a Cristal',
    emoji: '💜',
    color: '#9B8EC4',
    bg: '#F5F0FA',
    tagline: 'Sanador/a de almas, amor hecho persona',
    description: 'Los Niños Cristal son amor en estado puro. Llegaron después de los Índigo, para sanar lo que los guerreros transformaron. Son profundamente empáticos, sienten las emociones de todos a su alrededor como si fueran propias. Tienen una conexión especial con la naturaleza, los animales y con el mundo espiritual. Sus ojos grandes y penetrantes parecen ver directamente al alma.',
    characteristics: [
      'Empatía extrema, absorbe las emociones de otros',
      'Conexión mágica con animales y naturaleza',
      'Puede tener habilidades telepáticas o psíquicas',
      'Profundamente amoroso y perdonador',
      'Se sobrecarga en ambientes muy estimulantes',
      'Atraído por cristales, plantas y elementos naturales',
      'Expresión artística muy desarrollada',
      'Puede tardar en hablar (comunicación no verbal primero)',
    ],
    parenting_tips: [
      'Protege su campo energético: menos pantallas, más naturaleza',
      'Respeta sus límites sociales, no fuerzas la socialización',
      'Crea rituales de limpieza energética para después del colegio',
      'Valida que sus percepciones energéticas son reales',
      'Alimenta su arte, música y expresión creativa',
      'Enseñale a crear límites energéticos saludables',
    ],
  },
  A: {
    key: 'arcoiris',
    name: 'Niño/a Arcoíris',
    emoji: '🌈',
    color: '#E8A4B8',
    bg: '#FDF3F6',
    tagline: 'Alegría divina, sanador/a de la humanidad',
    description: 'Los Niños Arcoíris son la vibración más alta de amor que ha encarnado en la Tierra. Nacen felices. Su presencia ilumina cada espacio al que llegan. Son sanadores naturales que no conocen el miedo ni el odio en su estado puro. Vinieron a mostrar que un mundo de amor, alegría y abundancia es posible. Su generosidad es total: comparten todo sin pensarlo.',
    characteristics: [
      'Nace con una alegría natural y contagiosa',
      'Generoso/a al extremo, comparte sin dudar',
      'Alta energía y entusiasmo permanente',
      'Capacidad sanadora innata',
      'Ama a todos por igual, sin filtros',
      'Se recupera emocionalmente muy rápido',
      'Conecta con los colores y la creatividad visual',
      'Raramente guarda resentimientos',
    ],
    parenting_tips: [
      'Nutre su alegría natural sin condicionarla',
      'Enseñale a discernir sin perder su amor incondicional',
      'Dale espacios de movimiento y expresión creativa',
      'Honra su generosidad sin permitir que se pierda en ella',
      'Rodéale de colores, arte, música y belleza',
      'Refuerza su confianza en sí mismo/a para que no busque aprobación externa',
    ],
  },
  D: {
    key: 'diamante',
    name: 'Niño/a Diamante',
    emoji: '💎',
    color: '#7CB9A8',
    bg: '#F0FAF8',
    tagline: 'Ser multidimensional, puente entre mundos',
    description: 'Los Niños Diamante son los seres de mayor frecuencia que han encarnado en la Tierra. Son multidimensionales: existen simultáneamente en varios planos de consciencia. Tienen un conocimiento innato que no pueden haber aprendido en esta vida. Parecen vivir parcialmente en otro plano y su mirada lo revela. Son puentes entre dimensiones y su misión tiene una escala cósmica.',
    characteristics: [
      'Conocimiento que no pudo ser adquirido en esta vida',
      'Perspectiva cósmica ante los problemas cotidianos',
      'Puede recordar vidas pasadas o experiencias interdimensionales',
      'Energía serena y observadora, casi sin reactividad',
      'Parecen "no estar" a veces, procesando en otro nivel',
      'Conexión directa con guías, ángeles o seres de luz',
      'Comprensión profunda del sufrimiento humano',
      'Sabiduría que supera su edad física',
    ],
    parenting_tips: [
      'Honra su sabiduría sin infantilizarlos',
      'Crea espacios de silencio y contemplación para ellos',
      'No los sobre-estimules, necesitan tiempo de procesamiento',
      'Valida sus experiencias interdimensionales sin escepticismo',
      'Busca comunidades de familias con niños conscientes',
      'Trabaja tu propia espiritualidad para poder acompañarles',
    ],
  },
};

function getQuestions(req, res) {
  res.json({ questions: QUESTIONNAIRE_QUESTIONS, types: VIBRATION_TYPES });
}

function submitQuestionnaire(req, res) {
  const { child_id, answers } = req.body;
  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Respuestas inválidas' });
  }

  const scores = { I: 0, C: 0, A: 0, D: 0 };
  answers.forEach(a => { if (scores[a] !== undefined) scores[a]++; });

  const winner = Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0];
  const typeData = VIBRATION_TYPES[winner];

  const db = initDb();
  const result = {
    id: nextId('questionnaire_results'),
    user_id: req.userId,
    child_id: child_id || null,
    type_key: winner,
    scores,
    created_at: new Date().toISOString(),
  };
  db.get('questionnaire_results').push(result).write();

  if (child_id) {
    db.get('children').find({ id: Number(child_id), user_id: req.userId })
      .assign({ vibration_type: winner })
      .write();
  }

  res.json({ result, type: typeData });
}

function getLatestResult(req, res) {
  const db = initDb();
  const childId = req.query.child_id ? Number(req.query.child_id) : null;

  let results = db.get('questionnaire_results').filter({ user_id: req.userId });
  if (childId) results = results.filter({ child_id: childId });

  const latest = results.sortBy('created_at').last().value();
  if (!latest) return res.json({ result: null });

  res.json({ result: latest, type: VIBRATION_TYPES[latest.type_key] });
}

const QUESTIONNAIRE_QUESTIONS = [
  {
    id: 1,
    question: '¿Cómo describes la energía general de tu hijo/a?',
    options: [
      { value: 'I', label: 'Intensa y determinada, a veces difícil de manejar pero increíblemente poderosa' },
      { value: 'C', label: 'Suave y muy sensible, absorbe todo lo que hay a su alrededor' },
      { value: 'A', label: 'Alegre y radiante, llena de luz todo espacio al que llega' },
      { value: 'D', label: 'Serena y observadora, como si estuviera procesando desde otro nivel' },
    ],
  },
  {
    id: 2,
    question: '¿Cómo reacciona ante las reglas o figuras de autoridad?',
    options: [
      { value: 'I', label: 'Las cuestiona todo, solo acepta reglas con explicación lógica y justa' },
      { value: 'C', label: 'Las acepta si vienen con amor y comprensión genuina' },
      { value: 'A', label: 'Es flexible y cooperativa, rara vez hay conflictos reales' },
      { value: 'D', label: 'Parece entender el propósito más allá de la regla misma' },
    ],
  },
  {
    id: 3,
    question: '¿Cómo se relaciona tu hijo/a con otras personas?',
    options: [
      { value: 'I', label: 'Pocos amigos muy seleccionados, detecta la falsedad de inmediato' },
      { value: 'C', label: 'Absorbe las emociones de otros, se abruma fácilmente en grupos grandes' },
      { value: 'A', label: 'Hace amigos fácilmente, lleva alegría a todos los que conoce' },
      { value: 'D', label: 'Conecta profundamente con todos, ve más allá de las apariencias' },
    ],
  },
  {
    id: 4,
    question: '¿Qué habilidades o características especiales manifiesta?',
    options: [
      { value: 'I', label: 'Liderazgo natural, pensamiento crítico e intuición muy fuerte' },
      { value: 'C', label: 'Capacidad sanadora, telepatía o conexión especial con animales' },
      { value: 'A', label: 'Alegría contagiosa, generosidad extrema y amor incondicional' },
      { value: 'D', label: 'Conocimiento que no pudo aprender en esta vida, perspectiva cósmica' },
    ],
  },
  {
    id: 5,
    question: '¿Cómo reacciona ante la injusticia?',
    options: [
      { value: 'I', label: 'Con rabia intensa y necesidad urgente de cambiarla, no puede ignorarla' },
      { value: 'C', label: 'Con tristeza profunda y mucha compasión por quien sufre' },
      { value: 'A', label: 'Con amor y soluciones creativas, busca que todos sean felices' },
      { value: 'D', label: 'Desde una perspectiva elevada, viendo el aprendizaje detrás de todo' },
    ],
  },
  {
    id: 6,
    question: '¿Cuál es su relación con la naturaleza y los animales?',
    options: [
      { value: 'I', label: 'Le atrae pero en sus propios términos, no tolera el maltrato' },
      { value: 'C', label: 'Tiene una conexión mágica, los animales la buscan espontáneamente' },
      { value: 'A', label: 'Los ama a todos por igual, irradia amor natural hacia todo ser vivo' },
      { value: 'D', label: 'Siente que forma parte de algo mucho más grande que el planeta' },
    ],
  },
  {
    id: 7,
    question: '¿Qué sientes cuando miras los ojos de tu hijo/a?',
    options: [
      { value: 'I', label: 'Una determinación y fuerza casi adulta, un guerrero/a que sabe lo que quiere' },
      { value: 'C', label: 'Profundidad infinita, como si te viera directamente el alma' },
      { value: 'A', label: 'Alegría pura y amor incondicional, ojos de sol' },
      { value: 'D', label: 'Una sabiduría antigua que va mucho más allá de su edad física' },
    ],
  },
  {
    id: 8,
    question: '¿Cómo maneja sus emociones?',
    options: [
      { value: 'I', label: 'Las siente intensamente, puede tener explosiones seguidas de calma total' },
      { value: 'C', label: 'Las siente muy profundo, puede sobreabrumarse con facilidad' },
      { value: 'A', label: 'Generalmente alegre, se recupera muy rápido de las tristezas' },
      { value: 'D', label: 'Procesa desde un lugar de observación serena, con poco apego' },
    ],
  },
  {
    id: 9,
    question: '¿Tu hijo/a habla de temas espirituales o hace preguntas profundas?',
    options: [
      { value: 'I', label: 'Cuestiona la existencia, busca el propósito y el porqué de todo' },
      { value: 'C', label: 'Habla de ángeles, seres de luz o describe experiencias energéticas' },
      { value: 'A', label: 'Expresa amor universal y habla de cuidar la Tierra y a todos' },
      { value: 'D', label: 'Describe dimensiones, misiones cósmicas o conocimiento que nadie le enseñó' },
    ],
  },
  {
    id: 10,
    question: '¿Cómo fue tu embarazo y el nacimiento de este hijo/a?',
    options: [
      { value: 'I', label: 'Intenso, marcó un antes y un después en tu vida de manera profunda' },
      { value: 'C', label: 'Suave pero profundamente transformador y lleno de espiritualidad' },
      { value: 'A', label: 'Lleno de luz, sentiste que llegaba un ser de alegría extraordinaria' },
      { value: 'D', label: 'Sentiste que ese ser venía con una misión cósmica muy específica' },
    ],
  },
  {
    id: 11,
    question: '¿Cuándo tu hijo/a juega o crea, ¿cómo lo hace?',
    options: [
      { value: 'I', label: 'Con un propósito claro, liderando y organizando todo a su manera' },
      { value: 'C', label: 'De manera artística y sensible, creando mundos llenos de belleza' },
      { value: 'A', label: 'Con alegría explosiva, incluyendo a todos, generoso con sus creaciones' },
      { value: 'D', label: 'En estados contemplativos, creando cosas que sorprenden por su profundidad' },
    ],
  },
  {
    id: 12,
    question: '¿Qué frase describe mejor a tu hijo/a?',
    options: [
      { value: 'I', label: '"Vino a cambiar el mundo y lo sabe desde que nació"' },
      { value: 'C', label: '"Es amor hecho persona, siente todo profundamente"' },
      { value: 'A', label: '"Es pura alegría y quiere que todos sean felices siempre"' },
      { value: 'D', label: '"Parece que ya vivió muchas vidas y lo trae todo consigo"' },
    ],
  },
];

module.exports = { getQuestions, submitQuestionnaire, getLatestResult };
