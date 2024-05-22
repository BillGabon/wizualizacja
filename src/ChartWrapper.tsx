import { RiBarChart2Fill, RiCircleFill, RiCircleLine, RiCollapseDiagonal2Fill, RiDownload2Line, RiExpandDiagonal2Fill, RiLayoutHorizontalLine, RiPaletteFill } from '@remixicon/react';
import './App.css';
import { DonutChart, Icon, EventProps, Button, TabGroup, TabList, Tab, TabPanels, TabPanel, Card, TextInput, BarChart, BarList } from '@tremor/react';
import { Reorder, motion } from 'framer-motion';
import { forwardRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import handleData from './handleData';

export interface WrapperProps {
    id: number;
    count: React.MutableRefObject<number>;
    items: number[];
    setItems: React.Dispatch<React.SetStateAction<number[]>>
}

function concatenateArray(arr: any[]): any[] {
    const concatenatedArray: any[] = arr;
    for (let i = 0; i < 5; i++) {
        concatenatedArray.push(...arr.slice(0, 5));
    }
    return concatenatedArray;
}

const palettes = [
    [
        "green-900",
        'green-800',
        'green-700',
        'green-600',
        'green-500',
        'green-400',
    ],
    [
        'blue-900',
        'blue-800',
        'blue-700',
        'blue-600',
        'blue-500',
        'blue-400',
    ],
    [
        'red-900',
        'red-800',
        'red-700',
        'red-600',
        'red-500',
        'red-400',
    ]

]

const dataFormatter = (number: number) =>
    `${Intl.NumberFormat('us').format(number).toString()}`;

function removeItem<T>(arr: T[], item: T) {
    const index = arr.indexOf(item);
    if (index > -1) arr.splice(index, 1);
}

const ChartWrapper = forwardRef(function ChartWrapper(props: WrapperProps, ref: any) {
    const [fileContent, setFileContent] = useState<File>();
    const [data, setdata] = useState<any>()
    const [isOpen, setIsOpen] = useState(() => false);
    const [mode, setMode] = useState<"pie" | "donut">("pie");
    const [chartType, setChartType] = useState<"circle" | "bar" | "barlist">("circle");
    const [isBig, setBig] = useState<boolean>(false);
    const [title, setTitle] = useState<string>("");
    const [currentIcon, setCurrentIcon] = useState<string>()


    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value)
    }

    const colors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
    const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

    const strings: string[] = [];
    colors.forEach(color => {
        shades.forEach(shade => {
            const string = `${color}-${shade}`;
            strings.push(string);
        });
    });

    const captureElementAndDownload = () => {
        var elementId = 'downloadable';
        const captureElement = document.getElementById(elementId);
        if (!captureElement) {
            console.error(`Element with ID ${elementId} not found.`);
            return;
        }

        html2canvas(captureElement).then(canvas => {
            const link = document.createElement('a');
            link.href = canvas.toDataURL();
            link.download = 'chart.png';
            document.body.appendChild(link);
            link.click();
        });
    };

    const [palette, setPalette] = useState<string[]>(concatenateArray(palettes[0]))

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {

                setFileContent(file);
                try {
                const gotData = await handleData(file)
                setdata(gotData);
                }
                catch(error) {
                    setFileContent(undefined)
                    console.log(error)
                }
        }
    }

    const itemVariants = {
        open: {
            opacity: 1,
            y: 0,
            transition: { stiffness: 300, damping: 24 }
        },
        closed: { opacity: 0, y: 20, transition: { duration: 0.2 } }
    };


    return (

        <>
            < Reorder.Item value={props.id} layout style={{}} className={`rounded-md p-3 mb-2 group relative bg-white ${isBig ? 'bigTitle' : 'tile'}`} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.1, opacity: 0 }} >
                <motion.div className="absolute left-0 top-0 bottom-0 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity transition-width w-1/12 overflow-hidden rounded-l origin-left"
                    whileHover={{
                        scaleX: 1.5,
                        type: 'easeOut',
                        transition: { duration: 0.1 },
                        overflowY: 'hidden'
                    }}

                    onClick={() => {
                        const newItems = [...props.items];
                        removeItem(newItems, props.id);
                        props.setItems(newItems);
                    }}>
                </motion.div>
                {!fileContent &&
                    <input type="file" accept=".xls, .xlsx" onChange={handleFileChange} />
                }
                {fileContent && <>
                    {
                        chartType == "circle" &&
                        <div className="space-y-12 m-0 min-w-full min-h-full" id='downloadable'>
                            <div className="space-y-3 w-full">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <span className="text-center block font-mono text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                                            {title || "click to change title"}
                                        </span>
                                    </PopoverTrigger>
                                    <PopoverContent className='z-10'>
                                        <Card className=''>
                                            <TextInput className="mx-auto max-w-xs" placeholder="change title" onChange={handleChange} />
                                        </Card>
                                    </PopoverContent>
                                </Popover>
                                <div className="flex justify-center h-full p-0 z-50">
                                    {<DonutChart className={isBig ? 'bigChart' : 'chart'}
                                        data={data}
                                        variant={mode}
                                        valueFormatter={dataFormatter}
                                        onValueChange={(v: EventProps) => {
                                            if (!v) return;
                                            console.log(v.name)


                                        }}
                                        colors={palette}
                                        showTooltip={true}
                                    />}
                                </div>
                            </div>
                        </div>
                    }

                    {chartType == "bar" &&
                        <div className="space-y-12 m-0 min-w-full min-h-full" id='downloadable'>
                            <div className="space-y-3 w-full">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <span className="text-center block font-mono text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                                            {title || "click to change title"}
                                        </span>
                                    </PopoverTrigger>
                                    <PopoverContent className='z-10'>
                                        <Card className=''>
                                            <TextInput className="mx-auto max-w-xs" placeholder="change title" onChange={handleChange} />
                                        </Card>
                                    </PopoverContent>
                                </Popover>
                                <div className="flex justify-center">
                                    {<BarChart className={isBig ? 'bigChart' : 'chart'}
                                        data={data}
                                        categories={['value']}
                                        index='name'
                                        valueFormatter={dataFormatter}
                                        onValueChange={(v: EventProps) => {
                                            if (!v) return;
                                            console.log(v.name)


                                        }}
                                        colors={palette}
                                        showTooltip={true}
                                    />}
                                </div>
                            </div>
                        </div>}
                    {chartType == "barlist" &&
                        <div className="space-y-12 m-0 min-w-full min-h-full" id='downloadable'>
                            <div className="space-y-3 w-full">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <span className="text-center block font-mono text-tremor-default text-tremor-content dark:text-dark-tremor-content">
                                            {title || "click to change title"}
                                        </span>
                                    </PopoverTrigger>
                                    <PopoverContent className='z-10'>
                                        <Card className=''>
                                            <TextInput className="mx-auto max-w-xs" placeholder="change title" onChange={handleChange} />
                                        </Card>
                                    </PopoverContent>
                                </Popover>
                                <div className="flex justify-center min-w-max">
                                    {<BarList className={isBig ? 'bigChart' : 'chart'}
                                        data={data}
                                        categories={['value']}
                                        index='name'
                                        valueFormatter={dataFormatter}
                                        onValueChange={(v: EventProps) => {
                                            if (!v) return;
                                            console.log(v.name)


                                        }}
                                        colors={palette}
                                    />}
                                </div>
                            </div>
                        </div>}
                    <div className="menu mt-2 right-5 top-0 bottom-0 absolute flex">
                        <motion.nav className='min-h-full'>
                            <Popover>
                                <PopoverTrigger asChild className='p-0'>
                                    <Button variant='secondary' className='mr-1 p-0.5'><Icon size="sm" icon={RiPaletteFill} /></Button>
                                </PopoverTrigger>
                                <PopoverContent className="">
                                    <Card className="mx-auto max-w-md">
                                        <TabGroup>
                                            <TabList className="">
                                                <Tab>Preset</Tab>
                                                <Tab>Custom</Tab>
                                            </TabList>
                                            <TabPanels>
                                                <TabPanel>
                                                    {palettes.map(element => (
                                                        <Button className={`bg-${element[0]} max-w-3.5`} onClick={() => setPalette(concatenateArray(element))}></Button>

                                                    ))}
                                                </TabPanel>
                                                <TabPanel className='flex flex-row'>
                                                    {palette.slice(0, 5).map((element, id) => (
                                                        <Popover key={id}>
                                                            <PopoverTrigger asChild>
                                                                <div className={`bg-${element} w-5 h-5`}></div>
                                                            </PopoverTrigger>
                                                            <PopoverContent>
                                                                <Card className='flex flex-col border-t-8' decoration="top" decorationColor={palette[id]}>
                                                                    {colors.map(color => (
                                                                        <div key={color} className='flex flex-row'>
                                                                            {shades.map(shade => (
                                                                                <div
                                                                                    key={`${color}-${shade}`}
                                                                                    className={`bg-${color}-${shade} w-5 h-5`}
                                                                                    onClick={() => {
                                                                                        const newPalette = [...palette.slice(0, 5)];
                                                                                        newPalette[id] = `${color}-${shade}`;
                                                                                        setPalette(concatenateArray(newPalette));
                                                                                    }}
                                                                                ></div>
                                                                            ))}
                                                                        </div>
                                                                    ))}
                                                                </Card>
                                                            </PopoverContent>
                                                        </Popover>
                                                    ))}
                                                </TabPanel>
                                            </TabPanels>
                                        </TabGroup>
                                    </Card>


                                </PopoverContent>
                            </Popover>
                        </motion.nav>
                        <motion.nav className=''
                            initial={false}
                            animate={isOpen ? "open" : "closed"}
                        >

                            <Button className='mt-0'
                                onClick={() => setIsOpen(!isOpen)}
                            >
                                <a>Menu</a>
                            </Button>
                            <motion.ul
                                className='mt-1'
                                variants={{
                                    open: {
                                        clipPath: "inset(0% 0% 0% 0% round 10px)",
                                        transition: {
                                            type: "spring",
                                            bounce: 0,
                                            duration: 0.7,
                                            delayChildren: 0,
                                            staggerChildren: 0.05
                                        }
                                    },
                                    closed: {
                                        clipPath: "inset(10% 50% 90% 50% round 10px)",
                                        transition: {
                                            type: "spring",
                                            bounce: 0,
                                            duration: 0.3
                                        }
                                    }
                                }}
                                style={{ pointerEvents: isOpen ? "auto" : "none" }}
                            >
                                <motion.li variants={itemVariants} onClick={() => {
                                    setMode("pie")
                                    setChartType("circle");
                                    setCurrentIcon("pie")
                                }}><Icon size="sm" variant={currentIcon == "pie" ? 'solid' : 'simple'} icon={RiCircleFill} /></motion.li>
                                <motion.li variants={itemVariants} onClick={() => {
                                    setMode("donut")
                                    setChartType("circle")
                                    setCurrentIcon("donut")
                                }}  ><Icon size="sm" variant={currentIcon == "donut" ? 'solid' : 'simple'} icon={RiCircleLine} /></motion.li>
                                <motion.li variants={itemVariants} onClick={() => {
                                    setChartType("bar")
                                    setCurrentIcon("bar")
                                }}><Icon size="sm" variant={currentIcon == "bar" ? 'solid' : 'simple'} icon={RiBarChart2Fill} /></motion.li>
                                <motion.li variants={itemVariants} onClick={() => {
                                    setChartType("barlist")
                                    setCurrentIcon("barlist")
                                }}><Icon size="sm" variant={currentIcon == "barlist" ? 'solid' : 'simple'} icon={RiBarChart2Fill} /></motion.li>
                                <motion.li variants={itemVariants} onClick={() => setBig(!isBig)}><Icon size="sm" icon={isBig ? RiCollapseDiagonal2Fill : RiExpandDiagonal2Fill} /></motion.li>
                                <motion.li variants={itemVariants} onClick={() => captureElementAndDownload()}><Icon size="sm" icon={RiDownload2Line} /></motion.li>
                                <motion.li variants={itemVariants} ><Icon size="sm" icon={RiLayoutHorizontalLine} /></motion.li>
                            </motion.ul>
                        </motion.nav>
                    </div>


                </>
                }
            </Reorder.Item >
        </>
    );
})

export default ChartWrapper;