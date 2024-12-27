import Post from '../models/post.model.js';
import User from '../models/user.model.js';
import { errorHandler } from '../Utils/error.js';

export const create = async (req, res, next) => {
  if (!req.body.title || !req.body.content || !req.body.date || !req.body.time || !req.body.keySpeakers || !req.body.venue) {
    return next(errorHandler(400, 'Please provide all required fields'));
  }
  const slug = req.body.title
    .split(' ')
    .join('-')
    .toLowerCase()
    .replace(/[^a-zA-Z0-9-]/g, '');
  const newPost = new Post({
    ...req.body,
    slug,
    userId: req.user.id,
  });
  try {
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    next(error);
  }
};

export const getposts = async (req, res, next) => {
  try {
    const startIndex = parseInt(req.query.startIndex) || 0;
    const limit = parseInt(req.query.limit) || 9;
    const sortDirection = req.query.order === 'asc' ? 1 : -1;
    const posts = await Post.find({
      ...(req.query.userId && { userId: req.query.userId }),
      ...(req.query.category && { category: req.query.category }),
      ...(req.query.slug && { slug: req.query.slug }),
      ...(req.query.postId && { _id: req.query.postId }),
      ...(req.query.searchTerm && {
        $or: [
          { title: { $regex: req.query.searchTerm, $options: 'i' } },
          { content: { $regex: req.query.searchTerm, $options: 'i' } },
        ],
      }),
    })
      .sort({ updatedAt: sortDirection })
      .skip(startIndex)
      .limit(limit);

    const totalPosts = await Post.countDocuments();

    const now = new Date();

    const oneMonthAgo = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      now.getDate()
    );

    const lastMonthPosts = await Post.countDocuments({
      createdAt: { $gte: oneMonthAgo },
    });

    res.status(200).json({
      posts,
      totalPosts,
      lastMonthPosts,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deletepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to delete this post'));
  }
  try {
    await Post.findByIdAndDelete(req.params.postId);
    res.status(200).json('The post has been deleted');
  } catch (error) {
    next(error);
  }
};

export const updatepost = async (req, res, next) => {
  if (!req.user.isAdmin || req.user.id !== req.params.userId) {
    return next(errorHandler(403, 'You are not allowed to update this post'));
  }
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          category: req.body.category,
          image: req.body.image,
          date: req.body.date,
          time: req.body.time,
          keySpeakers: req.body.keySpeakers,
          venue: req.body.venue,
        },
      },
      { new: true }
    );
    res.status(200).json(updatedPost);
  } catch (error) {
    next(error);
  }
};

export const registerUser = async (req, res) => {
  const { postId } = req.params;
  const { userId } = req.body;

  try {
    const post = await Post.findById(postId);
    const user = await User.findById(userId);

    if (!post || !user) {
      return res.status(404).json({ message: 'Post or User not found' });
    }

    if (user.registeredPosts.includes(postId)) {
      return res.status(400).json({ message: 'User already registered for this post' });
    }

    // Increment the registered users count in the post
    post.registeredUsersCount = (post.registeredUsersCount || 0) + 1;
    await post.save();

    // Increment the registered posts count in the user and add the post ID to the list of registered posts
    user.registeredPostsCount = (user.registeredPostsCount || 0) + 1;
    user.registeredPosts.push(postId);
    await user.save();

    res.status(200).json(post);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const registerPostForUser = async (req, res) => {
  try {
    const user = await User.findById(req.body.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.registeredPosts.includes(req.params.postId)) {
      return res.status(400).json({ message: 'User already registered for this post' });
    }

    user.registeredPosts.push(req.params.postId);
    user.registeredPostsCount = user.registeredPosts.length;
    await user.save();
    res.status(200).json({ message: 'Post registered successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
