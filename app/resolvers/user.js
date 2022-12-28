const resolvers = {
  followerCount: (parent, args, context, info) => context.dataSources.getFollowerCount(parent, args, context, info),

};

module.exports = resolvers;
