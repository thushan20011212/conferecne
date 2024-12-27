import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PostCard from '../components/PostCard';

export default function Home() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/post/getPosts');
      const data = await res.json();
      setPosts(data.posts);
    };
    fetchPosts();
  }, []);

  return (
    <div>
      <div className='flex flex-col gap-6 p-28 px-3 max-w-6xl mx-auto '>
        <h1 className='text-3xl font-bold lg:text-6xl'>Welcome to the 13th conference of Software Engineering</h1>
        <p className='text-gray-500 text-xs sm:text-sm flex'>
          Prepare to be dazzled! We delve into the nexus software engineering, Deplyment technologies and the future of AI.
          We'll crack the code of intelligent machines, harness the power of data,
          and unveil the alchemy of world-changing software. Join our quest to illuminate
          the future of technology, one brilliant post at a time.
        </p>
        <div className='text-gray-500 text-xs sm:text-sm flex flex-col gap-2'>
          <p><strong>Date:</strong> December 1-3, 2023</p>
          <p><strong>Venue:</strong> International Convention Center, Cityville</p>
          <p><strong>Keynote Speakers:</strong> Dr. Jane Doe, Prof. John Smith</p>
          <p><strong>Workshops:</strong> AI in Healthcare, Data Science Bootcamp, Software Engineering Practices</p>
        </div>
        <Link
          to='/search'
          className='text-xs sm:text-sm text-teal-500 font-bold hover:underline'
        >
          View all sessions
        </Link>
      </div>
      <div className='max-w-6xl mx-auto p-3 flex flex-col gap-8 py-7'>
        {posts && posts.length > 0 && (
          <div className='flex flex-col gap-6'>
            <h2 className='text-2xl font-semibold text-left'>Recent activities</h2>
            <div className='flex flex-wrap gap-4'>
              {posts.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
