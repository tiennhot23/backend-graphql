const { ClapModel, PostModel } = require('../../models');
const { getCachedPostById } = require('../../utils/controllers');

async function clapPost(args, context, info) {
  try {
    const { postId, count = 1 } = args;
    const { signature } = context;
    const { _id: userId } = signature;

    if (count <= 0) {
      return {
        isSuccess: false,
        message: 'Clap failed',
      };
    }
    const post = await PostModel.findById(postId, 'owner status').lean();
    if (!post || post.status !== 'Visible') {
      return {
        isSuccess: false,
        message: 'Invalid post',
      };
    }
    const clap = await ClapModel.findOneAndUpdate(
      { post: postId, user: userId, postOwner: post.owner },
      { $inc: { count } },
      { new: true, projection: 'count', upsert: true },
    ).lean();

    if (!clap) {
      return {
        isSuccess: false,
        message: 'Clap failed',
      };
    }
    return {
      isSuccess: true,
      message: 'Clapped',
    };
  } catch (error) {
    logger.error('clap post error', { error: error.stack });
    throw error;
  }
}

async function unclapPost(args, context, info) {
  try {
    const { postId } = args;
    const { signature } = context;
    const { _id: userId } = signature;

    const post = await getCachedPostById(postId);
    const result = await ClapModel.deleteOne(
      { post: postId, user: userId, postOwner: post.owner },
    );

    if (result.deletedCount === 0) {
      return {
        isSuccess: false,
        message: 'Unclap failed',
      };
    }
    return {
      isSuccess: true,
      message: 'Unclapped',
    };
  } catch (error) {
    logger.error('unclap post error', { error: error.stack });
    throw error;
  }
}

async function clapComment(args, context, info) {
  try {
    const { commentId, count = 1 } = args;
    const { signature } = context;
    const { _id: userId } = signature;

    if (count <= 0) {
      return {
        isSuccess: false,
        message: 'Clap failed',
      };
    }
    const clap = await ClapModel.findOneAndUpdate(
      { comment: commentId, user: userId },
      { $inc: { count } },
      { new: true, projection: 'count', upsert: true },
    ).lean();

    if (!clap) {
      return {
        isSuccess: false,
        message: 'Clap failed',
      };
    }
    return {
      isSuccess: true,
      message: 'Clapped',
    };
  } catch (error) {
    logger.error('clap comment error', { error: error.stack });
    throw error;
  }
}

async function unclapComment(args, context, info) {
  try {
    const { commentId } = args;
    const { signature } = context;
    const { _id: userId } = signature;

    const result = await ClapModel.deleteOne(
      { comment: commentId, user: userId },
    );

    if (result.deletedCount === 0) {
      return {
        isSuccess: false,
        message: 'Unclap failed',
      };
    }
    return {
      isSuccess: true,
      message: 'Unclapped',
    };
  } catch (error) {
    logger.error('unclap post error', { error: error.stack });
    throw error;
  }
}

module.exports = { clapPost, unclapPost, clapComment, unclapComment };
