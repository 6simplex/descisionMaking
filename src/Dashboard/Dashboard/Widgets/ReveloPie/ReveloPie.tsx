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
          id: upperCase(val),
          label: upperCase(val),
          value: element[val]
        })
      })
    })
    return pieData
  }
  const upperCase = (str: any): string => {
    return str.toUpperCase()
  }
  const MyCustomLayer = ({ centerX, centerY }: any) => {
    return (
      <g transform={`translate(${centerX}, ${centerY})`}>
        <text textAnchor="middle" alignmentBaseline="middle" fontSize="1.1rem" fontWeight={500}>
          {createDataForPie().reduce((total, item) => total + item.value, 0)}
        </text>
      </g>
    );
  };

  return (

    <ResponsivePie
      data={createDataForPie()}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.56}
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

      layers={['arcs', 'arcLabels', 'arcLinkLabels', 'legends', MyCustomLayer]}
      arcLinkLabel={e => `${upperCase(e.id)}`}
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
            3
          ]
        ]
      }}

      legends={[
        {
          anchor: 'bottom',
          direction: 'row',
          justify: false,
          translateX: 0,
          translateY: 56,
          itemsSpacing: 0,
          itemWidth: 95,
          itemHeight: 18,
          itemTextColor: '#999',
          itemDirection: 'left-to-right',
          itemOpacity: 1,
          symbolSize: 10,
          symbolShape: 'circle',
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: '#000'
              },

            },

          ],

        }
      ]}
    />
  )
}


export default ReveloPie