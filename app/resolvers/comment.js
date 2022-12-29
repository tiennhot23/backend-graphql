const resolvers = {
  user: (parent, args, context, info) => context.dataSources.getUserOfComment(parent, args, context, info),
  post: (parent, args, context, info) => context.dataSources.getPostOfComment(parent, args, context, info),

};

module.exports = resolvers;
