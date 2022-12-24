module.exports = {
  hash: {
    saltRound: Number(process.env.SALT_ROUND) || 10,
  },
  accessToken: {
    name: 'access-token',
  },
};
