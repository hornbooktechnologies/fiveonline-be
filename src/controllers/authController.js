const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserDao = require("../dao/userDao");
const { sendEmail, emailTemplates } = require("../services/emailService");
const {
  JWT_SECRET,
  JWT_EXPIRE,
  JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRE,
  BCRYPT_SALT_ROUNDS,
} = require("../config/constants");

/* ───── LOGIN ───── */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // Find user by email
    const user = await UserDao.findUserByEmail(email);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // Check if account is active
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive. Please contact admin.",
      });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid email or password" });
    }

    // JWT payload
    const payload = {
      id: user.id,
      role_id: user.role_id,
      builder_id: user.builder_id,
      email: user.email,
      name: user.name,
    };

    // Generate access token
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });

    // Generate refresh token
    const refreshToken = jwt.sign({ id: user.id }, JWT_REFRESH_SECRET, {
      expiresIn: JWT_REFRESH_EXPIRE,
    });

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      refreshToken,
      user: {
        id: user.id,
        builder_id: user.builder_id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        status: user.status,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: error.message,
    });
  }
};

/* ───── REFRESH TOKEN ───── */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res
        .status(400)
        .json({ success: false, message: "Refresh token is required" });
    }

    // Verify refresh token
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET);

    // Find user
    const user = await UserDao.findUserById(decoded.id);
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    if (user.status !== "active") {
      return res
        .status(403)
        .json({ success: false, message: "Account is inactive" });
    }

    // Generate new access token
    const payload = {
      id: user.id,
      role_id: user.role_id,
      builder_id: user.builder_id,
      email: user.email,
      name: user.name,
    };

    const newToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRE,
    });

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      token: newToken,
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Refresh token expired. Please login again.",
        code: "RefreshTokenExpired",
      });
    }

    console.error("Refresh Token Error:", error);
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

/* ───── FORGOT PASSWORD ───── */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await UserDao.findUserByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "This email address does not exist.",
      });
    }

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?id=${user.id}`;
    const template = emailTemplates.forgotPassword({ resetLink });

    if (process.env.SMTP_USER) {
      await sendEmail({
        to: email,
        subject: template.subject,
        html: template.html,
        text: "Reset Password",
      });
    } else {
      console.log(`[DEV] Forgot Password Link for ${email}: ${resetLink}`);
    }

    res.status(200).json({
      success: true,
      message: "A password reset link has been sent to your email.",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

/* ───── RESET PASSWORD ───── */
const resetPassword = async (req, res) => {
  try {
    const { userId, password, confirm_password } = req.body;

    if (!userId || !password || !confirm_password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    if (password !== confirm_password) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const updated = await UserDao.updateUserPassword(userId, password);

    if (updated) {
      const user = await UserDao.findUserById(userId);

      if (user && process.env.SMTP_USER) {
        const template = emailTemplates.resetPasswordSuccess();
        await sendEmail({
          to: user.email,
          subject: template.subject,
          html: template.html,
          text: "Password Reset Successful",
        });
      }

      res.status(200).json({
        success: true,
        message: "Your password has been successfully updated.",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to update password. User not found.",
      });
    }
  } catch (error) {
    console.error("Reset Password Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  login,
  refreshToken,
  forgotPassword,
  resetPassword,
};
