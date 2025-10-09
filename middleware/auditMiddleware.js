import { logAction } from '../controllers/auditController.js';

// Logs all incoming requests (global middleware)
export const auditRequestLogger = async (req, res, next) => {
  try {
    const userId = req.user?.user_id || null;
    const action = `HTTP_${req.method}`;
    const details = {
      path: req.originalUrl,
      body: req.body,
      query: req.query,
    };

    await logAction(userId, null, action, details);
  } catch (err) {
    console.error('Audit request logging error:', err.message);
  }
  next();
};

// Logs specific actions (like UPLOAD, REVIEW)
export const auditLog = (action, detailsFn = () => ({})) => {
  return async (req, res, next) => {
    const originalJson = res.json;

    res.json = async (body) => {
      try {
        const userId = req.user?.user_id || null;
        const documentId = req.params?.documentId || body?.document_id || null;
        const details = detailsFn(req, body);

        await logAction(userId, documentId, action, details);
      } catch (err) {
        console.error('Audit action error:', err.message);
      }

      return originalJson.call(res, body);
    };

    next();
  };
};