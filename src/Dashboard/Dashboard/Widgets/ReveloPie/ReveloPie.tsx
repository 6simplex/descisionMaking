/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponsivePie } from "@nivo/pie"
type Props = {
  data: any;
  valueFieldName: any
}

const ReveloPie = (props: Props) => {

  const createDataForPie = () => {
    const pieData: any[] = []
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
        pieData.push({
          id: autoCaptialize(val),
          label: autoCaptialize(val),
          value: element[val]
        })
      })
    })
    return pieData
  }
  const autoCaptialize = (str: any): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  return (
    <ResponsivePie
      data={createDataForPie()}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{
        from: 'color',
        modifiers: [
          [
            'darker',
            0.2
          ]
        ]
      }}

      arcLinkLabel={e => `${autoCaptialize(e.id)}`}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: 'color' }}
      arcLabelsSkipAngle={0}
      arcLabelsTextColor={{
        from: 'color',
        modifiers: [
          [
            'darker',
            2
          ]
        ]
      }}
      layers={['arcs', 'arcLabels', 'arcLinkLabels', 'legends',]}
      legends={[
        {
          anchor: 'bottom',
          direction: 'row',
          justify: false,
          translateX: 0,
          translateY: 56,
          itemsSpacing: 0,
          itemWidth: 100,
          itemHeight: 18,
          itemTextColor: '#999',
          itemDirection: 'left-to-right',
          itemOpacity: 1,
          symbolSize: 18,
          symbolShape: 'circle',
          effects: [
            {
              on: 'hover',
              style: {
                itemTextColor: '#000'
              },


            }
          ]
        }
      ]}
    />
  )
}


export default ReveloPie