import { ResponsiveLine } from '@nivo/line'


const ReveloLineGraph = () => {
    const data = [
        {
            "id": "japan",
            "color": "hsl(339, 70%, 50%)",
            "data": [
                {
                    "x": "plane",
                    "y": 74
                },
                {
                    "x": "helicopter",
                    "y": 294
                },
                {
                    "x": "boat",
                    "y": 136
                },
                {
                    "x": "train",
                    "y": 147
                },
                {
                    "x": "subway",
                    "y": 101
                },
                {
                    "x": "bus",
                    "y": 64
                },
                {
                    "x": "car",
                    "y": 198
                },
                {
                    "x": "moto",
                    "y": 79
                },
                {
                    "x": "bicycle",
                    "y": 175
                },
                {
                    "x": "horse",
                    "y": 217
                },
                {
                    "x": "skateboard",
                    "y": 117
                },
                {
                    "x": "others",
                    "y": 189
                }
            ]
        },
        {
            "id": "france",
            "color": "hsl(66, 70%, 50%)",
            "data": [
                {
                    "x": "plane",
                    "y": 193
                },
                {
                    "x": "helicopter",
                    "y": 24
                },
                {
                    "x": "boat",
                    "y": 39
                },
                {
                    "x": "train",
                    "y": 264
                },
                {
                    "x": "subway",
                    "y": 204
                },
                {
                    "x": "bus",
                    "y": 257
                },
                {
                    "x": "car",
                    "y": 67
                },
                {
                    "x": "moto",
                    "y": 184
                },
                {
                    "x": "bicycle",
                    "y": 153
                },
                {
                    "x": "horse",
                    "y": 120
                },
                {
                    "x": "skateboard",
                    "y": 158
                },
                {
                    "x": "others",
                    "y": 293
                }
            ]
        },
        {
            "id": "us",
            "color": "hsl(325, 70%, 50%)",
            "data": [
                {
                    "x": "plane",
                    "y": 148
                },
                {
                    "x": "helicopter",
                    "y": 250
                },
                {
                    "x": "boat",
                    "y": 145
                },
                {
                    "x": "train",
                    "y": 182
                },
                {
                    "x": "subway",
                    "y": 295
                },
                {
                    "x": "bus",
                    "y": 144
                },
                {
                    "x": "car",
                    "y": 187
                },
                {
                    "x": "moto",
                    "y": 245
                },
                {
                    "x": "bicycle",
                    "y": 180
                },
                {
                    "x": "horse",
                    "y": 224
                },
                {
                    "x": "skateboard",
                    "y": 179
                },
                {
                    "x": "others",
                    "y": 177
                }
            ]
        },
        {
            "id": "germany",
            "color": "hsl(351, 70%, 50%)",
            "data": [
                {
                    "x": "plane",
                    "y": 169
                },
                {
                    "x": "helicopter",
                    "y": 14
                },
                {
                    "x": "boat",
                    "y": 43
                },
                {
                    "x": "train",
                    "y": 235
                },
                {
                    "x": "subway",
                    "y": 136
                },
                {
                    "x": "bus",
                    "y": 97
                },
                {
                    "x": "car",
                    "y": 208
                },
                {
                    "x": "moto",
                    "y": 270
                },
                {
                    "x": "bicycle",
                    "y": 237
                },
                {
                    "x": "horse",
                    "y": 81
                },
                {
                    "x": "skateboard",
                    "y": 156
                },
                {
                    "x": "others",
                    "y": 7
                }
            ]
        },
        {
            "id": "norway",
            "color": "hsl(275, 70%, 50%)",
            "data": [
                {
                    "x": "plane",
                    "y": 187
                },
                {
                    "x": "helicopter",
                    "y": 192
                },
                {
                    "x": "boat",
                    "y": 296
                },
                {
                    "x": "train",
                    "y": 257
                },
                {
                    "x": "subway",
                    "y": 240
                },
                {
                    "x": "bus",
                    "y": 103
                },
                {
                    "x": "car",
                    "y": 283
                },
                {
                    "x": "moto",
                    "y": 183
                },
                {
                    "x": "bicycle",
                    "y": 274
                },
                {
                    "x": "horse",
                    "y": 139
                },
                {
                    "x": "skateboard",
                    "y": 259
                },
                {
                    "x": "others",
                    "y": 71
                }
            ]
        }
    ]
    return (<ResponsiveLine
        data={data}
        margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
        xScale={{ type: 'point' }}
        yScale={{
            type: 'linear',
            min: 'auto',
            max: 'auto',
            stacked: true,
            reverse: false
        }}
        yFormat=" >-.2f"
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'transportation',
            legendOffset: 36,
            legendPosition: 'middle'
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'count',
            legendOffset: -40,
            legendPosition: 'middle'
        }}
        pointSize={10}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={2}
        pointBorderColor={{ from: 'serieColor' }}
        pointLabelYOffset={-12}
        useMesh={true}
        legends={[
            {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 100,
                translateY: 0,
                itemsSpacing: 0,
                itemDirection: 'left-to-right',
                itemWidth: 80,
                itemHeight: 20,
                itemOpacity: 0.75,
                symbolSize: 12,
                symbolShape: 'circle',
                symbolBorderColor: 'rgba(0, 0, 0, .5)',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemBackground: 'rgba(0, 0, 0, .03)',
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
    />
    )
}
export default ReveloLineGraph