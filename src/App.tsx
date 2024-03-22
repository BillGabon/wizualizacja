import './App.css';
import { useState, useRef } from "react";
import { DonutChart } from '@tremor/react';
import { AnimatePresence, motion } from 'framer-motion';
//eer
const datahero = [
  {
    name: 'Noche Holding AG',
    value: 9800,
  },
  {
    name: 'Rain Drop AG',
    value: 4567,
  },
  {
    name: 'Push Rail AG',
    value: 3908,
  },
  {
    name: 'Flow Steal AG',
    value: 2400,
  },
  {
    name: 'Tiny Loop Inc.',
    value: 2174,
  },
  {
    name: 'Anton Resorts Holding',
    value: 1398,
  },
];

const dataFormatter = (number: number) =>
  `$ ${Intl.NumberFormat('us').format(number).toString()}`;

function removeItem<T>(arr: T[], item: T) {
  const index = arr.indexOf(item);
  if (index > -1) arr.splice(index, 1);
}

function App() {
  const count = useRef(0);
  const [items, setItems] = useState([0]);

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
      <AnimatePresence mode='sync'>
        <ul>
          {items.map((id) => (<motion.li layout className='rounded-md p-3 mb-2' animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring" }}
            key={id}
            onClick={() => {
              const newItems = [...items];
              removeItem(newItems, id);
              setItems(newItems);
            }}>
            <div className="mx-auto space-y-12">
              <div className="space-y-3">
                <span className="text-center block font-mono text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                  Lorem ipsum
                </span>
                <div className="flex justify-center">
                  <DonutChart className='chart'
                    data={datahero}
                    variant="donut"
                    valueFormatter={dataFormatter}
                    onValueChange={(v) => console.log(v)}
                  />
                </div>
              </div>
            </div>
          </motion.li>))}
        </ul>
      </AnimatePresence>
    </>
  );
}

export default App;
