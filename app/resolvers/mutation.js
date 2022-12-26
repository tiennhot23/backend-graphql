const resolvers = {
  register: (parent, args, context, info) => context.dataSources.createUser(args, context, info),
  login: (parent, args, context, info) => context.dataSources.login(args, context, info),
  logout: (parent, args, context, info) => context.dataSources.logout(args, context, info),

  createPost: (parent, args, context, info) => context.dataSources.createPost(args, context, info),
  updatePost: (parent, args, context, info) => context.dataSources.updatePost(args, context, info),
  deletePost: (parent, args, context, info) => context.dataSources.deletePost(args, context, info),
  hidePost: (parent, args, context, info) => context.dataSources.hidePost(args, context, info),

  clapPost: (parent, args, context, info) => context.dataSources.clapPost(args, context, info),

};

module.exports = resolvers;
