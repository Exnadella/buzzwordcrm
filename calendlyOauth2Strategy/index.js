const OAuth2Strategy = require('passport-oauth2').Strategy;
const User = require('../models/userModel');
const CalendlyService = require('../services/calendlyService');
const { CALENDLY_AUTH_BASE_URL, CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } =
  process.env;

const strategy = new OAuth2Strategy(
  {
    authorizationURL: CALENDLY_AUTH_BASE_URL + '/oauth/authorize',
    tokenURL: CALENDLY_AUTH_BASE_URL + '/oauth/token',
    clientID: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
    callbackURL: REDIRECT_URI,
  },
  async (accessToken, refreshToken, _profile, cb) => {
    const calendlyService = new CalendlyService(accessToken, refreshToken);

    let userInfo;

    try {
      userInfo = await calendlyService.getUserInfo();
    } catch (error) {
      if (error.response.status == 403 && error.response.data.title == 'Insufficient scope') {
        cb()
        return
      }
    }

    try {
      const result = await User.findOrCreate({
        accessToken,
        refreshToken,
        calendlyUid: userInfo.resource.uri,
      });
      cb(null, { id: result.id });
    } catch (e) {
      console.error(e);
      cb();
    }
  }
);

module.exports = strategy;
