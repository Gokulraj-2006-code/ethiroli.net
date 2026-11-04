import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { AuthorizationError } from '../utils/errors.js';
import { getCompanyOverview, getOrganizationStructure, getPeopleDirectory, getPersonMonitoring, getAttendanceCalendar, getAttendanceCalendarMonth, assignAttendanceCoverage, createSubRole, updateSubRole, getManagerScopes, setManagerScopes } from '../controllers/organizationController.js';

const router = express.Router();
router.use(authenticate);
router.use((req, res, next) => {
  const role = req.user?.role;
  if (!['SUPER_ADMIN', 'HR', 'PROJECT_MANAGER'].includes(role)) {
    return next(new AuthorizationError('This organization service is available to HR, managers, and company monitoring.'));
  }
  next();
});

router.get('/structure', getOrganizationStructure);
router.get('/directory', getPeopleDirectory);
router.get('/people/:userId', getPersonMonitoring);
router.get('/attendance/month', getAttendanceCalendarMonth);
router.get('/attendance', getAttendanceCalendar);
router.get('/overview', getCompanyOverview);
router.use((req, res, next) => {
  if (req.method !== 'GET' && req.user?.role !== 'HR') return next(new AuthorizationError('Only HR may manage organization structure and manager scopes.'));
  next();
});
router.post('/sub-roles', createSubRole);
router.patch('/sub-roles/:id', updateSubRole);
router.get('/manager-scopes/:managerId', (req, res, next) => {
  if (req.user?.role !== 'HR') return next(new AuthorizationError('Only HR may view manager scope assignments.'));
  next();
}, getManagerScopes);
router.put('/manager-scopes/:managerId', setManagerScopes);
router.post('/attendance/coverage', (req, res, next) => {
  if (req.user?.role !== 'HR') return next(new AuthorizationError('Only HR may assign attendance coverage.'));
  next();
}, assignAttendanceCoverage);

export default router;
