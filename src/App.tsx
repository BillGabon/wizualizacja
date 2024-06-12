import './App.css';
import { useState, useRef, useEffect } from "react";
import { AnimatePresence, Reorder, motion } from 'framer-motion';
import ChartWrapper from './components/ChartWrapper';
import { Button, Card, TextInput, Icon, Dialog, DialogPanel, List, ListItem } from '@tremor/react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import axios from 'axios';
import { RiFolder2Fill, RiDeleteBin6Line, RiDownload2Fill, RiQuestionFill, RiInformation2Fill, RiHammerFill } from '@remixicon/react';

const serverAddress: string = 'http://localhost:5000';

type User = {
  email: string;
};

type Chart = {
  id: number;
  name: string;
};

export type PassedData = {
  id: number
  chart: string
}

function App() {
  const count = useRef(0);
  const [items, setItems] = useState<number[]>([]);
  const [loggedUser, setLoggedUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [downloadedCharts, setDownloadedCharts] = useState<PassedData[]>([])

  const [isHelpOpen, setHelpOpen] = useState<boolean>(false)
  const [isInfoOpen, setInfoOpen] = useState<boolean>(false)

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const loginEmailRef = useRef<HTMLInputElement>(null);
  const loginPasswordRef = useRef<HTMLInputElement>(null);
  const oldPasswordRef = useRef<HTMLInputElement>(null);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (error) {
      alert(error);
    }
    setError(null);
  }, [error]);

  useEffect(() => {
    if (token) {
      fetchCharts();
    }
  }, [token]);

  // Server Request Functions
  const fetchCharts = async () => {
    try {
      if (!token) throw new Error("No token found");
      const response = await axios.get(`${serverAddress}/api/charts`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCharts(response.data);
    } catch (error) {
      setError("Failed to fetch charts");
    }
  };

  const deleteChart = async (id: number) => {
    try {
      if (!token) throw new Error("No token found");
      await axios.delete(`${serverAddress}/api/charts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCharts(charts.filter(chart => chart.id !== id));
    } catch (error) {
      setError("Failed to delete chart");
    }
  };

  const uploadChart = async (name: string, data: string) => {
    try {
      if (!token) throw new Error("No token found");
      await axios.post(`${serverAddress}/api/upload-chart`, { name, data }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      fetchCharts();
    } catch (error) {
      setError("Upload failed");
    }
  };

  const handleDownloadChart = async (id: number) => {
    try {
      const response = await axios.get(`${serverAddress}/api/charts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const downloadedChartData = response.data.data as string;

      if (downloadedChartData) {
        count.current++;
        setItems((prevItems) => [...prevItems, count.current]);
        setDownloadedCharts((prevCharts) => [
          ...prevCharts,
          { id: count.current, chart: downloadedChartData }
        ]);
      }
    } catch (error) {
      setError("Failed to download chart");
    }
  };

  const handleSignup = async () => {
    if (emailRef.current && passwordRef.current) {
      const email = emailRef.current.value;
      const password = passwordRef.current.value;
      try {
        const response = await axios.post(`${serverAddress}/api/signup`, { email, password });
        setLoggedUser(response.data.user);
        setToken(response.data.token);
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
        const response = await axios.post(`${serverAddress}/api/login`, { email, password });
        setLoggedUser(response.data.user);
        setToken(response.data.token);
      } catch (error) {
        setError('Login failed');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${serverAddress}/api/logout`);
      setLoggedUser(null);
      setToken(null);
      setCharts([]);
    } catch (error) {
      setError('Logout failed');
    }
  };

  const handlePasswordChange = async () => {
    if (oldPasswordRef.current && newPasswordRef.current && confirmPasswordRef.current) {
      const oldPassword = oldPasswordRef.current.value;
      const newPassword = newPasswordRef.current.value;
      const confirmPassword = confirmPasswordRef.current.value;

      if (newPassword !== confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      try {
        await axios.post(`${serverAddress}/api/change-password`, { oldPassword, newPassword }, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        alert('Password changed successfully');
      } catch (error) {
        setError('Failed to change password');
      }
    }
  };

  return (
    <>
      <Dialog open={isHelpOpen} onClose={(val) => setHelpOpen(val)} static={true}>
        <DialogPanel className='text-black'>
          <h3 className="text-lg font-semibold text-black">Usage Guide</h3>
          <p className='mt-6 leading-6'>
            Data you provide needs to be organized in columns, with the first value being name of the category.
          </p>
          <p className='mt-10 leading-6'>
            To add a new chart panel, click
            <motion.button className='rounded-md bg-rose-500 text-white p-3 self-center mb-3 ml-2'>
              Add item
            </motion.button>
          </p>
          <p className='mt-10 leading-6'>
            You can choose the chart type from the menu. All of the menus are visible when hovering over a chart panel.
          </p>
          <p className='mt-10 leading-6'>
            Charts may not display correctly until you choose which columns should be interpreted. To choose correct columns, use  <Icon size='sm' icon={RiHammerFill} variant='outlined' className='ml-2' />.
          </p>
          <p className='mt-10 leading-6'>
            To close a chart, click at the red area.
          </p>
          <p className='mt-10 leading-6'>
            You can save and retrieve charts as a logged user. You can save chart image onto your device as a non-logged user.
          </p>
          <p className='mt-3'>Data source Example:</p>
          <table className='text-black mt-2'>
            <tbody>
              <tr>
                <th>First Name</th>
                <th>Favorite Number</th>
                <th>Age</th>
              </tr>
              <tr>
                <td>John</td>
                <td>27</td>
                <td>30</td>
              </tr>
              <tr>
                <td>Jane</td>
                <td>93</td>
                <td>25</td>
              </tr>
              <tr>
                <td>Mike</td>
                <td>777</td>
                <td>35</td>
              </tr>
            </tbody>
          </table>
          <Button className="mt-8 w-full" onClick={() => setHelpOpen(false)}>
            Understood
          </Button>
        </DialogPanel>
      </Dialog>

      <Dialog open={isInfoOpen} onClose={(val) => setInfoOpen(val)} static={true}>
        <DialogPanel className='m-10'>
          <p className="mt-2 leading-6 text-black">
            Autorem niniejszego serwisu jest Jakub Kwiatek.</p>
          <p className="mt-2 leading-6 text-black">
            Serwis ten stanowi integralną część pracy licencjackiej (kierunek: elektroniczne
            przetwarzanie informacji), przygotowanej pod kierunkiem dr. hab. Janusza Jurka, prof. UJ na Wydziale Zarządzania i Komunikacji Społecznej
            Uniwersytetu Jagiellońskiego.
          </p>
          <Button className="mt-8 w-full" onClick={() => setInfoOpen(false)}>
            OK
          </Button>
        </DialogPanel>
      </Dialog>

      <nav className="w-full p-4 mb-1 flex flex-row-reverse z-100">
        {!loggedUser &&
          <Popover>
            <PopoverTrigger asChild>
              <Button size='xs' variant='primary' className='px-4 py-2 mx-1'>Sign Up</Button>
            </PopoverTrigger>
            <PopoverContent className='z-50'>
              <Card className='mt-2'>
                <TextInput type='email' placeholder="email" className='my-2' ref={emailRef} />
                <TextInput type='password' className='my-2' placeholder='password' ref={passwordRef} />
                <div className='mb-1 flex flex-row-reverse'>
                  <Button size='xs' variant='primary' className='px-4 py-1' onClick={handleSignup}>Sign Up</Button>
                </div>
              </Card>
            </PopoverContent>
          </Popover>}
        {loggedUser &&
          <Popover>
            <PopoverTrigger asChild>
              <Button size='xs' variant='primary' className='px-4 py-2 mx-1'>Change Password</Button>
            </PopoverTrigger>
            <PopoverContent className='z-50'>
              <Card className='mt-2'>
                <TextInput type='password' placeholder="old password" className='my-2' ref={oldPasswordRef} />
                <TextInput type='password' className='my-2' placeholder='new password' ref={newPasswordRef} />
                <TextInput type='password' className='my-2' placeholder='confirm new password' ref={confirmPasswordRef} />
                <div className='mb-1 flex flex-row-reverse'>
                  <Button size='xs' variant='primary' className='px-4 py-1' onClick={handlePasswordChange}>Change</Button>
                </div>
              </Card>
            </PopoverContent>
          </Popover>}
        {!loggedUser &&
          <Popover>
            <PopoverTrigger asChild>
              <Button size='xs' variant='primary' className='px-4 py-2 mx-2'>Login</Button>
            </PopoverTrigger>
            <PopoverContent className='z-50'>
              <Card className='mt-2'>
                <TextInput type='email' placeholder="email" className='my-2' ref={loginEmailRef} />
                <TextInput type='password' className='my-2' placeholder='password' ref={loginPasswordRef} />
                <div className='mb-1 flex flex-row-reverse'>
                  <Button size='xs' variant='primary' className='px-4 py-2' onClick={handleLogin}>Login</Button>
                </div>
              </Card>
            </PopoverContent>
          </Popover>}
        {loggedUser
          && <Button onClick={handleLogout} size='xs' variant='primary' className='px-4 py-2' color='red'>
            Logout
          </Button>}
        {loggedUser &&
          <Popover>
            <PopoverTrigger asChild><Button size='xs' variant='primary' className='px-4 py-2 mx-2'><Icon size="sm" icon={RiFolder2Fill} className='text-white' /></Button></PopoverTrigger>
            <PopoverContent className='z-50'>
              <Card>
                <h3 className="mb-2 mt-2 text-center font-mono text-sm text-black"> Saved charts </h3>
                <div className="chart-list">
                  <List>
                    {charts.map((chart) => (
                      <ListItem key={chart.id} className="flex justify-between items-center mb-1">
                        <span className='m mr-10 text-black'>{chart.name}</span>
                        <span>
                          <Button size='xs' variant='secondary' color='blue' onClick={() => {
                            handleDownloadChart(chart.id)
                          }} icon={RiDownload2Fill} className='mr-2' />
                          <Button size='xs' variant='secondary' color='red' onClick={() => deleteChart(chart.id)} icon={RiDeleteBin6Line} />
                        </span>
                      </ListItem>
                    ))}
                  </List>
                </div>
              </Card>
            </PopoverContent>
          </Popover>}
        <Button size='xs' variant='primary' className='px-4 py-2' onClick={() => setInfoOpen(true)} ><Icon size="sm" icon={RiInformation2Fill} className='text-white' /></Button>
        <Button size='md' variant='primary' className='px-4 py-2 mx-2' onClick={() => setHelpOpen(true)} ><Icon size="sm" icon={RiQuestionFill} className='text-white' /></Button>
      </nav>

      {/* Add item button */}
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

      {/* Items */}
      <Reorder.Group axis="y" values={items} onReorder={setItems}>
        <AnimatePresence mode='popLayout'>
          {items.map((id) => (
            <ChartWrapper key={id} id={id} count={count} items={items} setItems={setItems} uploadChart={uploadChart} chartList={downloadedCharts} />
          ))}
        </AnimatePresence>
      </Reorder.Group>
    </>
  );
}

export default App;
