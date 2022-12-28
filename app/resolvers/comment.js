const resolvers = {
  user: (parent, args, context, info) => context.dataSources.getCommentUser(parent, args, context, info),

};

module.exports = resolvers;
