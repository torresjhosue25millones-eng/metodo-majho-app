// Single source of truth for the child's life-stage options. Used by Login.jsx
// (registration) and Profile.jsx (editing) — keeping these in two separate arrays
// was exactly how the age ranges drifted out of sync with the modules.
export const AGE_STAGES = [
  { value: 'embarazo', label: 'Embarazo', icon: '🤰', desc: 'Bebé en camino' },
  { value: '0-2', label: '0 a 2 años', icon: '👶', desc: 'Bebé e infante' },
  { value: '2-7', label: '2 a 7 años', icon: '🌱', desc: 'Primera infancia' },
  { value: '7-12', label: '7 a 12 años', icon: '✨', desc: 'Niñez media' },
  { value: '12-17', label: '12 a 17 años', icon: '🌟', desc: 'Adolescencia' },
];
