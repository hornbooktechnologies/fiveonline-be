const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { MAX_FILE_SIZE } = require('../config/constants');

// Configure memory storage (default)
const memoryStorage = multer.memoryStorage();

// Configure disk storage for Projects
const projectDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/projects';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure disk storage for Portfolio
const portfolioDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/portfolio';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// Configure disk storage for Case Study
const caseStudyDiskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/case-studies';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: memoryStorage,
  limits: {
    fileSize: MAX_FILE_SIZE?.DOCUMENT || 5 * 1024 * 1024,
  },
});

const projectUpload = multer({
  storage: projectDiskStorage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit for projects (videos)
  },
});

const portfolioUpload = multer({
  storage: portfolioDiskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for portfolio images
  },
});

const caseStudyUpload = multer({
  storage: caseStudyDiskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for case study images
  },
});

module.exports = {
  upload,
  projectUpload,
  portfolioUpload,
  caseStudyUpload,
};

