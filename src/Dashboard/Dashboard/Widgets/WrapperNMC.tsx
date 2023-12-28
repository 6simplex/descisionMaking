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
import {
  DownloadOutlined,
  FullscreenOutlined,
  SyncOutlined,
} from "@ant-design/icons";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useAppSelector } from "../../../Redux/store/store";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import { todayDate } from "../../../utils/cutsomhooks";
import ReveloPie from "./ReveloPie/ReveloPie";
import exportFromJSON from "export-from-json";
dayjs.extend(weekday);
dayjs.extend(localeData);
type Props = {
  name: string;
  label: string;
  outFields: any;
  jurisdiction: any;
};

const WrapperNMC = (props: Props) => {
  const [value, setValue] = useState("Morning");
  const { projectName } = useParams();
  const { userInfo, projectConceptModel } = useAppSelector(
    (state) => state.reveloUserInfo
  );
  const [total, setTotal] = useState(0);
  const [unitList, setUnitList] = useState<any[]>([]);
  const [pieData, setPieData] = useState<any>([]);
  const [value1, setValue1] = useState(unitList[0]);

  const [pieChartData, setPieChartData] = useState<any[]>([]);
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
        `${window.__rDashboard__.serverUrl}/conceptmodels/${
          projectConceptModel.name
        }/entities/unit/query?${getJtypeandJname()[1]}=${getJtypeandJname()[0]}`
      )
      .then((res) => {
        let payload: any[] = [];
        if (res.status === 200) {
          res.data.features.forEach((el: any) => {
            payload.push(el.properties.unitname);
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
                { match: { unitname: id } },
                { match: { shiftdate: date } },
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
        setTotal(payload[0].Morning.Total);
        setPieChartData([payload[0].Morning]);
        setPieData(payload);
        setLoading1(false);
      }
    } catch (err) {
      console.log(err);
      setLoading1(false);
    }
  };
  const downloadReport = async () => {
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
              must: [{ match: { shiftdate: date } }],
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
          let obj = {
            shiftdate: outPut._source.shiftdate,
            vendorname: outPut._source.vendorname,
            unitname: outPut._source.unitname,
            zone: outPut._source.zone,
            morningShiftTotal: outPut._source.shiftInfo.Morning.Total,
            morningShiftClean: outPut._source.shiftInfo.Morning.Clean,
            morningShiftDamaged: outPut._source.shiftInfo.Morning.Damaged,
            morningShiftBlocked: outPut._source.shiftInfo.Morning.Blocked,
            morningShiftLocked: outPut._source.shiftInfo.Morning.Locked,
            morningShiftskipped: outPut._source.shiftInfo.Morning.skipped,
            morningShiftmorningCost:
              outPut._source.shiftInfo.Morning.morningCost,
            afterNoonShiftTotal: outPut._source.shiftInfo.Afternoon.Total,
            afterNoonShiftClean: outPut._source.shiftInfo.Afternoon.Clean,
            afterNoonShiftDamaged: outPut._source.shiftInfo.Afternoon.Damaged,
            afterNoonShiftBlocked: outPut._source.shiftInfo.Afternoon.Blocked,
            afterNoonShiftLocked: outPut._source.shiftInfo.Afternoon.Locked,
            afterNoonShiftskipped: outPut._source.shiftInfo.Afternoon.skipped,
            afterNoonShiftmorningCost:
              outPut._source.shiftInfo.Afternoon.afternoonCost,
            eveningShiftTotal: outPut._source.shiftInfo.Evening.Total,
            eveningShiftClean: outPut._source.shiftInfo.Evening.Clean,
            eveningShiftDamaged: outPut._source.shiftInfo.Evening.Damaged,
            eveningShiftBlocked: outPut._source.shiftInfo.Evening.Blocked,
            eveningShiftLocked: outPut._source.shiftInfo.Evening.Locked,
            eveningShiftskipped: outPut._source.shiftInfo.Evening.skipped,
            eveningShiftmorningCost:
              outPut._source.shiftInfo.Evening.eveningCost,
          };
          payload.push(obj);
        });
        if (payload.length === 0) {
          message.info("No report for selected Date");
        } else {
          const data = payload;
          const fileName = `tmsreport_unitwise_${payload[0].shiftdate}`;
          const exportType = exportFromJSON.types.xls;
          const fields = {
            shiftdate: "Shift Date",
            vendorname: "Vendor Name",
            unitname: "Unit Name",
            zone: "Zone",
            morningShiftTotal: "Morning Shift Total",
            morningShiftClean: "Morning Shift Clean",
            morningShiftDamaged: "Morning Shift Damaged",
            morningShiftBlocked: "Morning Blocked",
            morningShiftLocked: "Morning Shift Locked",
            morningShiftskipped: "Morning Shift skipped",
            morningShiftmorningCost: "Morning Shift morningCost",
            afterNoonShiftTotal: "Afternoon Shift Total",
            afterNoonShiftClean: "Afternoon Shift Clean",
            afterNoonShiftDamaged: "Afternoon Shift Damaged",
            afterNoonShiftBlocked: "Afternoon Shift Blocked",
            afterNoonShiftLocked: "Afternoon Shift Locked",
            afterNoonShiftskipped: "Afternoon Shift skipped",
            afterNoonShiftmorningCost: "Afternoon Shift afternoonCost",
            eveningShiftTotal: "Evening Shift Total",
            eveningShiftClean: "Evening Shift Clean",
            eveningShiftDamaged: "Evening Shift Damaged",
            eveningShiftBlocked: "Evening Shift Blocked",
            eveningShiftLocked: "Evening Shift Locked",
            eveningShiftskipped: "Evening Shift skipped",
            eveningShiftmorningCost: "Evening Shift eveningCost",
          };
          exportFromJSON({ data, fileName, fields: fields, exportType });
        }
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
  }, [unitList, date, refresh]);
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
                  to={`/project/${projectName}/explore`}
                  target="_blank"
                  state={{ allProps: props }}
                >
                  <Button size="small" icon={<FullscreenOutlined />} />
                </Link>
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => {
                    downloadReport();
                  }}
                />
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
          <div style={{ marginTop: "8px", height: "inherit" }}>
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
                  setValue("Morning");
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
              <Select
                value={value}
                defaultValue={"Morning"}
                style={{ width: "10rem" }}
                onChange={(e) => {
                  setPieChartData([pieData[0][e]]);
                  setTotal(pieData[0][e].Total);
                  setValue(e);
                }}
              >
                <Select.Option value={"Morning"}>Morning</Select.Option>
                <Select.Option value={"Afternoon"}>Afternoon</Select.Option>
                <Select.Option value={"Evening"}>Evening</Select.Option>
              </Select>
            </div>
            <div style={{ height: "85%" }}>
              {!loading1 ? (
                <>
                  <ReveloPie
                    onClick={() => {}}
                    data={pieChartData}
                    valueFieldName={[
                      "Clean",
                      "Damaged",
                      "Blocked",
                      "Locked",
                      "skipped",
                    ]}
                    total={total}
                  />
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

export default WrapperNMC;
