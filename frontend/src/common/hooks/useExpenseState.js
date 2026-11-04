const APPROVAL_THRESHOLDS = { autoApprove: 1000, pmApprove: 5000, adminApprove: 25000 };
const APPROVAL_ROLES = { PROJECT_MANAGER: 'pmApprove', ADMIN: 'adminApprove' };

const canUserApprove = (role, amount) => {
  if (amount <= APPROVAL_THRESHOLDS.autoApprove) return true;
  if (role === APPROVAL_ROLES.PROJECT_MANAGER && amount <= APPROVAL_THRESHOLDS.pmApprove) return true;
  if (role === APPROVAL_ROLES.ADMIN && amount <= APPROVAL_THRESHOLDS.adminApprove) return true;
  return false;
};

const getButtonLabel = (state) => {
  switch (state) {
    case 'auto-approved': return 'Auto-Approved';
    case 'pm-approvable':
    case 'admin-approvable': return 'Approve';
    case 'senior-required': return 'Send to Senior';
    case 'rejected': return 'Rejected';
    default: return 'Pending';
  }
};

const getButtonColor = (state) => {
  switch (state) {
    case 'auto-approved': return 'success';
    case 'pm-approvable': return 'info';
    case 'admin-approvable': return 'primary';
    case 'senior-required': return 'warning';
    case 'rejected': return 'error';
    default: return 'secondary';
  }
};

export const useExpenseState = (expenses = [], userRole = '') => {
  const categorized = expenses.map((expense) => {
    const amount = Number.parseFloat(expense.amount || 0);
    let state = 'senior-required';
    let approver = 'Senior Executive';
    if (amount <= APPROVAL_THRESHOLDS.autoApprove) {
      state = 'auto-approved';
      approver = 'System';
    } else if (userRole === 'PROJECT_MANAGER' && amount <= APPROVAL_THRESHOLDS.pmApprove) {
      state = 'pm-approvable';
      approver = 'PM';
    } else if (userRole === 'ADMIN' && amount <= APPROVAL_THRESHOLDS.adminApprove) {
      state = 'admin-approvable';
      approver = 'Admin';
    }
    return {
      ...expense,
      approvalState: state,
      approvalThreshold: amount <= APPROVAL_THRESHOLDS.autoApprove ? 'auto' : amount <= APPROVAL_THRESHOLDS.pmApprove ? 'pm' : amount <= APPROVAL_THRESHOLDS.adminApprove ? 'admin' : 'senior',
      suggestedApprover: approver,
      canApprove: canUserApprove(userRole, amount),
      buttonLabel: getButtonLabel(state),
      buttonColor: getButtonColor(state),
    };
  });
  return {
    approvalQueue: categorized.filter((expense) => !['auto-approved', 'rejected'].includes(expense.approvalState)),
    myApprovals: categorized.filter((expense) => expense.canApprove),
    userRole,
    canUserApprove,
    getButtonLabel,
    getButtonColor,
  };
};
