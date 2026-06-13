const requestLogger = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const timeInMs = parseFloat((diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2));
    const statusCode = res.statusCode;
    const userId = req.user ? req.user.id || req.user.mobile_number : 'anonymous';
    const path = req.originalUrl;
    const method = req.method;

    const logPayload = {
      type: 'REQUEST_LOG',
      method,
      path,
      durationMs: timeInMs,
      statusCode,
      userId
    };

    if (timeInMs > 1000) {
      logPayload.type = 'SLOW_REQUEST_CRITICAL';
      console.warn(JSON.stringify(logPayload));
    } else if (timeInMs > 500) {
      logPayload.type = 'SLOW_REQUEST_WARNING';
      console.warn(JSON.stringify(logPayload));
    } else {
      console.log(JSON.stringify(logPayload));
    }
  });

  next();
};

module.exports = requestLogger;
