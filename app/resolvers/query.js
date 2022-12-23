const resolvers = {
  me: (parent, args, context, info) => context.dataSources.getMe(args, context, info),
  user: (parent, args, context, info) => context.dataSources.getUSer(args, context, info),
  users: (parent, args, context, info) => context.dataSources.getUSers(args, context, info),

};

module.exports = resolvers;
