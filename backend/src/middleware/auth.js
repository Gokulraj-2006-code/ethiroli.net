import { AppError, AuthenticationError, AuthorizationError } from '../utils/errors.js';
import Session from '../models/Session.js';
import TenantUser from '../models/TenantUser.js';
import { ERROR_MESSAGES } from '../config/constants.js';
import { getRedisClient } from '../config/redis.js';
import { logger } from '../config/logger.js';

const SESSION_CACHE_PREFIX = 'session:';
const SESSION_CACHE_TTL = 30 * 60; // 30 minutes in seconds

export const isReadOnlyRoleMutation = (role, method, path = '') => {
  if (role !== 'SUPER_ADMIN') return false;
  const verb = String(method).toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(verb)) return false;
  // Allow CEO to manage staff accounts and deactivation requests
  if (/^\/(?:api\/)?v1\/(?:staff|deactivation-requests)(?:\/|$)/.test(String(path))) return false;
  return true;
};

const SUPER_ADMIN_READ_PATHS = [
  /^\/(?:api\/)?v1\/org(?:\/|$)/,
  /^\/(?:api\/)?v1\/contact-messages(?:\/|$)/,
  /^\/(?:api\/)?v1\/leaves(?:\/|$)/,
  /^\/(?:api\/)?v1\/role\/(?:dashboard|navigation|portal-config|permissions|profile|me)\/?$/,
  /^\/(?:api\/)?v1\/auth\/me\/?$/,
  /^\/(?:api\/)?v1\/(?:staff|deactivation-requests)(?:\/|$)/
];

export const isSuperAdminReadAllowed = (role, method, path) => {
  if (role !== 'SUPER_ADMIN') return true;
  const verb = String(method).toUpperCase();
  const normalizedPath = String(path || '');
  if (['GET', 'HEAD', 'OPTIONS'].includes(verb)) {
    return SUPER_ADMIN_READ_PATHS.some((pattern) => pattern.test(normalizedPath));
  }
  // Mutations are only permitted for staff account and deactivation request management.
  return /^\/(?:api\/)?v1\/(?:staff|deactivation-requests)(?:\/|$)/.test(normalizedPath);
};

const getRedisSession = async (token) => {
  try {
    const redis = getRedisClient();
    if (!redis) {
      logger.debug('Redis client unavailable, skipping cache lookup', { token: token.slice(0, 8) + '...' });
      return null;
    }

    const key = `${SESSION_CACHE_PREFIX}${token}`;
    const cached = await redis.get(key);

    if (cached) {
      logger.info('Session cache hit', { token: token.slice(0, 8) + '...' });
      const sessionData = JSON.parse(cached);
      // Refresh TTL on cache hit (sliding expiration)
      await redis.expire(key, SESSION_CACHE_TTL).catch((err) => {
        logger.warn('Failed to refresh session cache TTL', { error: err.message });
      });
      return sessionData;
    }

    logger.info('Session cache miss, falling back to MySQL', { token: token.slice(0, 8) + '...' });
    return null;
  } catch (error) {
    logger.warn('Redis session lookup failed, falling back to MySQL', { error: error.message });
    return null;
  }
};

const setRedisSession = async (token, sessionData) => {
  try {
    const redis = getRedisClient();
    if (!redis) {
      logger.debug('Redis client unavailable, skipping cache write', { token: token.slice(0, 8) + '...' });
      return;
    }

    const key = `${SESSION_CACHE_PREFIX}${token}`;
    await redis.setex(key, SESSION_CACHE_TTL, JSON.stringify(sessionData));
    logger.info('Session cached in Redis', { token: token.slice(0, 8) + '...' });
  } catch (error) {
    logger.warn('Failed to cache session in Redis', { error: error.message });
  }
};

export const lookupSession = async (token) => {
  // Try Redis cache first
  const cachedSession = await getRedisSession(token);
  if (cachedSession) {
    return cachedSession;
  }

  // Fall back to MySQL
  const sessionRecord = await Session.findByToken(token);

  if (sessionRecord) {
    // Populate Redis cache on MySQL hit
    await setRedisSession(token, sessionRecord);
  }

  return sessionRecord;
};

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : null;
    const token = req.cookies?.session_token || bearerToken || req.headers['x-session-token'];

    if (!token) {
      return next(new AuthenticationError(ERROR_MESSAGES.AUTHENTICATION_REQUIRED));
    }

    const sessionRecord = await lookupSession(token);

    if (!sessionRecord) {
      res.clearCookie('session_token');
      return next(new AuthenticationError(ERROR_MESSAGES.SESSION_EXPIRED));
    }

    if (!sessionRecord.is_active) {
      res.clearCookie('session_token');
      return next(new AuthorizationError(ERROR_MESSAGES.ACCOUNT_DEACTIVATED, { code: 'ACCOUNT_DEACTIVATED' }));
    }

    req.user = {
      id: sessionRecord.user_id,
      email: sessionRecord.email,
      full_name: sessionRecord.full_name,
      role: sessionRecord.role,
      preferences: sessionRecord.preferences,
      roles: [
        sessionRecord.role,
        ...(Array.isArray(sessionRecord.preferences?.roles) ? sessionRecord.preferences.roles : [])
      ],
      is_active: sessionRecord.is_active,
      avatar_url: sessionRecord.avatar_url || null,
      tenant_id: sessionRecord.tenant_id || null,
      tenant_role: sessionRecord.tenant_role || null,
      impersonated_by: sessionRecord.impersonated_by || null,
      impersonated_by_name: sessionRecord.impersonated_by_name || null,
      impersonated_by_role: sessionRecord.impersonator_role || null,
      impersonation_origin_token: sessionRecord.impersonation_origin_token || null
    };

    // The CEO account is a monitoring account. Enforce this centrally so an
    // overlooked route-level role check cannot grant it write access. Login
    // and other public endpoints do not pass through authenticate, while all
    // authenticated API mutations do.
    if (isReadOnlyRoleMutation(req.user.role, req.method, req.originalUrl || req.path)) {
      return next(new AuthorizationError(
        'Super Admin access is read-only.',
        { code: 'READ_ONLY_ROLE', role: req.user.role }
      ));
    }

    if (!isSuperAdminReadAllowed(req.user.role, req.method, req.originalUrl || req.path)) {
      return next(new AuthorizationError(
        'Super Admin may read company monitoring data only.',
        { code: 'READ_SCOPE_RESTRICTED', role: req.user.role }
      ));
    }

    req.portal = sessionRecord.portal_slug || 'app';
    req.sessionToken = token;
    req.clientIp = req.ip || req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AuthenticationError(ERROR_MESSAGES.AUTHENTICATION_REQUIRED, { original: error.message }));
    }
  }
};
