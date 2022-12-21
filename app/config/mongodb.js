module.exports = {
  mongo: {
    database: process.env.DB_CONNECTION_STRING || 'mongodb://localhost/medium_test',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    },
  },
};
