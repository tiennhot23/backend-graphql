const resolvers = {
  register: (parent, args, context, info) => context.dataSources.createUser(args, context, info),
  login: (parent, args, context, info) => context.dataSources.login(args, context, info),
  logout: (parent, args, context, info) => context.dataSources.logout(args, context, info),

  createPost: (parent, args, context, info) => context.dataSources.createPost(args, context, info),
  updatePost: (parent, args, context, info) => context.dataSources.updatePost(args, context, info),
  deletePost: (parent, args, context, info) => context.dataSources.deletePost(args, context, info),
  hidePost: (parent, args, context, info) => context.dataSources.hidePost(args, context, info),

  clapPost: (parent, args, context, info) => context.dataSources.clapPost(args, context, info),
  unclapPost: (parent, args, context, info) => context.dataSources.unclapPost(args, context, info),
  clapComment: (parent, args, context, info) => context.dataSources.clapComment(args, context, info),
  unclapComment: (parent, args, context, info) => context.dataSources.unclapComment(args, context, info),

  comment: (parent, args, context, info) => context.dataSources.createComment(args, context, info),
  updateComment: (parent, args, context, info) => context.dataSources.updateComment(args, context, info),
  reply: (parent, args, context, info) => context.dataSources.replyComment(args, context, info),
  deleteComment: (parent, args, context, info) => context.dataSources.deleteComment(args, context, info),

};

module.exports = resolvers;
