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

const WrapperNMCEvening = (props: Props) => {
  const [total, setTotal] = useState(0);
  const [none, setNone] = useState(false);
  const [value, setValue] = useState<any[]>([]);
  const { projectName } = useParams();
  const { userInfo } = useAppSelector((state) => state.reveloUserInfo);
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

  const getReports = async () => {
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
        setNone(true);
        setValue([]);
        setTotal(0);
        setLoading1(false);
      } else {
        reportOutPut.data.hits.hits.forEach((outPut: any) => {
          payload.push(outPut._source.shiftInfo);
        });
        let Total = 0;
        let Clean = 0;
        let Damaged = 0;
        let Blocked = 0;
        let Locked = 0;
        let skipped = 0;

        payload.forEach((element: any) => {
          Total = Total + element.Evening.Total;
          Clean = Clean + element.Evening.Clean;
          Damaged = Damaged + element.Evening.Damaged;
          Blocked = Blocked + element.Evening.Blocked;
          Locked = Locked + element.Evening.Locked;
          skipped = skipped + element.Evening.skipped;
        });
        console.log({
          Clean: Clean,
          Damaged: Damaged,
          Blocked: Blocked,
          Locked: Locked,
          skipped: skipped,
        });
        setNone(false);
        setValue([
          {
            Clean: Clean,
            Damaged: Damaged,
            Blocked: Blocked,
            Locked: Locked,
            skipped: skipped,
          },
        ]);

        setTotal(total);
        setLoading1(false);
      }
    } catch (err) {
      console.log(err);

      setLoading1(false);
    }
  };
  useEffect(() => {
    getReports();
  }, [date, props.jurisdiction]);

  return (
    <div className="main-wrapper">
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
      <div style={{ marginTop: "8px", height: "inherit" }}>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            placeContent: "center",
            placeItems: "center",
          }}
        >
          <DatePicker
            allowClear={false}
            disabledDate={(current) => {
              const currentDate = dayjs();
              return current && current.isAfter(currentDate, "day");
            }}
            defaultValue={dayjs()}
            showToday
            onChange={(date, dateString) => {
              setDate(new Date(dateString).toISOString().split("T")[0]);
            }}
          />
        </div>
        <div style={{ height: "85%" }}>
          {!loading1 ? (
            <>
              {none ? (
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
                  <>
                    <ReveloPie
                      onClick={() => {}}
                      data={value}
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
                </>
              )}
            </>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default WrapperNMCEvening;
