import './App.css';
import { useState, useRef } from "react";
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import ChartWrapper from './ChartWrapper';
import { Button, Card, TextInput } from '@tremor/react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';

function App() {
  const count = useRef(0);
  const [items, setItems] = useState([0]);

  const ref = useRef({ value: null });

  return (
    <>
<div className="w-full p-4 mb-1 flex flex-row-reverse">
<Popover>
  <PopoverTrigger asChild><Button size='xs' variant='primary' className='px-4 py-2 mx-1'>Register</Button></PopoverTrigger>
  <PopoverContent>
    <Card className='mt-2'>
    <TextInput type='email' placeholder="email" className='my-2'></TextInput>
    <TextInput type='password' className='my-2' placeholder='password'></TextInput>
    <div className='mb-1 flex flex-row-reverse'><Button size='xs' variant='primary' className='px-4 py-1'>Register</Button>
    </div>
    </Card>
  </PopoverContent>
</Popover>

<Popover>
  <PopoverTrigger asChild><Button size='xs' variant='primary' className='px-4 py-2 mx-2'>Login</Button></PopoverTrigger>
  <PopoverContent>
    <Card className='mt-2'>
    <TextInput type='email' placeholder="email" className='my-2'></TextInput>
    <TextInput type='password' className='my-2' placeholder='password'></TextInput>
    <div className='mb-1 flex flex-row-reverse'><Button size='xs' variant='primary' className='px-4 py-2'>Login</Button></div>
    </Card>
  </PopoverContent>
</Popover>

<Button size='xs' variant='primary' className='px-4 py-2' color='red'>Logout</Button>
</div>


    
      <div className='justify-center flex'>
        <motion.button className='rounded-md bg-rose-500 text-white p-3 self-center mb-3'
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            count.current++;
            setItems([...items, count.current]);
          }}
        >
          Add item
        </motion.button>
      </div>

      <Reorder.Group axis="y" values={items} onReorder={setItems}>
        <AnimatePresence mode='popLayout' >
          {items.map((id) => (
            <ChartWrapper ref={ref} key={id} id={id} count={count} items={items} setItems={setItems} />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </>
  );
}

export default App;
