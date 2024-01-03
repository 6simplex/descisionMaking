/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResponsivePie } from "@nivo/pie";
import { Typography } from "antd";
type Props = {
  data: any;
  valueFieldName: any;
  arcLinkLabels?: boolean;
  bottom?: number;
  total?: number;
};
type ChildProps ={
  onClick: (data: any) => void;
};
const ReveloPie: React.FC<Props & ChildProps> = (props) => {
  const handleClick = (data:any) => {
    props.onClick(data);
   };
   const autoCaptialize = (str: any): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  const createDataForPie = () => {
    const pieData: any[] = [];
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
    result.forEach((element) => {
      Object.keys(element).forEach((val) => {
        pieData.push({
          id: upperCase(val),
          label: autoCaptialize(val),
          value: element[val],
          indexValue: lowerCase(val)
        });
      });
    });
    return pieData;
  };
  const lowerCase = (str: any): string => {
    return str.toLowerCase();
  };
  const upperCase = (str: any): string => {
    return str.toUpperCase();
  };
  const MyCustomLayer = ({ centerX, centerY }: any) => {
    return (
      <g transform={`translate(${centerX}, ${centerY})`}>
        <text
          textAnchor="middle"
          alignmentBaseline="middle"
          fontSize="1.1rem"
          fontWeight={500}
        >
          {props.total
            ? props.total
            : createDataForPie().reduce((total, item) => total + item.value, 0)}
        </text>
      </g>
    );
  };

  return (
    <ResponsivePie
      data={createDataForPie()}
      enableArcLinkLabels={props.arcLinkLabels === false ? false : true}
      onClick={(data)=>{handleClick(data)}}
      margin={{
        top: 40,
        right: 10,
        bottom: props.bottom ? props.bottom : 80,
        left: 10,
      }}
      innerRadius={0.56}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      layers={["arcs", "arcLabels", "arcLinkLabels", "legends", MyCustomLayer]}
      arcLabel={(e) =>
        `${(
          (e.value /
            (props.total
              ? props.total
              : createDataForPie().reduce(
                  (total, item) => total + item.value,
                  0
                ))) *
          100
        ).toFixed(2)}%`
      }
      arcLinkLabel={(e) => `${upperCase(e.id)} (${e.value})`}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#333333"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{
        from: "color",
        modifiers: [["darker", 3]],
      }}
      tooltip={(e) => (
        <>
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
                fill={e.datum.color}
                rx={0}
                ry={0}
                stroke={e.datum.color} // Set the border color
                strokeWidth="2"
              ></rect>
            </svg>
            <Typography
              style={{
                fontSize: "11px",
                fontFamily: "sans-serif",
                fontWeight: "bold",
              }}
            >{`${e.datum.id}: ${e.datum.formattedValue} (${(
              (e.datum.value /
                (props.total
                  ? props.total
                  : createDataForPie().reduce(
                      (total, item) => total + item.value,
                      0
                    ))) *
              100
            ).toFixed(2)}%)`}</Typography>
          </div>{" "}
        </>
      )}
      legends={[
        {
          anchor: props.arcLinkLabels === true ? "top-right" : "bottom",
          direction: props.arcLinkLabels === true ? "column" : "row",
          justify: false,
          translateX: props.arcLinkLabels === true ? 25 : 0,
          translateY: props.arcLinkLabels === true ? -30 : 56,
          itemsSpacing: 0,
          itemWidth: 70,
          itemHeight: 18,
          itemTextColor: "#999",
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 10,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: {
                itemTextColor: "#000",
              },
            },
          ],
        },
      ]}
    />
  );
};

export default ReveloPie;
