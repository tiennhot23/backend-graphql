const resolvers = {
  followerCount: (parent, args, context, info) => context.dataSources.getFollowerCount(parent, args, context, info),
  followers: (parent, args, context, info) => context.dataSources.getFollowers(parent, args, context, info),

};

// TODO write resolver for type field here
// TODO should use specific name instead of parent

module.exports = resolvers;
