import api from '../services/api';
import { getMatchingModule, VIBRATION_ELIGIBLE_STAGES } from './moduleMatch';

// Determines which module a logged-in user should land on, replacing the old
// generic /dashboard landing. Falls back to the module list if no child/module
// match exists yet (e.g. user hasn't added a child).
//
// The vibration test is part of onboarding, not something offered inside a
// module: if the matched child is old enough (2+) and hasn't taken it yet,
// send the user there first instead of straight into the module.
export async function resolveHomeRoute() {
  try {
    const [childRes, modRes] = await Promise.all([
      api.get('/children'),
      api.get('/modules'),
    ]);
    const children = childRes.data.children || [];
    const modules = modRes.data.modules || [];
    const myModule = getMatchingModule(children, modules);

    const eligibleChild = children.find(c => VIBRATION_ELIGIBLE_STAGES.includes(c.age_stage));
    if (eligibleChild) {
      const vibRes = await api.get('/questionnaire/result').catch(() => ({ data: { result: null } }));
      if (!vibRes.data.result) return '/cuestionario';
    }

    return myModule ? `/modulos/${myModule.id}` : '/modulos';
  } catch {
    return '/modulos';
  }
}
