/**
 * Wraps an async function to handle errors automatically
 * @param {Function} fn - Async function to wrap
 * @returns {Function} Express middleware function
 */
module.exports = fn => {
    return (req, res, next) => {
        fn(req, res, next).catch(next);
    };
};
