// Middleware: runs before a route handler to check if the user is logged in.
// Any route that requires authentication adds this function as a gatekeeper.
// If the token is valid, the request continues. If not, it's rejected with a 401.

const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(401).json({ error: "Not logged in" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = requireAuth;
