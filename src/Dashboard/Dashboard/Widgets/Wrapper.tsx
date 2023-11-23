/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import "./Wrapper.css";
import { Button, Space, Spin, Typography, message } from "antd";
import {
  DownloadOutlined,
  FullscreenOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import ReveloPie from "./ReveloPie/ReveloPie";
import ReveloBarGraph from "./ReveloBarGraph/ReveloBarGraph";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAppSelector } from "../../../Redux/store/store";
import ReveloTable from "./ReveloTable/ReveloTable";
type Props = {
  name: string;
  label: string;
  noOfRows: [];
  outFields: any;
  jurisdiction: any;
};

const Wrapper = (props: Props) => {

  const { projectName } = useParams();
  const { project, userInfo } = useAppSelector((state) => state.reveloUserInfo);
  const [reportOutPuts, setReportOutPuts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refresh, setRefresh] = useState(true);
  const rowStyle: React.CSSProperties = {
    width: "100%",
    height: "inherit",
    display: "flex",
    flexDirection: "row",
    placeContent: "space-evenly",
    placeItems: "center",
  };

  const getReportPutOut = async () => {
    const serverUrl = window.__rDashboard__.serverUrl;
    setLoading(true);
    const payload: any[] = [];
    const getJtypeandJname = (): string[] => {
      if (props.jurisdiction === "All") {
        return [
          userInfo.userInfo.jurisdictions[0]?.name,
          userInfo.userInfo.jurisdictions[0]?.type,
        ];
      } else if (props.jurisdiction) {
        return ([props.jurisdiction.name, props.jurisdiction.type]);
      } else {
        return [
          userInfo.userInfo.jurisdictions[0]?.name,
          userInfo.userInfo.jurisdictions[0]?.type,
        ];
      }
    };
    
    let protocol = userInfo.userInfo.customerInfo.outputStore.securityInfo.isSSLEnabled ? "https" : "http";
    let domain = `${userInfo.userInfo.customerInfo.outputStore.hostName}:${userInfo.userInfo.customerInfo.outputStore.portNumber}`;
    try {
      const reportOutPut = await axios.post(`${protocol}://${domain}/report_${project.name}_${props.name.toLocaleLowerCase()}/_search`, {
        size: 1000,
        "query": {
          "dis_max": {
            "queries": [

              { "match": { jurisdictionName: getJtypeandJname()[0] } }
            ]
          }
        }
      })
      if (reportOutPut.data.error) {
        setLoading(false);
        return message.error("Something went Wrong");
      }
      reportOutPut.data.hits.hits.forEach((outPut: any) => {
        payload.push(outPut._source);
      });

      setReportOutPuts(payload);
      setLoading(false);
    } catch (err) {
      console.log(err)
      setLoading(false);

    }

  };

  useEffect(() => {
    getReportPutOut();
  }, [refresh, props.jurisdiction]);
  return (
    <>
      <div className="main-wrapper">
        {loading ? (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                placeContent: "center",
                placeItems: "center",
                height: "inherit",
              }}
            >
              <Spin tip="Loading" />
              <p>Fetching Report...</p>
            </div>
          </>
        ) : (
          <>
            <div className="wrapper-header">
              <Typography className="header-label">{props.label}</Typography>
              <div className="header-buttons-wrapper">
                <Space>
                  <Link
                    to={
                      props.outFields.type === "Table" ?
                        `/project/${projectName}/explore`
                        : `/project/${projectName}/stats/${props.name}`
                    }
                    target="_blank"
                    state={{ allProps: props }}
                  >

                    <Button size="small" icon={<FullscreenOutlined />} />
                  </Link>
                  {/* <Button
                    size="small"
                    icon={<DownloadOutlined />}
                    onClick={() => { }}
                  /> */}
                  <Button
                    size="small"
                    onClick={() => {
                      setRefresh(!refresh);
                    }}
                    icon={<SyncOutlined />}
                  />
                </Space>
              </div>
            </div>
            {reportOutPuts.length > 0 ? (
              <>
                <div className="graph-class">
                  {props.noOfRows.map((rows: any) => {
                    const classNameOfRow = rows.columns.join("_");
                    return (
                      <>
                        <div
                          key={classNameOfRow}
                          className={classNameOfRow}
                          style={rowStyle}
                        >
                          {rows.columns.map((col: any) => {
                            return (
                              <>
                                {Object.keys(props.outFields.outFields).map(
                                  (fieldName: any) => {
                                    return (
                                      <>
                                        {col === fieldName ? (
                                          <>
                                            {props.outFields.outFields[col]
                                              .type === "text" ? (
                                              <>
                                                <div className="text">
                                                  <div
                                                    style={{
                                                      fontFamily: "sans-serif",
                                                      fontSize: "large",
                                                    }}
                                                  >
                                                    {
                                                      props.outFields.outFields[
                                                        col
                                                      ].label
                                                    }
                                                  </div>
                                                  <div
                                                    style={{
                                                      fontFamily: "sans-serif",
                                                      fontSize: "3rem",
                                                    }}
                                                  >
                                                    {
                                                      props.outFields.outFields[
                                                        col
                                                      ].format.prefix
                                                    }

                                                    {reportOutPuts[0][col] ===
                                                      undefined
                                                      ? ""
                                                      : reportOutPuts.length}
                                                    {
                                                      props.outFields.outFields[
                                                        col
                                                      ].format.suffix
                                                    }
                                                  </div>
                                                </div>
                                              </>
                                            ) : (
                                              <></>
                                            )}
                                          </>
                                        ) : (
                                          <></>
                                        )}
                                      </>
                                    );
                                  }
                                )}
                              </>
                            );
                          })}
                        </div>
                      </>
                    );
                  })}
                  {props.outFields.type === "pieChart" ? (
                    <>
                      <ReveloPie
                        data={reportOutPuts}
                        valueFieldName={
                          props.outFields.widgetInfo.valueFieldName
                        }
                      />
                    </>
                  ) : (
                    <></>
                  )}
                  {props.outFields.type === "barGraph" ? (
                    <>
                      <ReveloBarGraph
                        data={reportOutPuts}
                        valueFieldName={
                          props.outFields.widgetInfo.valueFieldName
                        }
                        xAxis={props.outFields.widgetInfo.xAxis.labelFieldName}
                        yAxis={props.outFields.widgetInfo.yAxis.labelFieldName}
                      />
                    </>
                  ) : (
                    <></>
                  )}
                  {props.outFields.type === "Table" ? (
                    <>
                      <ReveloTable data={reportOutPuts} />
                    </>
                  ) : (
                    <></>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="graph-class" style={{ display: "flex", flexDirection: "column", placeItems: "center", placeContent: "center" }}>
                  <Typography>No Data to Display</Typography>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default Wrapper;

