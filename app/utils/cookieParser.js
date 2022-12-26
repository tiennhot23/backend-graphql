const _ = require('lodash');

const parseCookie = async (req, __, next) => {
  req.cookie = {};
  _.split(req.headers.cookie, ';').forEach(cookie => {
    const [name, ...rest] = cookie.split('=');
    if (name.trim() === 'sid' || name.trim() === 'connect.sid') {
      req.cookie.sid = rest[0].split('.')[0].substring(4);
    } else {
      req.cookie[name.trim()] = rest[0];
    }
  });
  next();
};

module.exports = parseCookie;
