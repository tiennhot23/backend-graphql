const resolvers = {
  me: (parent, args, context, info) => context.dataSources.getMe(args, context, info),
  user: (parent, args, context, info) => context.dataSources.getUser(args, context, info),
  users: (parent, args, context, info) => context.dataSources.getUsers(args, context, info),

  post: (parent, args, context, info) => context.dataSources.getPost(args, context, info),
  posts: (parent, args, context, info) => context.dataSources.getPosts(args, context, info),

  comments: (parent, args, context, info) => context.dataSources.getPostComments(args, context, info),
  replies: (parent, args, context, info) => context.dataSources.getCommentReplies(args, context, info),

};

module.exports = resolvers;
