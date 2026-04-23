const jwt = require("jsonwebtoken");
const { JWT_SECRET, ROLE_IDS } = require("../config/constants");
const userDao = require("../dao/userDao");

/**
 * Middleware to verify JWT token and attach user to request
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    // Verify user still exists and is active
    const user = await userDao.findUserById(decoded.id);
    if (!user) {
      return res
        .status(403)
        .json({ success: false, message: "User account not found" });
    }

    if (user.status !== "active") {
      return res
        .status(403)
        .json({ success: false, message: "Account is inactive" });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired. Please login again.",
        code: "TokenExpiredError",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token. Please login again.",
        code: "JsonWebTokenError",
      });
    }

    console.error("JWT Verification Error:", error.name, error.message);
    res.status(401).json({
      success: false,
      message: "Authentication failed",
      code: error.name,
    });
  }
};

/**
 * Middleware to check if user has required role(s) by role_id
 * @param {number|number[]} allowedRoleIds - Single role_id or array of allowed role_ids
 *
 * Usage:
 * - checkRole(ROLE_IDS.SUPER_ADMIN) - Only Super Admin
 * - checkRole([ROLE_IDS.SUPER_ADMIN, ROLE_IDS.BUILDER]) - Super Admin or Builder
 */
const checkRole = (allowedRoleIds) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const userRoleId = Number(req.user.role_id);
      const rolesArray = Array.isArray(allowedRoleIds)
        ? allowedRoleIds
        : [allowedRoleIds];

      if (!rolesArray.includes(userRoleId)) {
        return res.status(403).json({
          success: false,
          message: "Access denied. Insufficient permissions.",
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error checking permissions",
      });
    }
  };
};

module.exports = {
  authMiddleware,
  checkRole,
};
