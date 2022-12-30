const resolvers = {
  followerCount: (parent, args, context, info) => context.dataSources.getFollowerCount(parent, args, context, info),
  followers: (parent, args, context, info) => context.dataSources.getFollowers(parent, args, context, info),

};

module.exports = resolvers;
