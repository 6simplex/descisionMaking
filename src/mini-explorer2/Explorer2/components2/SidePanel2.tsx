import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../../Redux/store/store";
import { Checkbox, List, Spin, Table, Typography, message } from "antd";
import { fromLonLat } from "ol/proj";
import "ol/ol.css";
import { RFeature, RLayerVector, RMap, ROSM } from "rlayers";
import { MultiPolygon } from "ol/geom";
import { Fill, Stroke, Style, Text } from "ol/style";
import PaymentBox from "./PaymentBox";
import { createEntitySequence } from "../../../utils/cutsomhooks";
import Attachment from "./Attachment";

const center = fromLonLat([79.08886, 21.146633]);
type Props = {
  loading: boolean;
  unit: any;
  jurisdiction: string[];
  date: any;
};
export const SidePanel2 = (props: Props) => {
  const { projectConceptModel, obcmSnapShotDetails, userInfo } = useAppSelector(
    (state) => state.reveloUserInfo
  );
  const [datasource, setDataSource] = useState<any>({});

  const [unitDetails, setUnitDetails] = useState<any>({});
  const [indexes, setIndexes] = useState("");
  const [indexesBlock, setIndexesBlock] = useState("");
  const [shiftIds, setShiftIds] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [bill, setBill] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unitId, setUnitId] = useState("");
  const unitVecRef = useRef<any>(null);
  const getBlocks = async (id: any) => {
    setLoading(true);
    await axios
      .get(
        `${window.__rDashboard__.serverUrl}/conceptmodels/${projectConceptModel.name}/entities/block/query?unitid=${id}`
      )
      .then((res) => {
        if (res.status === 200) {
          setBlocks(res.data.features);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getReports = async (id: string) => {
    let payload: any = [];
    let protocol = userInfo.userInfo.customerInfo.outputStore.securityInfo
      .isSSLEnabled
      ? "https"
      : "http";
    let domain = `${userInfo.userInfo.customerInfo.outputStore.hostName}:${userInfo.userInfo.customerInfo.outputStore.portNumber}`;
    try {
      const reportOutPut = await axios.post(
        `${protocol}://${domain}/nmc_explorer_data_generator/_search`,
        {
          size: 1000,

          query: {
            bool: {
              must: [
                { match: { unitID: id } },
                { match: { shiftdate: props.date } },
              ],
            },
          },
        }
      );
      if (reportOutPut.data.error) {
        setLoading(false);
        return message.error("Something went Wrong");
      }
      if (reportOutPut.data.hits.hits.length === 0) {
        setBill([]);
        setShiftIds([]);
      } else {
        reportOutPut.data.hits.hits.forEach((outPut: any) => {
          payload.push(outPut._source);
          setBill(payload);
        });
      }
    } catch (err) {
      console.log(err);
    }
  };
  const checkBlockIfHaveData = (id: string) => {
    let payload: any = [];
    if (bill.length === 0) {
      setShiftIds([]);
      return "No data To preview!";
    } else {
      bill.map((b: any) => {
        if (
          Object.keys(b.blockInfo).length &&
          Object.keys(b.blockInfo[id]).length
        ) {
          Object.keys(b.blockInfo[id]).forEach((key) => {
            payload.push({
              shiftId: key,
              ...b.blockInfo[id][key],
            });
          });
        }
      });

      setShiftIds(payload);
    }
  };
  useEffect(() => {
    if (unitId && indexes) {
      getReports(unitId);
      setIndexesBlock("");
    }
  }, [props.date, unitId, indexes]);
  useEffect(() => {
    if (props.loading) {
      setBlocks([]);
      setIndexes("");
      setIndexesBlock("");
      setUnitDetails({});
      setBill([]);
    }
  }, [props.loading]);
  console.log(datasource);
  return (
    <>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          placeContent: "flex-start",
          placeItems: "flex-start",
          minHeight: "50%",
        }}
      >
        <List
          loading={props.loading}
          style={{
            width: "100%",
            height: "100%",
            overflowY: "auto",
            marginRight: "2px",
          }}
          header={
            <div style={{ fontSize: "100%", fontWeight: "bolder" }}>
              Unit ({props.loading ? 0 : props.unit.features.length})
            </div>
          }
          bordered
          dataSource={props.loading ? [] : props.unit.features}
          renderItem={(item: any, index) => (
            <List.Item
              id={item.properties.unitname}
              style={{
                display: "flex",
                flexDirection: "row",
                placeItems: "center",
                placeContent: "flex-start",
              }}
            >
              <Checkbox
                style={{ marginRight: "2%" }}
                checked={indexes === item.properties.unitname}
                value={indexes}
                onChange={(e) => {
                  setIndexes(item.properties.unitname);
                  setUnitId(item.properties.unitid);
                  setIndexesBlock("");
                  getReports(item.properties.unitid);
                  getBlocks(item.properties.unitid);
                  setUnitDetails(item.properties);
                  let d1: any = {};
                  createEntitySequence(
                    obcmSnapShotDetails.entities,
                    obcmSnapShotDetails.relations
                  ).forEach((el: any, index: number) => {
                    if (el.name === "ward") {
                    } else {
                      d1[el.name] = item.properties[el.name];
                    }
                  });
                  setDataSource({ ...d1, name: item.properties.unitname });
                  setShiftIds([]);
                  unitVecRef.current.context.map
                    .getLayers()
                    .getArray()
                    .forEach((layer: any) => {
                      if (layer.get("name") === "unit") {
                        layer.getSource().forEachFeature((f: any) => {
                          if (f.get("unitname") === item.properties.unitname) {
                            unitVecRef.current.context.map
                              .getView()
                              .fit(f.getGeometry().getExtent(), {
                                duration: 2000,
                                padding: [200, 200, 200, 200],
                              });
                          }
                        });
                      }
                    });
                }}
              />
              <Typography.Text>{item.properties.unitname}</Typography.Text>
            </List.Item>
          )}
        />
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          placeContent: "flex-start",
          placeItems: "flex-start",
          minHeight: "50%",
        }}
      >
        <List
          loading={loading}
          style={{
            width: "100%",
            height: "100%",
            overflowY: "auto",
            marginRight: "2px",
          }}
          header={
            <div style={{ fontSize: "100%", fontWeight: "bolder" }}>
              Blocks ({blocks.length})
            </div>
          }
          bordered
          dataSource={blocks}
          renderItem={(item: any, index) => {
            return (
              <List.Item
                id={item.properties.blocknumber}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  placeItems: "center",
                  placeContent: "flex-start",
                }}
              >
                <Checkbox
                  style={{ marginRight: "2%" }}
                  checked={indexesBlock === item.properties.blocknumber}
                  value={indexesBlock}
                  onChange={(e) => {
                    setIndexesBlock(item.properties.blocknumber);
                    checkBlockIfHaveData(item.properties.blocksid);
                  }}
                />
                <Typography.Text>{item.properties.blocknumber}</Typography.Text>
              </List.Item>
            );
          }}
        />
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "40% 60%",
          border: "1px solid #d9d9d9",
          borderRadius: "8px",
        }}
      >
        {indexes ? (
          <>
            <div
              style={{
                width: "100%",
                minHeight: "50%",
                display: "grid",
                gridTemplateRows: "30% 70%",
              }}
            >
              <div
                className="block-1"
                style={{ height: "inherit", padding: "2px" }}
              >
                <Table
                  size="small"
                  bordered
                  // style={{ width: "10rem" }}
                  pagination={false}
                  columns={[
                    {
                      title: "Unit Name",
                      dataIndex: "name",
                      key: "name",
                    },
                   
                    {
                      title: "City",
                      dataIndex: "city",
                      key: "city",
                    },
                    {
                      title: "Zone",
                      dataIndex: "zone",
                      key: "zone",
                    },
                  ]}
                  dataSource={[datasource]}
                />
                {/* <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    placeItems: "center",
                    placeContent: "flex-start",
                  }}
                >
                  <Typography style={{ fontSize: "125%" }}>Unit:</Typography>
                  <Typography
                    style={{
                      color: "#0075ea",
                      fontSize: "125%",
                    }}
                  >
                    {indexes}
                  </Typography>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    placeItems: "center",
                    placeContent: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: "100%",
                      flexDirection: "column",
                      placeItems: "center",
                      placeContent: "center",
                    }}
                  >
                    {createEntitySequence(
                      obcmSnapShotDetails.entities,
                      obcmSnapShotDetails.relations
                    ).map((el: any, index: number) => {
                      return (
                        <>
                          {el.name === "state" ||
                          el.name === "country" ||
                          el.name === "ward" ? (
                            <></>
                          ) : (
                            <>
                              <Typography
                                style={{
                                  fontSize: "110%",
                                  marginRight: "10px",
                                }}
                              >
                                {el.label}:
                              </Typography>
                              <Typography
                                style={{
                                  fontSize: "110%",
                                  marginRight: "10px",
                                  color: "#0075ea",
                                }}
                              >
                                {unitDetails[el.name]}
                              </Typography>
                            </>
                          )}
                        </>
                      );
                    })}
                  </div>
                </div> */}
              </div>
              <div
                className="block-2"
                style={{
                  borderTop: "1px solid #d9d9d9",
                  padding: "10px",
                }}
              >
                {indexesBlock ? (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        placeItems: "flex-start",
                      }}
                    >
                      <Typography style={{ fontSize: "150%" }}>
                        Block:
                      </Typography>
                      <Typography
                        style={{
                          fontSize: "150%",
                          color: "#0075ea",
                          marginLeft: "5px",
                        }}
                      >
                        {indexesBlock}
                      </Typography>
                    </div>
                    {shiftIds.length === 0 ? (
                      <>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            placeContent: "center",
                            placeItems: "center",
                            height: "inherit",
                            width: "100%",
                            padding: "20px",
                          }}
                        >
                          <Typography style={{ fontWeight: "bold" }}>
                            All Shifts are skipped!
                          </Typography>
                        </div>
                      </>
                    ) : (
                      <>
                        {" "}
                        <Attachment shifts={shiftIds} />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        placeContent: "center",
                        placeItems: "center",
                        height: "inherit",
                        width: "100%",
                        padding: "20px",
                      }}
                    >
                      <Typography
                        style={{ fontSize: "1.2rem", fontWeight: "bold" }}
                      >
                        Please select block to get details
                      </Typography>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                placeContent: "center",
                placeItems: "center",
                height: "inherit",
                width: "100%",
              }}
            >
              <Typography style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                Please select unit
              </Typography>
            </div>
          </>
        )}

        <div
          style={{
            minHeight: "50%",
            display: "grid",
            gridTemplateRows: "30% 70%",
            borderLeft: "1px solid #d9d9d9",
          }}
        >
          {bill.length === 0 ? (
            <>
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  placeContent: "center",
                  placeItems: "center",
                  marginBottom: "2px",
                }}
              >
                <Typography> No data to display</Typography>
              </div>
            </>
          ) : (
            <>
              <div style={{ minHeight: "100%" }}>
                <PaymentBox bill={bill} />
              </div>
            </>
          )}
          <div
            style={{
              height: "100%",
              width: "100%",
              borderTop: "1px solid #d9d9d9",
            }}
          >
            {props.loading ? (
              <>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    placeContent: "center",
                    placeItems: "center",
                    height: "inherit",
                  }}
                >
                  <Spin />
                </div>
              </>
            ) : (
              <>
                <RMap
                  width={"100%"}
                  height={"inherit"}
                  initial={{ center: center, zoom: 11 }}
                >
                  <ROSM />
                  <RLayerVector
                    ref={unitVecRef}
                    zIndex={10}
                    properties={{ name: "unit" }}
                  >
                    {props.unit.features.map((f: any) => {
                      return (
                        <>
                          <RFeature
                            properties={f.properties}
                            style={
                              new Style({
                                fill: new Fill({
                                  color: "rgba(255, 0, 0, 0.5)",
                                }),
                                stroke: new Stroke({
                                  width: 2,
                                }),
                                text: new Text({
                                  font: "15px sens-sarif",
                                  text: f.properties.unitname,
                                  textAlign: "center",
                                  fill: new Fill({
                                    color: "white",
                                  }),
                                }),
                              })
                            }
                            geometry={new MultiPolygon(f.geometry.coordinates)}
                            onClick={(e: any) => {
                              const listItemElement = document.getElementById(
                                `${e.target.get("unitname")}`
                              );
                              if (listItemElement) {
                                listItemElement.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
                                });
                              }
                              setIndexes(e.target.get("unitname"));
                              getBlocks(e.target.get("unitid"));

                              unitVecRef.current.context.map
                                .getView()
                                .fit(e.target.getGeometry().getExtent(), {
                                  duration: 2000,
                                  padding: [200, 200, 200, 200],
                                });
                            }}
                          ></RFeature>
                        </>
                      );
                    })}
                  </RLayerVector>
                </RMap>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
