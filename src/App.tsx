import './App.css';
import { useState, useRef } from "react";
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import ChartWrapper from './ChartWrapper';

function App() {
  const count = useRef(0);
  const [items, setItems] = useState([0]);

  const ref = useRef({ value: null });

  return (
    <>
      <div className='justify-center flex'>
        <motion.button className='rounded-md bg-rose-500 text-white p-3 self-center'
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
