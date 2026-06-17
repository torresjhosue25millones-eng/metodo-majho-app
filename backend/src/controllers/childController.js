const { initDb, nextId } = require('../database/init');

function getChildren(req, res) {
  const db = initDb();
  const children = db.get('children').filter({ user_id: req.userId }).value();
  res.json({ children: children.map(enrichChild) });
}

function addChild(req, res) {
  const {
    name, age_stage,
    birth_date, birth_time, birth_place,
    mother_name, mother_birth_date, mother_birth_time, mother_birth_place, mother_birth_country,
  } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre del niño/a es requerido' });

  const db = initDb();
  const child = {
    id: nextId('children'),
    user_id: req.userId,
    name,
    age_stage: age_stage || deriveAgeStage(birth_date),
    birth_date: birth_date || null,
    birth_time: birth_time || null,
    birth_place: birth_place || null,
    mother_name: mother_name || null,
    mother_birth_date: mother_birth_date || null,
    mother_birth_time: mother_birth_time || null,
    mother_birth_place: mother_birth_place || null,
    mother_birth_country: mother_birth_country || null,
    vibration_type: null,
    created_at: new Date().toISOString(),
  };
  db.get('children').push(child).write();
  res.status(201).json({ child: enrichChild(child) });
}

function updateChild(req, res) {
  const {
    name, age_stage, vibration_type,
    birth_date, birth_time, birth_place,
    mother_name, mother_birth_date, mother_birth_time, mother_birth_place, mother_birth_country,
  } = req.body;
  const db = initDb();
  const id = Number(req.params.id);
  const child = db.get('children').find({ id, user_id: req.userId }).value();
  if (!child) return res.status(404).json({ error: 'Niño/a no encontrado' });

  db.get('children').find({ id }).assign({
    ...(name && { name }),
    ...(age_stage && { age_stage }),
    ...(vibration_type && { vibration_type }),
    ...(birth_date !== undefined && { birth_date }),
    ...(birth_time !== undefined && { birth_time }),
    ...(birth_place !== undefined && { birth_place }),
    ...(mother_name !== undefined && { mother_name }),
    ...(mother_birth_date !== undefined && { mother_birth_date }),
    ...(mother_birth_time !== undefined && { mother_birth_time }),
    ...(mother_birth_place !== undefined && { mother_birth_place }),
    ...(mother_birth_country !== undefined && { mother_birth_country }),
    updated_at: new Date().toISOString(),
  }).write();

  const updated = db.get('children').find({ id }).value();
  res.json({ child: enrichChild(updated) });
}

function deleteChild(req, res) {
  const db = initDb();
  const id = Number(req.params.id);
  const child = db.get('children').find({ id, user_id: req.userId }).value();
  if (!child) return res.status(404).json({ error: 'Niño/a no encontrado' });

  db.get('children').remove({ id }).write();
  res.json({ success: true });
}

function deriveAgeStage(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  if (birth > now) return 'embarazo';
  const months = (now - birth) / (1000 * 60 * 60 * 24 * 30);
  if (months < 24) return '0-2';
  if (months < 84) return '3-7';
  if (months < 156) return '8-12';
  return '13-18';
}

function getSolarSign(birthDate) {
  if (!birthDate) return null;
  const d = new Date(birthDate + 'T12:00:00Z');
  const md = (d.getUTCMonth() + 1) * 100 + d.getUTCDate();
  if (md >= 1222 || md <= 119) return { sign: 'Capricornio', emoji: '♑', element: 'Tierra' };
  if (md <= 218) return { sign: 'Acuario', emoji: '♒', element: 'Aire' };
  if (md <= 320) return { sign: 'Piscis', emoji: '♓', element: 'Agua' };
  if (md <= 419) return { sign: 'Aries', emoji: '♈', element: 'Fuego' };
  if (md <= 520) return { sign: 'Tauro', emoji: '♉', element: 'Tierra' };
  if (md <= 620) return { sign: 'Géminis', emoji: '♊', element: 'Aire' };
  if (md <= 722) return { sign: 'Cáncer', emoji: '♋', element: 'Agua' };
  if (md <= 822) return { sign: 'Leo', emoji: '♌', element: 'Fuego' };
  if (md <= 922) return { sign: 'Virgo', emoji: '♍', element: 'Tierra' };
  if (md <= 1022) return { sign: 'Libra', emoji: '♎', element: 'Aire' };
  if (md <= 1121) return { sign: 'Escorpio', emoji: '♏', element: 'Agua' };
  return { sign: 'Sagitario', emoji: '♐', element: 'Fuego' };
}

function getLunarSign(birthDate) {
  if (!birthDate) return null;
  // Moon ecliptic longitude at J2000.0 ≈ 218.3°; moves ~13.176°/day
  const refMs = new Date('2000-01-01T12:00:00Z').getTime();
  const birthMs = new Date(birthDate + 'T12:00:00Z').getTime();
  const daysSince = (birthMs - refMs) / (1000 * 60 * 60 * 24);
  let moonLon = (218.3 + 13.176 * daysSince) % 360;
  if (moonLon < 0) moonLon += 360;
  const signs = [
    { sign: 'Aries', emoji: '♈' }, { sign: 'Tauro', emoji: '♉' },
    { sign: 'Géminis', emoji: '♊' }, { sign: 'Cáncer', emoji: '♋' },
    { sign: 'Leo', emoji: '♌' }, { sign: 'Virgo', emoji: '♍' },
    { sign: 'Libra', emoji: '♎' }, { sign: 'Escorpio', emoji: '♏' },
    { sign: 'Sagitario', emoji: '♐' }, { sign: 'Capricornio', emoji: '♑' },
    { sign: 'Acuario', emoji: '♒' }, { sign: 'Piscis', emoji: '♓' },
  ];
  return signs[Math.floor(moonLon / 30) % 12];
}

function getAscendant(birthDate, birthTime) {
  if (!birthDate || !birthTime) return null;
  const [h, min] = birthTime.split(':').map(Number);
  const birthHour = h + min / 60;
  const refMs = new Date('2000-01-01T12:00:00Z').getTime();
  const birthMs = new Date(birthDate + 'T00:00:00Z').getTime();
  const daysSince = (birthMs - refMs) / (1000 * 60 * 60 * 24);
  // Simplified sidereal time (0° longitude, ~10°N latitude for Latin America)
  const gmst = (100.4606184 + 36000.77004 * (daysSince / 36525)) % 360;
  let lst = (gmst + birthHour * 15) % 360;
  if (lst < 0) lst += 360;
  const signs = [
    { sign: 'Aries', emoji: '♈' }, { sign: 'Tauro', emoji: '♉' },
    { sign: 'Géminis', emoji: '♊' }, { sign: 'Cáncer', emoji: '♋' },
    { sign: 'Leo', emoji: '♌' }, { sign: 'Virgo', emoji: '♍' },
    { sign: 'Libra', emoji: '♎' }, { sign: 'Escorpio', emoji: '♏' },
    { sign: 'Sagitario', emoji: '♐' }, { sign: 'Capricornio', emoji: '♑' },
    { sign: 'Acuario', emoji: '♒' }, { sign: 'Piscis', emoji: '♓' },
  ];
  return signs[Math.floor(((lst + 180) % 360) / 30) % 12];
}

function enrichChild(child) {
  const isEmbarazo = child.age_stage === 'embarazo';
  const chartDate = isEmbarazo ? child.mother_birth_date : child.birth_date;
  const chartTime = isEmbarazo ? child.mother_birth_time : child.birth_time;
  return {
    ...child,
    astral_chart: chartDate ? {
      solar: getSolarSign(chartDate),
      lunar: getLunarSign(chartDate),
      ascendant: getAscendant(chartDate, chartTime),
      is_mother: isEmbarazo,
    } : null,
  };
}

module.exports = { getChildren, addChild, updateChild, deleteChild };
