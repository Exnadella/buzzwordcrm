const express = require('express');
const { isUserAuthenticated, formatEventDateTime } = require('../utils');
const CalendlyService = require('../services/calendlyService');
const User = require('../models/userModel');
const router = express.Router();

router
  .get('/', (req, res) => {
    res.render('index');
  })
  .get('/logout', async (req, res) => {
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user?.clear_tokens_on_logout) await User.delete(user.id);
      req.session = null;
    }
    res.redirect('/');
  })
  .get('*', (req, res) => {
    res.render('index');
  });

module.exports = router;
