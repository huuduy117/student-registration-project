/**
 * Sends a structured error response as per antigravity_agent_prompt rules
 */
exports.sendError = (res, statusCode, errorCode, message, context = null) => {
  const payload = {
    success: false,
    error_code: errorCode,
    message: message,
  };
  if (context) {
    payload.context = context;
  }
  return res.status(statusCode).json(payload);
};

/**
 * Sends a structured success response as per antigravity_agent_prompt rules
 */
exports.sendSuccess = (res, action, data = null, affectedTables = [], message = null) => {
  const payload = {
    success: true,
    action: action,
    data: data,
    affected_tables: affectedTables,
  };
  if (message) {
    payload.message = message;
  }
  return res.status(200).json(payload);
};
