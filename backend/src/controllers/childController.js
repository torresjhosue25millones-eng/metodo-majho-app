const { initDb, nextId } = require('../database/init');
const { Origin, Horoscope } = require('circular-natal-horoscope-js');
const { sendAstralChartEmail } = require('../utils/mailer');

function getChildren(req, res) {
  const db = initDb();
  const children = db.get('children').filter({ user_id: req.userId }).value();
  res.json({ children: children.map(enrichChild) });
}

// Resolves a free-text birth place to coordinates so the Ascendant can be calculated
// precisely (it is very sensitive to longitude/timezone). Never throws — a failed or
// slow lookup just means we fall back to the rough longitude-0 approximation later.
async function geocodePlace(query) {
  if (!query) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'MetodoMAJHO/1.0 (+https://metodo.majhogroup.com)' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const results = await res.json();
    if (!results.length) return null;
    return { lat: parseFloat(results[0].lat), lon: parseFloat(results[0].lon) };
  } catch {
    return null;
  }
}

async function addChild(req, res) {
  const {
    name, age_stage, due_date,
    birth_date, birth_time, birth_place,
    mother_name, mother_birth_date, mother_birth_time, mother_birth_place, mother_birth_country,
  } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre del niño/a es requerido' });

  const motherPlaceQuery = [mother_birth_place, mother_birth_country].filter(Boolean).join(', ') || null;
  const [birthGeo, motherGeo] = await Promise.all([
    geocodePlace(birth_place),
    geocodePlace(motherPlaceQuery),
  ]);

  const db = initDb();
  const child = {
    id: nextId('children'),
    user_id: req.userId,
    name,
    age_stage: age_stage || deriveAgeStage(birth_date),
    due_date: due_date || null,
    birth_date: birth_date || null,
    birth_time: birth_time || null,
    birth_place: birth_place || null,
    birth_lat: birthGeo?.lat ?? null,
    birth_lon: birthGeo?.lon ?? null,
    mother_name: mother_name || null,
    mother_birth_date: mother_birth_date || null,
    mother_birth_time: mother_birth_time || null,
    mother_birth_place: mother_birth_place || null,
    mother_birth_country: mother_birth_country || null,
    mother_birth_lat: motherGeo?.lat ?? null,
    mother_birth_lon: motherGeo?.lon ?? null,
    vibration_type: null,
    created_at: new Date().toISOString(),
  };
  db.get('children').push(child).write();
  const enriched = enrichChild(child);

  let emailResult = { sent: false, reason: 'no_chart' };
  if (enriched.astral_chart) {
    const user = db.get('users').find({ id: req.userId }).value();
    emailResult = await sendAstralChartEmail({
      to: user?.email,
      name: enriched.astral_chart.is_mother ? mother_name : name,
      chart: enriched.astral_chart,
    });
  }

  res.status(201).json({ child: enriched, email_sent: emailResult.sent });
}

async function updateChild(req, res) {
  const {
    name, age_stage, vibration_type, due_date,
    birth_date, birth_time, birth_place,
    mother_name, mother_birth_date, mother_birth_time, mother_birth_place, mother_birth_country,
  } = req.body;
  const db = initDb();
  const id = Number(req.params.id);
  const child = db.get('children').find({ id, user_id: req.userId }).value();
  if (!child) return res.status(404).json({ error: 'Niño/a no encontrado' });

  // Only re-geocode when the place actually changed in this request, so routine
  // updates (e.g. just the name or vibration_type) don't trigger a network call.
  const birthGeo = birth_place !== undefined ? await geocodePlace(birth_place) : null;
  const motherPlaceChanged = mother_birth_place !== undefined || mother_birth_country !== undefined;
  const motherGeo = motherPlaceChanged
    ? await geocodePlace([
        mother_birth_place !== undefined ? mother_birth_place : child.mother_birth_place,
        mother_birth_country !== undefined ? mother_birth_country : child.mother_birth_country,
      ].filter(Boolean).join(', ') || null)
    : null;

  db.get('children').find({ id }).assign({
    ...(name && { name }),
    ...(age_stage && { age_stage }),
    ...(vibration_type && { vibration_type }),
    ...(due_date !== undefined && { due_date }),
    ...(birth_date !== undefined && { birth_date }),
    ...(birth_time !== undefined && { birth_time }),
    ...(birth_place !== undefined && { birth_place, birth_lat: birthGeo?.lat ?? null, birth_lon: birthGeo?.lon ?? null }),
    ...(mother_name !== undefined && { mother_name }),
    ...(mother_birth_date !== undefined && { mother_birth_date }),
    ...(mother_birth_time !== undefined && { mother_birth_time }),
    ...(mother_birth_place !== undefined && { mother_birth_place }),
    ...(mother_birth_country !== undefined && { mother_birth_country }),
    ...(motherPlaceChanged && { mother_birth_lat: motherGeo?.lat ?? null, mother_birth_lon: motherGeo?.lon ?? null }),
    updated_at: new Date().toISOString(),
  }).write();

  const updated = db.get('children').find({ id }).value();
  const enriched = enrichChild(updated);

  // Only email when this request actually changed something the chart depends on —
  // not on every unrelated edit (e.g. renaming the child).
  const chartInputsChanged = [birth_date, birth_time, birth_place, mother_birth_date, mother_birth_time]
    .some(v => v !== undefined) || motherPlaceChanged;
  let emailResult = { sent: false, reason: 'unchanged' };
  if (enriched.astral_chart && chartInputsChanged) {
    const user = db.get('users').find({ id: req.userId }).value();
    emailResult = await sendAstralChartEmail({
      to: user?.email,
      name: enriched.astral_chart.is_mother ? enriched.mother_name : enriched.name,
      chart: enriched.astral_chart,
    });
  }

  res.json({ child: enriched, email_sent: emailResult.sent });
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
  if (months < 84) return '2-7';
  if (months < 144) return '7-12';
  return '12-17';
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

const ZODIAC_SIGNS = [
  { sign: 'Aries', emoji: '♈' }, { sign: 'Tauro', emoji: '♉' },
  { sign: 'Géminis', emoji: '♊' }, { sign: 'Cáncer', emoji: '♋' },
  { sign: 'Leo', emoji: '♌' }, { sign: 'Virgo', emoji: '♍' },
  { sign: 'Libra', emoji: '♎' }, { sign: 'Escorpio', emoji: '♏' },
  { sign: 'Sagitario', emoji: '♐' }, { sign: 'Capricornio', emoji: '♑' },
  { sign: 'Acuario', emoji: '♒' }, { sign: 'Piscis', emoji: '♓' },
];

function getLunarSign(birthDate) {
  if (!birthDate) return null;
  // Moon ecliptic longitude at J2000.0 ≈ 218.3°; moves ~13.176°/day
  const refMs = new Date('2000-01-01T12:00:00Z').getTime();
  const birthMs = new Date(birthDate + 'T12:00:00Z').getTime();
  const daysSince = (birthMs - refMs) / (1000 * 60 * 60 * 24);
  let moonLon = (218.3 + 13.176 * daysSince) % 360;
  if (moonLon < 0) moonLon += 360;
  return ZODIAC_SIGNS[Math.floor(moonLon / 30) % 12];
}

// Rough fallback used only when we don't have a geocoded birth place yet (assumes
// 0° longitude). The Ascendant shifts about one sign every two hours, so this is
// just a placeholder until geocodePlace() resolves real coordinates for the child.
function getApproximateAscendant(birthDate, birthHour) {
  const refMs = new Date('2000-01-01T12:00:00Z').getTime();
  const birthMs = new Date(birthDate + 'T00:00:00Z').getTime();
  const daysSince = (birthMs - refMs) / (1000 * 60 * 60 * 24);
  const gmst = (100.4606184 + 36000.77004 * (daysSince / 36525)) % 360;
  let lst = (gmst + birthHour * 15) % 360;
  if (lst < 0) lst += 360;
  return ZODIAC_SIGNS[Math.floor(((lst + 180) % 360) / 30) % 12];
}

function getAscendant(birthDate, birthTime, lat, lon) {
  if (!birthDate || !birthTime) return null;
  const [h, min] = birthTime.split(':').map(Number);

  if (lat != null && lon != null) {
    try {
      const [year, month, day] = birthDate.split('-').map(Number);
      const origin = new Origin({
        year, month: month - 1, date: day, hour: h, minute: min,
        latitude: lat, longitude: lon,
      });
      const horoscope = new Horoscope({
        origin,
        houseSystem: 'whole-sign',
        zodiac: 'tropical',
        aspectPoints: [],
        aspectWithPoints: [],
        aspectTypes: [],
      });
      const degrees = horoscope.Ascendant.ChartPosition.Ecliptic.DecimalDegrees;
      return ZODIAC_SIGNS[Math.floor(degrees / 30) % 12];
    } catch {
      // fall through to the approximation below
    }
  }

  return getApproximateAscendant(birthDate, h + min / 60);
}

// Pregnancy is approximated as 280 days (40 weeks) from LMP to the due date. We divide
// those 40 weeks evenly into the 9 monthly content fragments (≈4.44 weeks each) — this
// is a content-bucketing approximation, not an obstetric month definition.
function getPregnancyMonth(dueDate) {
  if (!dueDate) return null;
  const due = new Date(dueDate + 'T00:00:00Z');
  if (Number.isNaN(due.getTime())) return null;
  const msPerDay = 1000 * 60 * 60 * 24;
  const daysUntilDue = (due.getTime() - Date.now()) / msPerDay;
  const weeksPregnant = (280 - daysUntilDue) / 7;
  const month = Math.ceil(weeksPregnant / (40 / 9));
  return Math.min(9, Math.max(1, month || 1));
}

function enrichChild(child) {
  const isEmbarazo = child.age_stage === 'embarazo';
  const chartDate = isEmbarazo ? child.mother_birth_date : child.birth_date;
  const chartTime = isEmbarazo ? child.mother_birth_time : child.birth_time;
  const chartLat = isEmbarazo ? child.mother_birth_lat : child.birth_lat;
  const chartLon = isEmbarazo ? child.mother_birth_lon : child.birth_lon;
  return {
    ...child,
    astral_chart: chartDate ? {
      solar: getSolarSign(chartDate),
      lunar: getLunarSign(chartDate),
      ascendant: getAscendant(chartDate, chartTime, chartLat, chartLon),
      is_mother: isEmbarazo,
    } : null,
    pregnancy_month: isEmbarazo ? getPregnancyMonth(child.due_date) : null,
  };
}

module.exports = { getChildren, addChild, updateChild, deleteChild };
