import { RiBarChart2Fill, RiBarChartHorizontalFill, RiBubbleChartFill, RiCollapseDiagonal2Fill, RiDonutChartFill, RiDownload2Line, RiExpandDiagonal2Fill, RiFolderUploadFill, RiHammerFill, RiPaletteFill, RiPieChartBoxFill, RiPieChartFill } from '@remixicon/react';
import '../App.css';
import { DonutChart, Icon, EventProps, Button, Card, TextInput, BarChart, BarList, MultiSelect, MultiSelectItem, Select, SelectItem, ScatterChart } from '@tremor/react';
import { Reorder, motion } from 'framer-motion';
import { forwardRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';
import { Popover, PopoverContent, PopoverTrigger } from '@radix-ui/react-popover';

import handleExcel from '../functions/handleExcel';
import concatenateArray from '../functions/conatenateArray';
import conformToBarList from '../functions/conformToBarList';

interface storedChart {
    data: JSON;
    isBig: boolean;
    currentIcon: any;
    keys: any;
    firstKey: any;
    secondKey: any;
    thirdKey: any;
    palette: string[];
    chartType: "circle" | "bar" | "barlist" | "scatterchart";

}

export interface WrapperProps {
    id: number;
    count: React.MutableRefObject<number>;
    items: number[];
    setItems: React.Dispatch<React.SetStateAction<number[]>>
    chartToShow: string | null
    uploadChart(data: string): Promise<void>
}

        /* ready color schemes */

const palettes = [
    [
        "green-900",
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

function removeItem<T>(arr: T[], item: T) {
    const index = arr.indexOf(item);
    if (index > -1) arr.splice(index, 1);
}

const ChartWrapper = forwardRef(function ChartWrapper(props: WrapperProps, ref: any) {

    console.log(ref)

    const [data, setData] = useState<any>()
    const [mode, setMode] = useState<"pie" | "donut">("pie");
    const [chartType, setChartType] = useState<"circle" | "bar" | "barlist" | "scatterchart">("circle");
    const [isBig, setBig] = useState<boolean>(false);
    const [title, setTitle] = useState<string>("");
    const [currentIcon, setCurrentIcon] = useState<string>()
    const [barListData, setBarListData] = useState<any[]>()

    const [keys, setKeys] = useState<any>()
    const [firstKey, setFirstKey] = useState<any>()
    const [secondKey, setSecondKey] = useState<any>()
    const [thirdKey, setThirdKey] = useState<any>()

    const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTitle(event.target.value)
    }

    const storeChart = () => {
        const chart: storedChart = {
            data: data,
            isBig: isBig,
            currentIcon: currentIcon,
            keys: keys,
            firstKey: firstKey,
            secondKey: secondKey,
            thirdKey: thirdKey,
            palette: palette.slice(0, 5),
            chartType: chartType
        }
        return JSON.stringify(chart);
    }


    const unpackChart = (chartData: string): void => {
        const chart = JSON.parse(chartData) as storedChart
        setData(chart.data)
        setBig(chart.isBig)
        setCurrentIcon(chart.currentIcon)
        setKeys(chart.keys)
        setFirstKey(chart.firstKey)
        setSecondKey(chart.secondKey)
        setThirdKey(chart.thirdKey)
        setPalette(chart.palette)
        setChartType(chart.chartType)
    }

    if(props.chartToShow != null) {
        unpackChart(props.chartToShow)
    }

    /* create an array of colors */

    const colors = ['slate', 'gray', 'zinc', 'neutral', 'stone', 'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];
    const shades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'];

    const strings: string[] = [];
    colors.forEach(color => {
        shades.forEach(shade => {
            const string = `${color}-${shade}`;
            strings.push(string);
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

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
                try {
                const [gotData, gotKeys] = await handleExcel(file)
                setData(gotData)
                setKeys(gotKeys)

                }
                catch(error) {
                    console.log(error)
                    setData(undefined)
                }
        }
    }

    useEffect(() => {
        if (keys && keys.length > 1) {
            firstKey && setFirstKey(keys[0]);
            secondKey && setSecondKey(keys[1]);
            thirdKey && setThirdKey(keys[2])
        }
    }, [keys]);

    useEffect(() => {
        if(data && firstKey && secondKey) {
        setBarListData(conformToBarList(data, firstKey, secondKey))
        }
    }), [firstKey, secondKey]

    return (

        <>
            < Reorder.Item value={props.id} layout style={{}} className={`rounded-md p-3 mb-2 group relative bg-white ${isBig ? 'bigTile' : 'tile'}`} animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.1, opacity: 0 }} >

                    {/* close item red rectangle */}

                <motion.div className="absolute left-0 top-0 bottom-0 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity w-1/12 max-w-10 overflow-hidden rounded-l origin-left z-20"
                    onClick={() => {
                        const newItems = [...props.items];
                        removeItem(newItems, props.id);
                        props.setItems(newItems);
                    }}>

                </motion.div>
                {!data &&
                    <input type="file" accept=".xls, .xlsx" onChange={handleFileChange} />
                }

                            {/* charts */}

                {data && <>
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
                                            <TextInput className="mx-auto max-w-xs" placeholder="change title" onChange={handleTitleChange} />
                                        </Card>
                                    </PopoverContent>
                                </Popover>
                    {
                        chartType == "circle" &&
                        <>
                                <div className="flex justify-center h-full p-0 z-50">
                                    {<DonutChart className={isBig ? 'bigChart' : 'chart'}
                                        data={data}
                                        index={firstKey}
                                        label={firstKey}
                                        category={secondKey}
                                        variant={mode}
                                        onValueChange={(v: EventProps) => {
                                            if (!v) return;
                                            console.log(v.name)
                                        }}
                                        colors={palette}
                                        showTooltip={true}
                                    />}
                                </div>
                                </>
                    }
                    {chartType == "bar" &&
                                <div className="ml-5 flex justify-center">
                                    {<BarChart className={isBig ? 'bigChart' : 'chart'}
                                        data={data}
                                        categories={[secondKey, thirdKey]}
                                        index={firstKey}
                                        onValueChange={(v: EventProps) => {
                                            if (!v) return;
                                            console.log(v.name)


                                        }}
                                        colors={palette}
                                        showTooltip={true}
                                    />}
                                </div>}
                        {chartType == "barlist" &&
            <div className="w-full flex justify-start">
                {<BarList className="ml-9 w-4/5"
                    data={barListData!}
                    color={palette[0]}
                    onValueChange={(v: EventProps) => {
                        if (!v) return;
                        console.log(v.name)
                    }}
                />}
            </div>
    }

                        {chartType == "scatterchart" &&
                                <div className="flex justify-center min-w-max">
                                    {<ScatterChart className={isBig ? 'bigChart mt-3' : 'chart mt-3'}
                                        data={data}
                                        category={firstKey}
                                        x={secondKey}
                                        y={thirdKey}
                                        showOpacity
                                        autoMinXValue
                                        autoMinYValue
                                        showLegend={false}
                                        onValueChange={(v: EventProps) => {
                                            if (!v) return;
                                            console.log(v.name)


                                        }}
                                        colors={palette}
                                        
                                    />}
                                </div>}
                                </div>
                                </div>
                    <div className="menu mt-2 right-5 top-0 bottom-0 absolute flex h-auto max-h-2">
                        <motion.nav className='overflow-visible'>
                            {/* color selection */}
                            <Popover>
                                <PopoverTrigger asChild className='p-0'>
                                    <Button variant='secondary' className='mr-1 p-0.5'><Icon size="sm" icon={RiPaletteFill} /></Button>
                                </PopoverTrigger>
                                <PopoverContent className="z-50">
                                    <Card className="mx-auto max-w-md">
                                    <div className="mb-2 text-center font-mono text-sm text-slate-500"> Palette </div>
                                                    <div className='flex flex-row'>
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
                                                                                        const newPalette = [...palette];
                                                                                        newPalette[id] = `${color}-${shade}`;
                                                                                        setPalette(concatenateArray(newPalette.slice(0, 5)));
                                                                                    }}
                                                                                ></div>
                                                                            ))}
                                                                        </div>
                                                                    ))}
                                                                </Card>
                                                            </PopoverContent>
                                                        </Popover>
                                                    ))}
                                                    </div>
                                                    <div className="mb-2 mt-2 text-center font-mono text-sm text-slate-500"> Presets </div>
                                                    {palettes.map((element, id) => (
                                                        <Button key={id} className={`bg-${element[0]} max-w-3.5`} onClick={() => setPalette(concatenateArray(element))}></Button>

                                                    ))}
                                    </Card>


                                </PopoverContent>
                            </Popover>
                                    {/* select data */}
                                    <Popover>
                                <PopoverTrigger asChild className='p-0'>
                                    <Button variant='secondary' className='mr-1 p-0.5'><Icon size="sm" icon={RiHammerFill} /></Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <Card>
                                    <div className="mb-2 mt-2 text-center font-mono text-sm text-slate-500"> Label </div>
                                        <Select value={firstKey} onValueChange={(value) => setFirstKey(value)}>
                                            {keys && keys.map((item: string) => (
                                                <SelectItem key={item} value={item}>
                                                    {item}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        <div className="mb-2 mt-2 text-center font-mono text-sm text-slate-500"> Data 1</div>
                                        <Select value={secondKey} onValueChange={(value) => setSecondKey(value)}>
                                            {keys && keys.map((item: string) => (
                                                <SelectItem key={item} value={item}>
                                                    {item}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        { chartType != 'circle' && chartType != 'barlist' && <>
                                        <div className="mb-2 mt-2 text-center font-mono text-sm text-slate-500"> Data 2 </div>
                                        <Select value={thirdKey} onValueChange={(value) => setThirdKey(value)}>
                                            {keys && keys.map((item: string) => (
                                                <SelectItem key={item} value={item}>
                                                    {item}
                                                </SelectItem>
                                            ))}
                                        </Select>
                                        </> }
                                    </Card>
                                </PopoverContent>
                            </Popover>

                        </motion.nav>
                        <motion.nav className='overflow-visible'>

                            <Popover>
                                <PopoverTrigger asChild><Button className='mt-0'>
                                <a>Menu</a>
                            </Button>
                            </PopoverTrigger>
                                <PopoverContent updatePositionStrategy='always'>
                                <Card>
                                                            {/* chart type submenu */}

                            <Popover>
                            <PopoverTrigger asChild className='overflow-visible'>
                                <li><Icon size="sm" icon={RiPieChartBoxFill} /></li>
                            </PopoverTrigger>

                                <PopoverContent updatePositionStrategy='always' className='absolute overflow-visible block'>
                                    <Card>
                                    <li onClick={() => {
                                    setMode("pie")
                                    setChartType("circle");
                                    setCurrentIcon("pie")
                                }}><Icon size="sm" variant={currentIcon == "pie" ? 'solid' : 'simple'} icon={RiPieChartFill} /></li>
                                <li onClick={() => {
                                    setMode("donut")
                                    setChartType("circle")
                                    setCurrentIcon("donut")
                                }}  ><Icon size="sm" variant={currentIcon == "donut" ? 'solid' : 'simple'} icon={RiDonutChartFill} /></li>
                                <li onClick={() => {
                                    setChartType("bar")
                                    setCurrentIcon("bar")
                                }}><Icon size="sm" variant={currentIcon == "bar" ? 'solid' : 'simple'} icon={RiBarChart2Fill} /></li>
                                <li onClick={() => {
                                    setChartType("barlist")
                                    setCurrentIcon("barlist")
                                }}><Icon size="sm" variant={currentIcon == "barlist" ? 'solid' : 'simple'} icon={RiBarChartHorizontalFill} /></li>
                                <li onClick={() => {
                                    setChartType("scatterchart")
                                    setCurrentIcon("scatterchart")
                                }}><Icon size="sm" variant={currentIcon == "scatterchart" ? 'solid' : 'simple'} icon={RiBubbleChartFill} /></li>
                                    </Card>
                                </PopoverContent>
                                </Popover>

                                                            {/* rest of the menu */}

                                <li onClick={() => setBig(!isBig)}><Icon size="sm" icon={isBig ? RiCollapseDiagonal2Fill : RiExpandDiagonal2Fill} /></li>
                                <li onClick={() => captureElementAndDownload()}><Icon size="sm" icon={RiDownload2Line} /></li>
                                <li onClick={() => {
                                    props.uploadChart(storeChart())
                                }}><Icon size="sm" variant='simple' icon={RiFolderUploadFill} /></li>    
                                </Card>
                            </PopoverContent>
                            </Popover>
                        </motion.nav>
                    </div>


                </>
                }
            </Reorder.Item >
        </>
    );
})

export default ChartWrapper;