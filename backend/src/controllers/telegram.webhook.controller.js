const { processWebhookUpdate } = require('../services/telegram.service');

/**
 * POST /api/v1/telegram-webhook
 * Validates secret token if configured, then processes the Telegram update.
 */
async function handleTelegramWebhook(req, res) {
  const secretToken = req.headers['x-telegram-bot-api-secret-token'];
  const expectedSecret = process.env.WEBHOOK_SECRET;

  // Validate webhook secret token if it is configured in production
  if (process.env.NODE_ENV === 'production' && expectedSecret) {
    if (secretToken !== expectedSecret) {
      console.warn('[BOT WEBHOOK] Unauthorised request to Telegram webhook endpoint. Invalid secret token.');
      return res.status(403).json({ success: false, message: 'Unauthorised.' });
    }
  }

  try {
    const update = req.body;
    if (update) {
      // Process asynchronously to avoid holding up the Telegram webhook connection
      processWebhookUpdate(update).catch(err => {
        console.error('[BOT WEBHOOK] Error processing webhook update:', err);
      });
    }
    // Telegram requires a 200 OK response immediately
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('[BOT WEBHOOK] Webhook handler error:', error);
    return res.status(200).json({ success: true }); // Always return 200 so Telegram doesn't retry endlessly
  }
}

module.exports = {
  handleTelegramWebhook
};
