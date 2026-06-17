export const STAGE_MAP = { '3-7': '2-6', '8-12': '6-12', '13-18': '12-17' };

export function getMatchingModule(children, modules) {
  const firstChild = children?.[0];
  if (!firstChild || !modules?.length) return null;
  const stageKey = STAGE_MAP[firstChild.age_stage] || firstChild.age_stage;
  return modules.find(m => m.age_range === stageKey || m.age_range === firstChild.age_stage) || null;
}
