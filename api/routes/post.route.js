import express from 'express';
import { verifyToken } from '../utils/verifyUser.js';
import { create, deletepost, getposts, updatepost, registerUser, registerPostForUser } from '../controllers/post.controller.js';

const router = express.Router();

router.post('/create', verifyToken, create);
router.get('/getposts', getposts);
router.delete('/deletepost/:postId/:userId', verifyToken, deletepost);
router.put('/updatepost/:postId/:userId', verifyToken, updatepost);
router.post('/register/:postId', verifyToken, registerUser);
router.post('/:postId/register', registerPostForUser);

export default router;