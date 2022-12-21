module.exports = {
  redisDbs: {
    authDb: {
      port: 6379,
      host: process.env.REDIS_URL,
      auth_pass: process.env.SKIP_TLS ? undefined : process.env.REDIS_AUTH,
      db: parseInt(process.env.AUTHENTICATION_STORE, 10),
      get tls() {
        return (process.env.NODE_ENV === 'test' || process.env.SKIP_TLS) ? undefined : { servername: this.host };
      },
    },
  },
};
