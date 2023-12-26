/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import "./Wrapper.css";
import {
  Button,
  DatePicker,
  Select,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import { FullscreenOutlined, SyncOutlined } from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAppSelector } from "../../../Redux/store/store";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import { todayDate } from "../../../utils/cutsomhooks";
import ReveloPie from "./ReveloPie/ReveloPie";
import ReveloBarGraph from "./ReveloBarGraph/ReveloBarGraph";
dayjs.extend(weekday);
dayjs.extend(localeData);
type Props = {
  name: string;
  label: string;
  outFields: any;
  jurisdiction: any;
};

const WrapperNMC1 = (props: Props) => {
  const [value, setValue] = useState<any[]>([]);
  const { projectName } = useParams();
  const { userInfo, projectConceptModel } = useAppSelector(
    (state) => state.reveloUserInfo
  );

  const [unitList, setUnitList] = useState<any[]>([]);

  const [value1, setValue1] = useState(unitList[0]);

  const [loading, setLoading] = useState(true);
  const [loading1, setLoading1] = useState(true);

  const [refresh, setRefresh] = useState(true);
  const [date, setDate] = useState(todayDate());
  const getJtypeandJname = (): string[] => {
    if (props.jurisdiction === "All") {
      return [
        userInfo.userInfo.jurisdictions[0]?.name,
        userInfo.userInfo.jurisdictions[0]?.type,
      ];
    } else if (props.jurisdiction) {
      return [props.jurisdiction.name, props.jurisdiction.type];
    } else {
      return [
        userInfo.userInfo.jurisdictions[0]?.name,
        userInfo.userInfo.jurisdictions[0]?.type,
      ];
    }
  };
  const getlistdata = async () => {
    setLoading(true);
    await axios
      .get(
        `${window.__rDashboard__.serverUrl}/conceptmodels/${projectConceptModel.name}/entities/vendor/data?format=geojson&source=remote&targetArtifact=original`
      )
      .then((res) => {
        let payload: any[] = [];
        if (res.status === 200) {
          res.data.features.forEach((el: any) => {
            payload.push(el.properties.vendorname);
          });
          setUnitList(payload);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };

  const getReports = async (id: string) => {
    setLoading1(true);

    let payload: any = [];
    let protocol = userInfo.userInfo.customerInfo.outputStore.securityInfo
      .isSSLEnabled
      ? "https"
      : "http";
    let domain = `${userInfo.userInfo.customerInfo.outputStore.hostName}:${userInfo.userInfo.customerInfo.outputStore.portNumber}`;
    try {
      const reportOutPut = await axios.post(
        `${protocol}://${domain}/nmc_shiftdetails_data_generator/_search`,
        {
          size: 1000,
          query: {
            bool: {
              must: [
                { match_phrase: { vendorname: id } },
                { match_phrase: { shiftdate: date } },
                {
                  match_phrase: {
                    [getJtypeandJname()[1]]: getJtypeandJname()[0],
                  },
                },
              ],
            },
          },
        }
      );
      if (reportOutPut.data.error) {
        setLoading1(false);
        return message.error("Something went Wrong");
      }
      if (reportOutPut.data.hits.hits.length === 0) {
      } else {
        reportOutPut.data.hits.hits.forEach((outPut: any) => {
          payload.push(outPut._source.shiftInfo);
        });
        let sum = 0;
        let aftersum = 0;
        let eveSum = 0;
        payload.forEach((element: any) => {
          sum = sum + element.Morning.morningCost;
        });
        payload.forEach((element: any) => {
          aftersum = aftersum + element.Afternoon.afternoonCost;
        });
        payload.forEach((element: any) => {
          eveSum = eveSum + element.Evening.eveningCost;
        });
        setValue([
          {
            Morning: sum.toFixed(2),
            Afternoon: aftersum.toFixed(2),
            Evening: eveSum.toFixed(2),
          },
        ]);
        setLoading1(false);
      }
    } catch (err) {
      console.log(err);
      setLoading1(false);
    }
  };
  useEffect(() => {
    if (unitList.length) {
      getReports(unitList[0]);
    }
  }, [unitList, date]);
  useEffect(() => {
    getlistdata();
  }, [props.jurisdiction]);

  return (
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
                    props.outFields.type === "Table"
                      ? `/project/${projectName}/explore`
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
          <div style={{ marginTop: "2px", height: "inherit" }}>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                placeContent: "space-evenly",
                placeItems: "center",
              }}
            >
              <DatePicker
                allowClear={false}
                disabled={loading}
                disabledDate={(current) => {
                  const currentDate = dayjs();
                  return current && current.isAfter(currentDate, "day");
                }}
                defaultValue={dayjs()}
                showToday
                onChange={(date, dateString) => {
                  setDate(new Date(dateString).toISOString().split("T")[0]);
                  setValue1(unitList[0]);
                }}
              />
              <Select
                value={value1}
                showSearch
                defaultValue={unitList[0]}
                style={{ width: "10rem" }}
                onChange={(e) => {
                  getReports(e);
                  setValue1(e);
                }}
              >
                {unitList.map((el: any) => {
                  return (
                    <>
                      <Select.Option value={el}>{el}</Select.Option>
                    </>
                  );
                })}
              </Select>
            </div>
            <div style={{ height: "85%" }}>
              {!loading1 ? (
                <>
                  {isNaN(value[0].Morning) &&
                  isNaN(value[0].Afternoon) &&
                  isNaN(value[0].Evening) ? (
                    <>
                      <Typography
                        style={{
                          display: "flex",
                          flexBasis: "row",
                          placeContent: "center",
                          placeItems: "center",
                          height: "inherit",
                        }}
                      >
                        No Data To Display
                      </Typography>
                    </>
                  ) : (
                    <>
                      <ReveloBarGraph
                        data={value}
                        valueFieldName={["Morning", "Afternoon", "Evening"]}
                        xAxis="Shift"
                        yAxis="Total Cost"
                        onClick={() => {}}
                        conversion={true}
                      />
                    </>
                  )}
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WrapperNMC1;
