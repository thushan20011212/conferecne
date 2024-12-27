import { Button, Spinner } from 'flowbite-react';
import { useEffect, useState, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import CallToAction from '../components/CallToAction';
import CommentSection from '../components/CommentSection';
import PostCard from '../components/PostCard';
import { FaMicrophone } from 'react-icons/fa';
import { useSelector } from 'react-redux';

export default function PostPage() {
  const { postSlug } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [post, setPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef(null);
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const [eventDetails, setEventDetails] = useState({
    date: '',
    time: '',
    venue: '',
    keynoteSpeakers: []
  });
  const [registerError, setRegisterError] = useState(null);
  const [isRegistered, setIsRegistered] = useState(false);

  const readText = () => {
    if (!isSpeaking) {
      const utteranceTitle = new SpeechSynthesisUtterance(post.title);
      const utteranceContent = new SpeechSynthesisUtterance(post.content);
      speechSynthesis.speak(utteranceTitle);
      speechSynthesis.speak(utteranceContent);
      setIsSpeaking(true);
      utteranceRef.current = { utteranceTitle, utteranceContent };
    } else {
      if (utteranceRef.current) {
        utteranceRef.current.utteranceTitle.onend = null;
        utteranceRef.current.utteranceContent.onend = null;
        speechSynthesis.cancel();
        setIsSpeaking(false);
        utteranceRef.current = null;
      }
    }
  };

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        if (!res.ok) {
          throw new Error('Failed to fetch post details');
        }
        const data = await res.json();
        const fetchedPost = data.posts.find(post => post.slug === postSlug);
        if (fetchedPost) {
          setPost(fetchedPost);
          setEventDetails({
            date: fetchedPost.date,
            time: fetchedPost.time,
            venue: fetchedPost.venue,
            keynoteSpeakers: Array.isArray(fetchedPost.keySpeakers) ? fetchedPost.keySpeakers : [fetchedPost.keySpeakers]
          });
        }
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };
    fetchPostDetails();
  }, [postSlug]);

  useEffect(() => {
    try {
      const fetchRecentPosts = async () => {
        const res = await fetch(`/api/post/getposts?limit=3`);
        const data = await res.json();
        if (res.ok) {
          setRecentPosts(data.posts);
        }
      };
      fetchRecentPosts();
    } catch (error) {
      console.log(error.message);
    }
  }, []);

  const handleRegister = async () => {
    try {
      const res = await fetch(`/api/post/register/${post._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: currentUser._id }),
      });
      if (res.ok) {
        const updatedPost = await res.json();
        setPost(updatedPost);
        setIsRegistered(true);
        navigate(`/session-entry/${postSlug}`); // Redirect to QR code page
      } else {
        const data = await res.json();
        throw new Error(data.message);
      }
    } catch (error) {
      setRegisterError(error);
      console.log(error.message);
    }
  };

  const handleQRCode = () => {
    navigate(`/session-entry/${postSlug}`);
  };

  useEffect(() => {
    if (post && currentUser) {
      // Check if the user is already registered
      setIsRegistered(currentUser.registeredPosts?.includes(post._id) || false);
    }
  }, [post, currentUser]);

  const conferenceDate = new Date('2025-12-03');
  const currentDate = new Date();

  if (loading)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <Spinner size='xl' />
      </div>
    );

  if (error)
    return (
      <div className='flex justify-center items-center min-h-screen'>
        <p>Error loading post.</p>
      </div>
    );

  return (
    <main className='p-3 flex flex-col max-w-6xl mx-auto min-h-screen'>
      {post && (
        <>
          <h1 className='text-3xl mt-10 p-3 text-center font-serif max-w-2xl mx-auto lg:text-4xl'>
            {post.title}
          </h1>
          <Link
            to={`/search?category=${post.category}`}
            className='self-center mt-5'
          >
            <Button color='gray' pill size='xs'>
              {post.category}
            </Button>
          </Link>
          <img
            src={post.image}
            alt={post.title}
            className='mt-10 p-3 max-h-[600px] w/full object-cover'
          />
          <div className='flex justify-between p-3 border-b border-slate-500 mx-auto w/full max-w-2xl text-xs'>
            <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>
          <div
            className='p-3 max-w-2xl mx-auto w/full post-content'
            dangerouslySetInnerHTML={{ __html: post.content }}
          ></div>
        </>
      )}
      {eventDetails.date && (
        <div className='text-gray-500 text-xs sm:text-sm flex flex-col gap-2 mt-5 text-center'>
          <p><strong>Date:</strong> {eventDetails.date}</p>
          <p><strong>Time:</strong> {eventDetails.time}</p>
          <p><strong>Venue:</strong> {eventDetails.venue}</p>
          <p><strong>Keynote Speakers:</strong> {eventDetails.keynoteSpeakers.join(', ')}</p>
        </div>
      )}
      {currentUser && currentDate <= conferenceDate && (
        <div className='flex justify-center mt-5'>
          {isRegistered ? (
            <Button onClick={handleQRCode} gradientDuoTone='purpleToBlue'>
              Already Registered - View QR Code
            </Button>
          ) : (
            <Button onClick={() => { handleRegister(); handleQRCode(); }} gradientDuoTone='purpleToBlue'>
              Register for Session
            </Button>
          )}
        </div>
      )}
      {registerError && (
        <div className='text-red-500 text-center mt-2'>
          {registerError.message}
        </div>
      )}
      <CommentSection postId={post && post._id} />

      <div className='flex flex-col justify-center items-center mb-5'>
        <h1 className='text-xl mt-5'>Recent activities</h1>
        <div className='flex flex-wrap gap-5 mt-5 justify-center'>
          {recentPosts &&
            recentPosts.map((post) => <PostCard key={post._id} post={post} />)}
        </div>
      </div>
    </main>
  );
}
