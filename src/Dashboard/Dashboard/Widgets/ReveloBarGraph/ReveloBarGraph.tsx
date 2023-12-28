/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponsiveBar } from "@nivo/bar";
import { Typography } from "antd";

type Props = {
  data: any;
  valueFieldName: any;
  xAxis: string;
  yAxis: string;
  conversion?: boolean;
};

type ChildProps = {
  onClick: (data: any) => void;
};
const ReveloBarGraph: React.FC<Props & ChildProps> = (props) => {
  const handleClick = (data: any) => {
    props.onClick(data);
  };
  console.log(props.data)
  const createDataBarGraph = () => {
    const barGraph: any[] = [];
    const result: any[] = [];
    props.data.forEach((entry: { [x: string]: any }) => {
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
    const label = autoCaptialize(props.xAxis);
    result.forEach((element) => {
      Object.keys(element).forEach((val) => {
        barGraph.push({
          [props.xAxis]: autoCaptialize(val),
          [val]: element[val],
        });
      });
    });
    return barGraph;
  };
  const autoCaptialize = (str: any): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  return (
    <ResponsiveBar
      data={createDataBarGraph()}
      keys={props.valueFieldName}
      indexBy={props.xAxis}
      margin={{ top: 50, right: 70, bottom: 60, left: 60 }}
      padding={0.3}
      onClick={(data) => {
        handleClick(data);
      }}
      groupMode="stacked"
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={{ scheme: "nivo" }}
      legendLabel={(e) => `${autoCaptialize(e.id)}`}
      borderColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: props.xAxis,
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: props.yAxis,
        legendPosition: "middle",
        legendOffset: -50,
        format: (value) => (props.conversion ? `${value / 1000}K` : value),
      }}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor="black"
      tooltip={({ id, value, color }) => (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            placeItems: "center",
            placeContent: "center",
            backgroundColor: "white",
            padding: "5px",
            zIndex: 9,
            boxShadow: "0px 10px 15px -3px rgba(0,0,0,0.1)",
          }}
        >
          <svg width="11" height="11" style={{ marginRight: "4px" }}>
            <rect
              width={11}
              height={11}
              fill={color}
              rx={0}
              ry={0}
              stroke={color} // Set the border color
              strokeWidth="2"
            ></rect>
          </svg>
          <Typography
            style={{
              fontSize: "11px",
              fontFamily: "sans-serif",
              fontWeight: "bold",
            }}
          >{`${id}: ${props.conversion ? "₹" : ""} ${value}`}</Typography>
        </div>
      )}
      label={(d) => (props.conversion ? `₹ ${d.value}` : `${d.value}`)}
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
