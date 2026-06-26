// Legacy/alias age_stage values (from earlier schema versions or other forms) mapped
// to the current canonical keys: embarazo, 0-2, 2-7, 7-12, 12-17.
export const STAGE_MAP = {
  '3-7': '2-7', '8-12': '7-12', '13-18': '12-17',
  '2-6': '2-7', '6-12': '7-12',
};

// The vibration test only applies once a child can express enough personality
// for it to be meaningful — not during pregnancy or the 0-2 stage.
export const VIBRATION_ELIGIBLE_STAGES = ['2-7', '7-12', '12-17', '2-6', '6-12', '3-7', '8-12', '13-18'];

// Registration lets a mom skip naming her child, in which case the backend stores a
// generic placeholder. Treat those as "no name" rather than printing them literally.
export const PLACEHOLDER_CHILD_NAMES = ['Mi hijo/a', 'Bebé en camino'];

export function childDisplayName(child) {
  if (!child?.name || PLACEHOLDER_CHILD_NAMES.includes(child.name)) return 'Tu hijo/a';
  return child.name;
}

// For editable form inputs (as opposed to read-only display): a placeholder name
// should appear as an empty field to fill in, not as text the mom edits around —
// that's exactly how "Mi hijo/a" ended up prepended to real names like "miaMi hijo/a".
export function childEditableName(child) {
  if (!child?.name || PLACEHOLDER_CHILD_NAMES.includes(child.name)) return '';
  return child.name;
}

export function getMatchingModule(children, modules) {
  const firstChild = children?.[0];
  if (!firstChild || !modules?.length) return null;
  const stageKey = STAGE_MAP[firstChild.age_stage] || firstChild.age_stage;
  return modules.find(m => m.age_range === stageKey || m.age_range === firstChild.age_stage) || null;
}
