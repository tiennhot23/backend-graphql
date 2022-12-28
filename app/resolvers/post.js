const resolvers = {
  owner: (parent, args, context, info) => context.dataSources.getPostOwner(parent, args, context, info),
  clapCount: (parent, args, context, info) => context.dataSources.getPostClapCount(parent, args, context, info),

};

module.exports = resolvers;
