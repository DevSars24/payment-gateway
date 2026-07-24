/**
 * Async Handler Wrapper for Express routes.
 * Eliminates repetitive try-catch blocks in async controller handlers.
 * Automatically catches promise rejections and forwards them to Express next().
 * 
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware handler
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
