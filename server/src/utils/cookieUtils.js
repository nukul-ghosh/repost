/**
 * Send JWT token in httpOnly cookie
 * @param {Response} res - Express response object
 * @param {string} token - JWT token
 * @param {number} expiresIn - Expiration time in days (default: 7)
 */
const sendTokenCookie = (res, token, expiresIn = 7) => {
  const options = {
    expires: new Date(Date.now() + expiresIn * 24 * 60 * 60 * 1000), // Convert days to milliseconds
    httpOnly: true, // Cannot be accessed by client-side JavaScript (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'strict', // CSRF protection
    path: '/' // Cookie available to all routes
  };

  res.cookie('token', token, options);
};

/**
 * Clear authentication cookie
 * @param {Response} res - Express response object
 */
const clearTokenCookie = (res) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/'
  });
};

module.exports = {
  sendTokenCookie,
  clearTokenCookie
};
