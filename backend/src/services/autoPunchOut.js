import pool from '../config/database.js';
import { createNotification } from '../controllers/notificationController.js';
import { broadcastToUser } from '../services/socketService.js';

let lastRunDate = null;

function todayIST() {
  return new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });
}

export function startAutoPunchOut() {
  setInterval(async () => {
    try {
      const now = new Date();
      const ist = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
      // Run at 10:00 PM IST (22:00) — use >= 22:00 so we don't miss if server is busy
      if (ist.getHours() < 22) return;
      const today = todayIST();
      if (lastRunDate === today) return;
      lastRunDate = today;
      const cutoff = `${today} 22:00:00`;
      console.log(`[Auto Punch-Out] Running at ${today} 22:00 IST`);

      // 1. Find all ACTIVE sessions for today's business date
      const [rows] = await pool.execute(
        `SELECT id, user_id, work_date, check_in_time
         FROM attendance_sessions
         WHERE status = 'ACTIVE' AND work_date = ? AND check_out_time IS NULL`,
        [today]
      );

      if (rows.length === 0) {
        console.log('[Auto Punch-Out] No active sessions to close.');
        return;
      }

      console.log(`[Auto Punch-Out] Found ${rows.length} active session(s) to close at 10 PM IST`);

      // 2. Close each session with automatic punch-out marker (is_unconfirmed = 1)
      for (const row of rows) {
        await pool.execute(
          `UPDATE attendance_sessions
           SET check_out_time = ?, status = 'COMPLETED', updated_at = NOW(), is_unconfirmed = 1
           WHERE id = ? AND status = 'ACTIVE'`,
          [cutoff, row.id]
        );

        // 3. Update the daily attendance row
        await pool.execute(
          `UPDATE attendance
           SET check_out_time = COALESCE(check_out_time, ?),
               status = 'PRESENT',
               updated_at = NOW(),
               is_unconfirmed = 1
           WHERE user_id = ? AND date = ? AND check_in_time IS NOT NULL AND check_out_time IS NULL`,
          [cutoff, row.user_id, row.work_date]
        );

        // 4. Send notification to the user
        try {
          await createNotification(
            row.user_id,
            'ATTENDANCE_AUTO_PUNCH_OUT',
            'Auto Punch-Out at 10:00 PM',
            'You forgot to punch out. Your session was automatically closed at 10:00 PM IST.',
            'ATTENDANCE',
            row.id
          );
          // Broadcast via socket if online
          broadcastToUser(row.user_id, 'attendance_auto_punch_out', {
            user_id: row.user_id,
            work_date: row.work_date,
            check_out_time: cutoff,
            message: 'You forgot to punch out. Your session was automatically closed at 10:00 PM IST.'
          });
        } catch (notifyErr) {
          console.error(`[Auto Punch-Out] Notification failed for user ${row.user_id}:`, notifyErr.message);
        }
      }

      console.log(`[Auto Punch-Out] Completed: ${rows.length} session(s) auto-closed at 10 PM IST`);
    } catch (err) {
      console.error('Auto punch-out error:', err.message);
    }
  }, 60000); // Check every minute
  console.log('Auto punch-out scheduler started (10:00 PM IST)');
}
