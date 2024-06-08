import './App.css';
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import ChartWrapper from './ChartWrapper';
import { Button, Card, TextInput, Icon } from '@tremor/react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import axios from 'axios'
import { RiFolder2Fill } from '@remixicon/react';

type User = {
  email: string;
};

function App() {


  const count = useRef(0);
  const [items, setItems] = useState<number[]>([0]);
  const [loggedId, setLoggedId] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);
  const oldPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    if(error) {
      alert(error)
    }
    setError(null)
  }), [error]

  const uploadChart = async (data: string) => {
    try {
      await axios.post('http://localhost:5000/api/upload-chart', { data });

    } catch (error) {
      setError('Upload failed');
    }
  };



  const handleSignup = async () => {
    if (emailRef.current && passwordRef.current) {
      const email = emailRef.current.value;
      const password = passwordRef.current.value;
      try {
        const response = await axios.post('http://localhost:5000/api/signup', { email, password });
        setLoggedId(response.data.user);
      } catch (error) {
        setError('Signup failed');
      }
    }
  };


  const handleLogin = async () => {
    if (loginEmailRef.current && loginPasswordRef.current) {
      const email = loginEmailRef.current.value;
      const password = loginPasswordRef.current.value;
      try {
        const response = await axios.post('http://localhost:5000/api/login', { email, password });
        setLoggedId(response.data.user);
      } catch (error) {
        setError('Login failed');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('http://localhost:5000/api/logout');
      setLoggedId(null);
    } catch (error) {
      setError('Logout failed');
    }
  };

  const ref = useRef({ value: null });


  return (
    <>

<nav className="w-full p-4 mb-1 flex flex-row-reverse">
        {!loggedId && <Popover>
          <PopoverTrigger asChild>
            <Button size='xs' variant='primary' className='px-4 py-2 mx-1'>Register</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Card className='mt-2'>
              <TextInput type='email' placeholder="email" className='my-2' ref={emailRef} />
              <TextInput type='password' className='my-2' placeholder='password' ref={passwordRef} />
              <div className='mb-1 flex flex-row-reverse'>
                <Button size='xs' variant='primary' className='px-4 py-1' onClick={handleSignup}>Register</Button>
              </div>
            </Card>
          </PopoverContent>
        </Popover>}
        {loggedId && <Popover>
          <PopoverTrigger asChild>
            <Button size='xs' variant='primary' className='px-4 py-2 mx-1'>Change Password</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Card className='mt-2'>
              <TextInput type='password' placeholder="password" className='my-2' ref={oldPasswordRef} />
              <TextInput type='password' className='my-2' placeholder='new password' ref={newPasswordRef} />
              <TextInput type='password' className='my-2' placeholder='new password' ref={confirmPasswordRef} />
              <div className='mb-1 flex flex-row-reverse'>
                <Button size='xs' variant='primary' className='px-4 py-1'>Change</Button>
              </div>
            </Card>
          </PopoverContent>
        </Popover>}
        {!loggedId && <Popover>
          <PopoverTrigger asChild>
            <Button size='xs' variant='primary' className='px-4 py-2 mx-2'>Login</Button>
          </PopoverTrigger>
          <PopoverContent>
            <Card className='mt-2'>
              <TextInput type='email' placeholder="email" className='my-2' ref={loginEmailRef} />
              <TextInput type='password' className='my-2' placeholder='password' ref={loginPasswordRef} />
              <div className='mb-1 flex flex-row-reverse'>
                <Button size='xs' variant='primary' className='px-4 py-2' onClick={handleLogin}>Login</Button>
              </div>
            </Card>
          </PopoverContent>
        </Popover>}
        {loggedId && <Button onClick={handleLogout} size='xs' variant='primary' className='px-4 py-2' color='red'>
          Logout
        </Button>}
        {loggedId && <Popover>
          <PopoverTrigger asChild><Button size='xs' variant='secondary' className='px-4 py-2 mx-2'><Icon size="sm" icon={RiFolder2Fill} /></Button></PopoverTrigger>
          <PopoverContent>
            <Card>
            </Card>
          </PopoverContent>
          </Popover>}
      </nav>
                          {/* add item button */}

      <div className='justify-center flex'>
        <motion.button className='rounded-md bg-rose-500 text-white p-3 self-center mb-3'
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            count.current++;
            setItems([...items, count.current]);
          }}
        >
          Add Item
        </motion.button>
      </div>
                            {/* items */}

      <Reorder.Group axis="y" values={items} onReorder={setItems}>
        <AnimatePresence mode='popLayout' >
          {items.map((id) => (
            <ChartWrapper ref={ref} key={id} id={id} count={count} items={items} setItems={setItems} chartToShow={null} uploadChart={uploadChart} />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </>
  );
}

export default App;
