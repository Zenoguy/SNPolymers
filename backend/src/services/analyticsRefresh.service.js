const { supabase } = require('../db/supabase');

const REFRESH_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Executes the database-level analytics refresh RPC.
 */
async function executeAnalyticsRefresh() {
  const { error } = await supabase.rpc('refresh_analytics_views');
  if (error) throw error;
}

/**
 * Starts the periodic analytics views refresh scheduler.
 */
function startAnalyticsRefreshScheduler() {
  console.log('[ANALYTICS SCHEDULER] Periodic materialized views refresh scheduler registered (15m).');

  const runRefresh = async () => {
    console.log('[ANALYTICS SCHEDULER] Running scheduled view refresh...');
    const startTime = Date.now();
    try {
      await executeAnalyticsRefresh();
      const duration = Date.now() - startTime;
      console.log(`[ANALYTICS SCHEDULER] Completed successfully in ${duration} ms.`);
    } catch (err) {
      console.error('[ANALYTICS SCHEDULER] Periodic refresh failed:', err.message || err);
    } finally {
      scheduleNext();
    }
  };

  const scheduleNext = () => {
    setTimeout(runRefresh, REFRESH_INTERVAL_MS);
  };

  scheduleNext();
}

module.exports = {
  executeAnalyticsRefresh,
  startAnalyticsRefreshScheduler
};
