/* eslint-disable @typescript-eslint/no-explicit-any */

import { ResponsiveBar } from "@nivo/bar";

type Props = {
  data: any;
  valueFieldName: any;
  xAxis: string;
  yAxis: string
}
const ReveloBarGraph = (props: Props) => {
  const createDataBarGraph = () => {
    const barGraph: any[] = []
    const result: any[] = [];
    props.data.forEach((entry: { [x: string]: any; }) => {
      const matchingValues: any = {};
      props.valueFieldName.forEach((key: string | number) => {
        if (entry[key] !== undefined) {
          matchingValues[key] = entry[key];
        }
      });
      if (Object.keys(matchingValues).length > 0) {
        result.push(matchingValues);
      }
    });
    result.forEach((element) => {
      Object.keys(element).forEach((val) => {
        barGraph.push({
          [props.xAxis]: autoCaptialize(val),
          [val]: element[val]
        })
      })
    })


    return barGraph
  }
  const autoCaptialize = (str: any): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <ResponsiveBar
      data={createDataBarGraph()}
      keys={props.valueFieldName}
      indexBy={props.xAxis}
      margin={{ top: 50, right: 70, bottom: 50, left: 60 }}
      padding={0.3}
      groupMode="stacked"
      valueScale={{ type: 'linear' }}
      indexScale={{ type: 'band', round: true }}
      colors={{ scheme: 'nivo' }}
      legendLabel={(e) => `${autoCaptialize(e.id)}`}
      borderColor={{
        from: 'color',
        modifiers: [
          [
            'darker',
            1.6
          ]
        ]
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: props.xAxis,
        legendPosition: 'middle',
        legendOffset: 32
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: props.yAxis,
        legendPosition: 'middle',
        legendOffset: -40
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: 'color',
        modifiers: [
          [
            'darker',
            1.6
          ]
        ]
      }}


    // legends={[
    //   {
    //     dataFrom: 'keys',
    //     anchor: 'bottom-right',
    //     direction: 'column',
    //     justify: false,
    //     translateX: 120,
    //     translateY: 0,
    //     itemsSpacing: 2,
    //     itemWidth: 100,
    //     itemHeight: 20,
    //     itemDirection: 'left-to-right',
    //     itemOpacity: 0.85,
    //     symbolSize: 20,

    //     effects: [
    //       {
    //         on: 'hover',
    //         style: {
    //           itemOpacity: 1
    //         }
    //       }
    //     ]
    //   },
    // ]}


    />
  );
};

export default ReveloBarGraph;
