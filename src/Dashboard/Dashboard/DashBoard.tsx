/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Wrapper from "./Widgets/Wrapper";
import { Button, DatePicker, Divider, Select, Space, Spin, message } from "antd";
import "./DashBoard.css";
import { useAppSelector } from "../../Redux/store/store";
import { fetchData, getCurrentDateDDMMYYYY } from "../../utils/cutsomhooks";
import { DownloadOutlined, RedoOutlined } from "@ant-design/icons";
import { usePDF, Resolution } from "react-to-pdf";

const DashBoard = () => {
  const { toPDF, targetRef } = usePDF({
    filename: `report_${getCurrentDateDDMMYYYY()}.pdf`, resolution: Resolution.NORMAL, page: { orientation: "landscape", },
    method: "open"
  });
  const { project } = useAppSelector(
    (state) => state.reveloUserInfo
  );
  const [jurisdiction, setJurisdiction] = useState()
  const [applyFilter, setApplyFilter] = useState()
  const [getAllReport, setGetAllReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const getAllReportOut = async () => {
    setLoading(true);
    const reports = await fetchData(
      `${window.__rDashboard__.serverUrl}/surveys/${project.name}/reports`
    );
    if (reports.error) {
      return message.error("Something went Wrong");
    }
    setGetAllReport(reports);
    setLoading(false);
  };
  useEffect(() => {
    getAllReportOut();
  }, []);
  let combine: React.CSSProperties = {
    display: "flex",
    marginRight: "0.5rem",
    flexDirection: "column",
    placeContent: "center",
    placeItems: "center",
  }
  return (
    <>

      <div
        ref={targetRef}
        className="main-dashBoard-wrapper"
      >
        <div className="date-wrapper">

          <div className="start-date-wrapper">
            <div style={combine}>
              <p>Country</p>
              <Select disabled style={{ width: "150px" }} defaultValue={"India"} value={"India"}>
                <Select.Option value="India">India</Select.Option>
              </Select>
            </div>
            <div style={combine}>
              <p>State</p>
              <Select disabled style={{ width: "150px" }} defaultValue={"Mahrashtra"} value={"Mahrashtra"}>
                <Select.Option value="Mahrashtra">Mahrashtra</Select.Option>
              </Select>
            </div>
            <div style={combine}>
              <p>Parliamentary</p>
              <Select defaultValue={"All"} style={{ width: "150px" }} onSelect={(e: any) => { setApplyFilter(e) }} value={applyFilter === undefined ? "All" : applyFilter}  >
                <Select.Option value="Nagpur">Nagpur</Select.Option>
                <Select.Option value="Ramtek">Ramtek</Select.Option>
                <Select.Option value="All">All</Select.Option>
              </Select>
            </div>
          </div>
          {/* <div className="start-date-wrapper">
            <DatePicker
              key={"From Date"}
              placeholder="From Date"
              size="large"
              style={{ width: "49%" }}
            />
            <DatePicker
              key={"To Date"}
              placeholder="To Date"
              size="large"
              style={{ width: "49%" }}
            />
          </div>
          <div className="button-wrapper">
            <Space>
              <Button type="primary" size="large">
                Apply Filters
              </Button>
              <Button type="link" size="large">
                Reset
              </Button>
              <Button onClick={() => { getAllReportOut() }}>Refresh</Button>
            </Space>
          </div> */}
          <div className="button-wrapper">
            <Space>
              <Button type="primary" size="large" onClick={() => { setJurisdiction(applyFilter) }}>
                Apply Filters
              </Button>
              <Button type="link" size="large" onClick={() => { setJurisdiction(undefined); setApplyFilter(undefined) }}>
                Reset
              </Button>

            </Space>
          </div>
          <div className="button-refresh">
            <Button type="primary" style={{ marginRight: "5px" }} onClick={() => {
              toPDF()
            }} icon={<DownloadOutlined />} />
            <Button type="primary" onClick={() => { getAllReportOut() }} icon={<RedoOutlined />} />
          </div>
        </div>
        <Divider style={{ margin: "10px 0", width: "110" }} />
        {loading ? (
          <>
            <Spin tip="Loading..." />
          </>
        ) : (
          <>
            <div className="chart-container">
              {getAllReport.map((report: any, index) => {
                return (
                  <>
                    {Object.keys(report.visualizations).length === 0 ? (
                      <></>
                    ) : (
                      <>
                        <Wrapper
                          key={index}
                          name={report.name}
                          label={report.label}
                          jurisdiction={jurisdiction}
                          noOfRows={
                            report.visualizations?.rows?.length
                              ? report.visualizations?.rows
                              : []
                          }
                          outFields={report.visualizations}
                        />
                      </>
                    )}
                  </>
                );
              })}
            </div>
          </>
        )}
      </div>

    </>
  );
};

export default DashBoard;
