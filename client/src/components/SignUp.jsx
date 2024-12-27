import { Alert, Button, Label, Spinner, TextInput } from 'flowbite-react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OAuth from '../components/OAuth';

export default function SignUp() {
  const [formData, setFormData] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const handleChange = (e) =>{
    setFormData({...formData, [e.target.id]: e.target.value.trim() });
  };
  const handleSubmit = async (e) =>{
    e.preventDefault();
    if(!formData.username || !formData.email || !formData.password){
      return setErrorMessage('Please fill out all fields!');
    }
    try{
      setLoading(true);
      setErrorMessage(null);
      const res = await fetch ('/api/auth/signup',{
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if(data.success === false)
      {
        return setErrorMessage(data.message);
      }
      setLoading(false);
      if(res.ok){
        navigate('/sign-in');
      }
    }catch (error){
      setErrorMessage(error.message);
      setLoading(false);
    }
  };
  return (
    <div className='min-h-screen mt-20'>
      <div className='flex p-3 max-w-3xl mx-auto flex-col md:flex-row md:items-center gap-5'>
        {/* left */}
        <div className='flex-1'>
          <Link to='/' className='font-bold dark:text-white text-4xl'>
          <span className='px-1 py-1 bg-gradient-to-r from-sky-500 to-emerald-500s text-white'> D- </span>
          Blog
          </Link>
          <p className='text-sm mt-5'>
            This is a blog project. Write your bolgs here.
          </p>
        </div>
        {/* right */}
        <div className='flex-1'>
          <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
            <div>
              <Label value='Your username'/>
              <TextInput
                type='text'
                placeholder='Username'
                id='username' onChange={handleChange}/>
            </div>
            <div>
              <Label value='Your email'/>
              <TextInput
                type='email'
                placeholder='Email'
                id='email' onChange={handleChange}/>
            </div>
            <div>
              <Label value='Your password'/>
              <TextInput
                type='password'
                placeholder='Password'
                id='password' onChange={handleChange}/>
            </div>
            <div className='flex flex-col'>
              <Button type='submit' disabled={loading}>
                {
                  loading ? (
                    <>
                    <Spinner size='sm' />
                    <span className='pl-3'> Loading...</span>
                    </>
                  ) : 'Sign Up'
                }
              </Button>
              
            </div>
            <OAuth/>
          </form>
          <div className='flex gap-2 text-sm mt-2'>
            <span>Have an account?  </span>
            <Link to='/sign-in' className='text-blue-500' >
              Sign in
            </Link>
          </div>
          {
            errorMessage && (
              <Alert className='mt-5' color='failure'>
                {errorMessage}
              </Alert>
            )
          }
        </div>
      </div>
    </div>
  )
}
