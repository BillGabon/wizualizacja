
import { forwardRef, useEffect, useState } from 'react';
import { DonutChart, Icon, EventProps, Button, Card, TextInput, BarChart, BarList, MultiSelect, MultiSelectItem, Select, SelectItem, ScatterChart, Dialog, DialogPanel } from '@tremor/react';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';
import { RiBarChart2Fill, RiBarChartHorizontalFill, RiBubbleChartFill, RiCollapseDiagonal2Fill, RiDonutChartFill, RiDownload2Line, RiDraggable, RiExpandDiagonal2Fill, RiFileWarningFill, RiFolderUploadFill, RiHammerFill, RiPaletteFill, RiPieChartBoxFill, RiPieChartFill } from '@remixicon/react';
import { Reorder, motion, useDragControls } from 'framer-motion';
import html2canvas from 'html2canvas';
import '../App.css';
import concatenateArray from '../functions/conatenateArray';
import conformToBarList from '../functions/conformToBarList';
import handleExcel from '../functions/handleExcel';
import { PassedData } from '../App';

interface storedChart {
    data: JSON;
    isBig: boolean;
    currentIcon: any;
    keys: any;
    firstKey: any;
    secondKey: any;
    thirdKey: any;
    fourthKey: any;
    palette: string[];
    chartType: 'circle' | 'bar' | 'barlist' | 'scatterchart';
    keyList: Array<any>

}

// props for this component
export interface WrapperProps {
    id: number;
    count: React.MutableRefObject<number>;
    items: number[];
    setItems: React.Dispatch<React.SetStateAction<number[]>>
    chartList: PassedData[],
    uploadChart(name: string, data: string): Promise<void>;
    loggedUser: any;
}

// ready color schemes
const palettes = [
    [
        'green-900',
        'green-800',
        'green-700',
        'green-600',
        'green-500',
    ],
    [
        'blue-900',
        'blue-800',
        'blue-700',
        'blue-600',
        'blue-500',
    ],
    [
        'red-900',
        'red-800',
        'red-700',
        'red-600',
        'red-500',
    ]

]

// remove item from array - from Framer Motion
function removeItem<T>(arr: T[], item: T) {
    const index = arr.indexOf(item);
    if (index > -1) arr.splice(index, 1);
}

const ChartWrapper = forwardRef(function ChartWrapper(props: WrapperProps, ref: any) {
    const [data, setData] = useState<any>() // JSON data for charts
    const [mode, setMode] = useState<'pie' | 'donut'>('pie'); // type of circle chart
    const [chartType, setChartType] = useState<'circle' | 'bar' | 'barlist' | 'scatterchart'>('circle'); // type of chart
    const [isBig, setBig] = useState<boolean>(false); // whether this item should be big or not
    const [title, setTitle] = useState<string>(''); // title for the chart 
    const [currentIcon, setCurrentIcon] = useState<string>() // highlited icon in the charts menu
    const [barListData, setBarListData] = useState<any[]>() // data formatted for bar list chart
    const [storedName, setStoredName] = useState<string>('')

    const [isWarningOpen, setIsWarningOpen] = useState<boolean>(false) // whether warning about wrong data is open
    const [isSaveOpen, setIsSaveOpen] = useState<boolean>(false)

    const [keys, setKeys] = useState<any[]>() // keys extracted from Excel
    const [firstKey, setFirstKey] = useState<any>()
    const [secondKey, setSecondKey] = useState<any>()
    const [thirdKey, setThirdKey] = useState<any>()
    const [fourthKey, setFourthKey] = useState<any>()
    const [keyList, setKeyList] = useState<Array<any>>([]) //list of keys for bar chart to show


    const dragControls = useDragControls()

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value)
    }

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setStoredName(event.target.value)
        console.log(ref)
    }

    // gather data for chart storage
    const storeChart = () => {
        const chart: storedChart = {
            data: data,
            isBig: isBig,
            currentIcon: currentIcon,
            keys: keys,
            firstKey: firstKey,
            secondKey: secondKey,
            thirdKey: thirdKey,
            fourthKey: fourthKey,
            palette: palette.slice(0, 5),
            chartType: chartType,
            keyList: keyList
        }

        return JSON.stringify(chart);
    }

    /* create an array of colors */
    const colors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
    const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];
    const readyColors: string[] = [];
    colors.forEach(color => {
        shades.forEach(shade => {
            const string = `${color}-${shade}`;
            readyColors.push(string);
        });
    });

    /* handle image downloading */
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

    const [palette, setPalette] = useState<string[]>(concatenateArray(palettes[0])) //current color scheme


    // unpack passed chart 
    const unpackChart = (chartData: string): void => {
        const chart = JSON.parse(chartData) as storedChart
        setData(chart.data)
        setBig(chart.isBig)
        setCurrentIcon(chart.currentIcon)
        setKeys(chart.keys)
        setFirstKey(chart.firstKey)
        setSecondKey(chart.secondKey)
        setThirdKey(chart.thirdKey)
        setPalette(concatenateArray(chart.palette))
        setChartType(chart.chartType)
        setKeyList(chart.keyList)
    }

    // function to handle file upload
    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                const [gotData, gotKeys] = await handleExcel(file)
                setData(gotData)
                setKeys(gotKeys)

            }
            catch (error) {
                console.log(error)
                setData(undefined)
                setIsWarningOpen(true);
            }
        }
    }

    useEffect(() => {
        const result = props.chartList.find((element) => element.id === props.id);
        if (result) {
            unpackChart(result.chart);
        }
    }, [props.chartList, props.id]);

    //set keys whenever they are accessible
    useEffect(() => {
        if (keys && keys.length > 1) {
            keys[0] && setFirstKey(keys[0]);
            keys[1] && setSecondKey(keys[1]);
            keys[2] && setThirdKey(keys[2])
            keys[3] && setFourthKey(keys[3])

        }
    }, [keys]);

    // format data for bar list chart whenever applicable keys change
    useEffect(() => {
        if (data && firstKey && secondKey) {
            setBarListData(conformToBarList(data, firstKey, secondKey))
        }
    }), [firstKey, secondKey]
    return (
        <>
            {/* dialog for data is not interpretable warning */}
            <Dialog open={isWarningOpen} onClose={(val) => setIsWarningOpen(val)} static={true}>
                <DialogPanel>
                    <h3 className='text-lg font-semibold text-black'><Icon icon={RiFileWarningFill} color='yellow' size='md' variant='light' className='mr-3' />Data is not interpretable</h3>
                    <p className='mt-2 leading-6'>
                        Please make sure that data you provide is organized in columns with the first value being name of the category.
                    </p>
                    <p className='mt-3'>Example:</p>
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
                    <Button className='mt-8 w-full' onClick={() => setIsWarningOpen(false)}>
                        Understood
                    </Button>
                </DialogPanel>
            </Dialog >


            <Dialog open={isSaveOpen} onClose={(val) => setIsSaveOpen(val)} static={true}>
                <DialogPanel className='flex align-middle'>
                    <TextInput className='mx-auto max-w-xs' placeholder='new chart' onChange={handleNameChange} />
                    <Button onClick={() => {
                        setIsSaveOpen(false)
                        props.uploadChart(storedName || "new chart", storeChart())
                    }} className=' mt-3'>Save</Button>
                </DialogPanel>
            </Dialog>
            < Reorder.Item dragControls={dragControls} value={props.id} dragListener={false} layout='position' style={{}} className={`rounded-md p-3 mb-2 group relative bg-white ${isBig ? 'bigTile' : 'tile'}`} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.1, opacity: 0 }} >

                {/* close item red rectangle */}

                <motion.div className='absolute left-0 top-0 bottom-0 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity w-1/12 max-w-10 overflow-hidden rounded-l z-20'
                    onClick={() => {
                        const newItems = [...props.items];
                        removeItem(newItems, props.id);
                        props.setItems(newItems);
                    }}>
                </motion.div>
                <motion.div
                    className='absolute right-0 top-0 bottom-0 float-right opacity-0 group-hover:opacity-100 transition-opacity w-1/12 max-w-10 rounded-r flex content-center mr-5'
                    onClick={() => {
                    }}>

                    <Icon icon={RiDraggable} size='xl' color='zinc' variant='light' className='flex cursor-grabbing self-center px-1 py-7 z-20 select-none' onPointerDown={(e) => dragControls.start(e)}></Icon>
                </motion.div>
                {!data &&
                    <input type='file' accept='.xls, .xlsx' onChange={handleFileChange} />
                }

                {/* charts */}

                {data && <>
                    <motion.div className='space-y-12 m-0 min-w-full min-h-full' id='downloadable'>
                        <motion.div className='space-y-3 w-full'>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <span className='text-center block font-sans'>
                                        {title || 'click to change title'}
                                    </span>
                                </PopoverTrigger>
                                <PopoverContent className='z-50'>
                                    <Card className=''>
                                        <TextInput className='mx-auto max-w-xs' placeholder='change title' onChange={handleTitleChange} />
                                    </Card>
                                </PopoverContent>
                            </Popover>

                            {chartType == 'circle' &&
                                <>
                                    <motion.div className='flex justify-center h-full p-0 z-50'>
                                        {<DonutChart className={isBig ? 'bigChart' : 'chart'}
                                            data={data}
                                            index={firstKey}
                                            label={secondKey}
                                            category={secondKey}
                                            variant={mode}
                                            onValueChange={(v: EventProps) => {
                                                if (!v) return;
                                                console.log(v.name)
                                            }}
                                            colors={palette}
                                            showTooltip={true}
                                        />}
                                    </motion.div>
                                </>}
                            {chartType == 'bar' &&
                                <motion.div className='ml-5 flex justify-center overflow-visible'>
                                    {<BarChart className={isBig ? 'bigChart' : 'chart'}
                                        data={data}
                                        categories={keyList}
                                        index={firstKey}
                                        showLegend={false}
                                        onValueChange={(v: EventProps) => {
                                            if (!v) return;
                                            console.log(v.name)


                                        }}
                                        colors={palette}
                                        showTooltip={true}
                                    />}
                                </motion.div>}
                            {chartType == 'barlist' &&
                                <motion.div className='w-full flex justify-start'>
                                    {<BarList className='ml-9 w-4/5'
                                        data={barListData!}
                                        color={palette[0]}
                                        onValueChange={(v: EventProps) => {
                                            if (!v) return;
                                            console.log(v.name)
                                        }}
                                    />}
                                </motion.div>}

                            {chartType == 'scatterchart' &&
                                <motion.div className='flex justify-center min-w-full'>
                                    <ScatterChart className={isBig ? 'bigChart mt-3' : 'chart mt-3'}
                                        data={data}
                                        category={firstKey}
                                        x={secondKey}
                                        y={thirdKey}
                                        size={fourthKey}
                                        showOpacity
                                        autoMinXValue
                                        autoMinYValue
                                        showLegend={false}
                                        onValueChange={(v: EventProps) => {
                                            if (!v) return;
                                            console.log(v.name)


                                        }}
                                        colors={palette}

                                    />
                                </motion.div>}
                        </motion.div>
                    </motion.div>
                    <motion.div className='menu mt-2 right-5 top-0 bottom-0 absolute flex h-auto max-h-2 z-30'>
                        <motion.nav className='overflow-visible'>
                            {/* color selection */}
                            <Popover>
                                <PopoverTrigger asChild className='p-0'>
                                    <Button variant='secondary' className='mr-1 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity'><Icon size='sm' icon={RiPaletteFill} /></Button>
                                </PopoverTrigger>
                                <PopoverContent className='z-50'>
                                    <Card className='mx-auto max-w-md'>
                                        <motion.div className='mb-2 text-center font-mono text-sm text-slate-500'> Palette </motion.div>
                                        <motion.div className='flex flex-row'>
                                            {palette.slice(0, 5).map((element, id) => (
                                                <Popover key={id}>
                                                    <PopoverTrigger asChild>
                                                        <motion.div className={`bg-${element} w-5 h-5`}></motion.div>
                                                    </PopoverTrigger>
                                                    <PopoverContent updatePositionStrategy='always' className='z-50'>
                                                        <Card className='flex flex-col border-t-8' decoration='top' decorationColor={palette[id]}>
                                                            {colors.map(color => (
                                                                <motion.div key={color} className='flex flex-row'>
                                                                    {shades.map(shade => (
                                                                        <motion.div
                                                                            key={`${color}-${shade}`}
                                                                            className={`bg-${color}-${shade} w-5 h-5`}
                                                                            onClick={() => {
                                                                                const newPalette = [...palette];
                                                                                newPalette[id] = `${color}-${shade}`;
                                                                                setPalette(concatenateArray(newPalette.slice(0, 5)));
                                                                            }}
                                                                        ></motion.div>
                                                                    ))}
                                                                </motion.div>
                                                            ))}
                                                        </Card>
                                                    </PopoverContent>
                                                </Popover>
                                            ))}
                                        </motion.div>
                                        <motion.div className='mb-2 mt-2 text-center font-mono text-sm text-slate-500'> Presets </motion.div>
                                        {palettes.map((element, id) => (
                                            <Button key={id} className={`bg-${element[0]} max-w-3.5`} onClick={() => setPalette(concatenateArray(element))}></Button>

                                        ))}
                                    </Card>

                                </PopoverContent >
                            </Popover>
                            {/* select data to be shown */}
                            <Popover>
                                <PopoverTrigger asChild className='p-0'>
                                    <Button variant='secondary' className='mr-1 p-0.5 opacity-0 group-hover:opacity-100 transition-opacity'><Icon size='sm' icon={RiHammerFill} /></Button>
                                </PopoverTrigger>
                                <PopoverContent className='z-30'>
                                    <Card>
                                        <motion.div className='mb-2 mt-2 text-center font-mono text-sm text-slate-500'> Label </motion.div>
                                        <Select className='z-50' value={firstKey} onValueChange={(value) => setFirstKey(value)}>
                                            {keys && keys.map((item: string) => (
                                                <SelectItem className='z-50' key={item} value={item}>
                                                    {item}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        {chartType != 'bar' && <>
                                            <motion.div className='mb-2 mt-2 text-center font-mono text-sm text-slate-500'> Data </motion.div>
                                            <Select value={secondKey} onValueChange={(value) => setSecondKey(value)} className='z-40'>
                                                {keys && keys.map((item: string) => (
                                                    <SelectItem className='z-40' key={item} value={item}>
                                                        {item}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </>}
                                        {chartType == 'scatterchart' && <>
                                            <Select value={thirdKey} onValueChange={(value) => setThirdKey(value)} className='mt-3 z-30'>
                                                {keys && keys.map((item: string) => (
                                                    <SelectItem className='z-30' key={item} value={item}>
                                                        {item}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </>}
                                        {chartType == 'scatterchart' && <>
                                            <motion.div className='mb-2 mt-2 text-center font-mono text-sm text-slate-500'> Size </motion.div>
                                            <Select className='z-20' value={fourthKey} onValueChange={(value) => setFourthKey(value)}>
                                                {keys && keys.map((item: string) => (
                                                    <SelectItem className='z-20' key={item} value={item}>
                                                        {item}
                                                    </SelectItem>
                                                ))}
                                            </Select>
                                        </>}
                                        {chartType == 'bar' && <>
                                            <motion.div className='mb-2 mt-2 text-center font-mono text-sm text-slate-500'> Values </motion.div>
                                            <MultiSelect
                                                value={keyList}
                                                onValueChange={(items) => {
                                                    setKeyList(items)
                                                }}>
                                                {keys?.map((key: string) => (
                                                    <MultiSelectItem key={key} value={key}>
                                                        {key}
                                                    </MultiSelectItem>
                                                ))}
                                            </MultiSelect>
                                        </>}
                                    </Card>
                                </PopoverContent>
                            </Popover>

                            {/* menu */}
                        </motion.nav>
                        <motion.nav className='overflow-visible'>

                            <Popover>
                                <PopoverTrigger asChild><Button className='mt-0 opacity-0 group-hover:opacity-100 transition-opacity'>
                                    <a>Menu</a>
                                </Button>
                                </PopoverTrigger>
                                <PopoverContent updatePositionStrategy='always'>
                                    <Card>

                                        {/* chart type submenu */}
                                        <Popover>
                                            <PopoverTrigger asChild className='overflow-visible'>
                                                <li><Icon size='sm' icon={RiPieChartBoxFill} /></li>
                                            </PopoverTrigger>

                                            <PopoverContent updatePositionStrategy='always' className='absolute overflow-visible block z-50'>
                                                <Card>
                                                    <li onClick={() => {
                                                        setMode('pie')
                                                        setChartType('circle');
                                                        setCurrentIcon('pie')
                                                    }}><Icon size='sm' variant={currentIcon == 'pie' ? 'solid' : 'simple'} icon={RiPieChartFill} /></li>
                                                    <li onClick={() => {
                                                        setMode('donut')
                                                        setChartType('circle')
                                                        setCurrentIcon('donut')
                                                    }}  ><Icon size='sm' variant={currentIcon == 'donut' ? 'solid' : 'simple'} icon={RiDonutChartFill} /></li>
                                                    <li onClick={() => {
                                                        setChartType('bar')
                                                        setCurrentIcon('bar')
                                                    }}><Icon size='sm' variant={currentIcon == 'bar' ? 'solid' : 'simple'} icon={RiBarChart2Fill} /></li>
                                                    <li className='z-50' onClick={() => {
                                                        setChartType('barlist')
                                                        setCurrentIcon('barlist')
                                                    }}><Icon size='sm' variant={currentIcon == 'barlist' ? 'solid' : 'simple'} icon={RiBarChartHorizontalFill} /></li>
                                                    <li className='z-50' onClick={() => {
                                                        setChartType('scatterchart')
                                                        setCurrentIcon('scatterchart')
                                                    }}><Icon className='z-50' size='sm' variant={currentIcon == 'scatterchart' ? 'solid' : 'simple'} icon={RiBubbleChartFill} /></li>
                                                </Card>
                                            </PopoverContent>
                                        </Popover>

                                        {/* rest of the menu */}

                                        <li onClick={() => setBig(!isBig)}><Icon size='sm' icon={isBig ? RiCollapseDiagonal2Fill : RiExpandDiagonal2Fill} /></li>
                                        <li onClick={() => captureElementAndDownload()}><Icon size='sm' icon={RiDownload2Line} /></li>
                                        {props.loggedUser &&
                                            <li><Icon size='sm' variant='simple' icon={RiFolderUploadFill} onClick={() => setIsSaveOpen(true)} /></li>}
                                    </Card>
                                </PopoverContent>
                            </Popover>
                        </motion.nav>
                    </motion.div>


                </>
                }
            </Reorder.Item >
        </>
    );
})

export default ChartWrapper;
