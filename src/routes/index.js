const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./authRoutes");
const masterRoutes = require("./masterRoutes");
const portfolioRoutes = require("./portfolioRoutes");
const caseStudyRoutes = require("./caseStudyRoutes");


// Use routes
router.use("/auth", authRoutes);
router.use("/masters", masterRoutes);
router.use("/portfolio", portfolioRoutes);
router.use("/case-studies", caseStudyRoutes);


// API info
router.get("/", (req, res) => {
  res.json({
    message: "BuilderSaaS API",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      masters: "/api/masters",
    },
  });
});

module.exports = router;
