import express from 'express';
import { test, updateUser, getUsers, deleteUser, signout, registerForPost, getUserRegisteredPosts } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/test', test);
router.put('/update/:userId', verifyToken, updateUser);
router.get('/getusers', verifyToken, getUsers);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout', signout);
router.post('/register/:postId', verifyToken, registerForPost);
router.get('/:userId/registered-posts', getUserRegisteredPosts);

export default router;