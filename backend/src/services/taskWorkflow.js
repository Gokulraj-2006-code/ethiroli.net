export function canEmployeeTransition(from, to) {
  if (from === 'PENDING') return to === 'IN_PROGRESS';
  if (from === 'IN_PROGRESS' || from === 'BLOCKED') return ['IN_PROGRESS', 'UNDER_REVIEW', 'BLOCKED'].includes(to);
  return false;
}

export function canManagerTransition(from, to) {
  if (from === 'UNDER_REVIEW') return ['COMPLETED', 'IN_PROGRESS'].includes(to);
  if (from === 'BLOCKED') return ['IN_PROGRESS', 'CANCELLED'].includes(to);
  if (['PENDING', 'IN_PROGRESS'].includes(from)) return ['BLOCKED', 'CANCELLED'].includes(to);
  return false;
}
