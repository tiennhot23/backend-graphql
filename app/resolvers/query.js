const resolvers = {
  me: (parent, args, context, info) => context.dataSources.getMe(args, context, info),
  user: (parent, args, context, info) => context.dataSources.getUser(args, context, info),
  users: (parent, args, context, info) => context.dataSources.getUsers(args, context, info),

};

module.exports = resolvers;
