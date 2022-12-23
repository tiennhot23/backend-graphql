module.exports = {
  redisDbs: {
    authDb: {
      port: 6379,
      host: process.env.REDIS_URL || 'localhost',
      auth_pass: process.env.SKIP_TLS ? undefined : process.env.REDIS_AUTH,
      db: parseInt(process.env.AUTHENTICATION_STORE || '0', 10),
      get tls() {
        return (process.env.NODE_ENV === 'test' || process.env.SKIP_TLS) ? undefined : { servername: this.host };
      },
    },
    cacheDb: {
      port: 6379,
      host: process.env.REDIS_URL || 'localhost',
      db: parseInt(process.env.AUTHENTICATION_STORE || '1', 10),
    },
  },
};
