/* eslint-disable no-unused-vars */
const { parse } = require('graphql');
const { AuthenticationError } = require('apollo-server-express');
const { getAccessToken, removeAccessToken, getCachedUserById } = require('./datasources/utils/controllers');

async function createContext({ req, res }) {
  const context = {
    req,
    res,
  };
  const { query } = req.body;
  const ast = parse(`${query}`);
  const fieldNodes = ast.definitions[0].selectionSet.selections; // === resolverInfo.fieldNodes

  const { uid, deviceId } = req.cookie;
  const authHeader = req.headers.authorization;
  const authToken = authHeader && authHeader.split(' ')[1];
  if (uid && deviceId && authToken) {
    const token = await getAccessToken(uid, deviceId);

    if (!token || token !== authToken) {
      await removeAccessToken(uid, deviceId);
      res.clearCookie('uid');
      res.clearCookie('deviceid');
      throw new AuthenticationError('[UNUSUAL REQUEST] Cannot authorized. Please login again');
    }

    const authUser = await getCachedUserById(uid);
    if (!authUser || authUser.status !== 'Active') {
      throw new AuthenticationError('Cannot authorized');
    }
    context.authUser = authUser;
  }
  return context;
}

module.exports = createContext;
