import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js';

export const test = (req, res) => {
    res.json({message: 'API is working!'});
};

export const updateUser = async (req, res, next) => {
     if (req.user.id !== req.params.userId){
        return next(errorHandler(403, 'You are not allowed to update this user'));
     }
     if (req.body.password){
        if(req.body.password.length < 6){
            return next(errorHandler(400, 'Password must be at least 6 characters'));
        }
        req.body.password = bcryptjs.hashSync(req.body.password, 10);
     };
     if(req.body.username){
        if(req.body.username.length < 7 || req.body.username.length > 20){
            return next(errorHandler(400, 'Username must be between 7 and 20 character'));
        }
        if(req.body.username.includes(' ')){
            return next(errorHandler(400, 'Username cannot contain spaces'));
        }
        if(req.body.username !== req.body.username.toLowerCase()){
            return next(errorHandler(400, 'Username must be lowercase'));
        }
        if(!req.body.username.match(/^[a-zA-Z0-9]+$/)){
            return next(errorHandler(400, 'Username can only contain letters and numbers'));
        }
        try {
            const updateUser = await User.findByIdAndUpdate(
              req.params.userId,
              {
                $set: {
                  ...(req.body.username && { username: req.body.username }),
                  ...(req.body.email && { email: req.body.email }),
                  ...(req.body.profilePicture && { profilePicture: req.body.profilePicture }),
                  ...(req.body.password && { password: req.body.password }),
                },
              },
              { new: true }
            );
            const {password, ...rest} = updateUser._doc;
            res.status(200).json(rest);
        } catch (error) {
            next(error);
        }
     }
}

export const getUsers = async (req, res) => {
  try {
    const { startIndex = 0, limit = 10 } = req.query;
    const users = await User.find()
      .skip(parseInt(startIndex))
      .limit(parseInt(limit));
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const signout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'User signed out successfully' });
};

export const registerForPost = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const postId = req.params.postId;

    // Update user's registered posts count
    await User.findByIdAndUpdate(userId, {
      $inc: { registeredPostsCount: 1 },
    });

    // Update post's registered users count
    await Post.findByIdAndUpdate(postId, {
      $inc: { registeredUsersCount: 1 },
    });

    res.status(200).json({ message: 'User registered for the post successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUserRegisteredPosts = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user.registeredPosts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};