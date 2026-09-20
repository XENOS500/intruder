/**
 * Self-Ping Keep-Alive Service
 * Prevents free-tier host platforms (like Render) from sleeping after 15 minutes of inactivity
 * by regularly pinging the /api/health endpoint every 14 minutes.
 */

export function startSelfPingService() {
  const pingUrl =
    process.env.SELF_PING_URL ||
    (process.env.RENDER_EXTERNAL_URL
      ? `${process.env.RENDER_EXTERNAL_URL.replace(/\/$/, '')}/api/health`
      : null);

  const isEnabled = process.env.ENABLE_SELF_PING !== 'false' && Boolean(pingUrl);
  const intervalMinutes = Number(process.env.SELF_PING_INTERVAL_MINUTES) || 14;
  const intervalMs = intervalMinutes * 60 * 1000;

  if (!isEnabled) {
    if (!pingUrl) {
      console.log(
        '[Keep-Alive] No RENDER_EXTERNAL_URL or SELF_PING_URL set. Self-ping idle (local dev mode).'
      );
    } else {
      console.log('[Keep-Alive] Self-ping disabled via ENABLE_SELF_PING=false.');
    }
    return null;
  }

  console.log(
    `[Keep-Alive] Initialized keep-alive monitor pinging ${pingUrl} every ${intervalMinutes} min.`
  );

  // Initial warm-up ping after 1 minute
  setTimeout(() => {
    executePing(pingUrl);
  }, 60000);

  // Recurring ping interval
  const timer = setInterval(() => {
    executePing(pingUrl);
  }, intervalMs);

  return timer;
}

async function executePing(url) {
  try {
    const startTime = Date.now();
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'INTRUDER-Render-KeepAlive/1.0',
        'Cache-Control': 'no-cache',
      },
    });

    const elapsed = Date.now() - startTime;
    if (response.ok) {
      const data = await response.json().catch(() => ({}));
      console.log(
        `[Keep-Alive] Ping OK (${response.status} in ${elapsed}ms) - Active rooms: ${data.activeRooms ?? 0}`
      );
    } else {
      console.warn(`[Keep-Alive] Ping received non-200 status: ${response.status}`);
    }
  } catch (error) {
    console.error(`[Keep-Alive] Ping failed: ${error.message}`);
  }
}
