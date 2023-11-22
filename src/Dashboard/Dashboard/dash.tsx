/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import Wrapper from "./Widgets/Wrapper";
import { Button, Divider, Spin, message } from "antd";
import { useAppSelector } from "../../Redux/store/store";
import { fetchData, getCurrentDateDDMMYYYY } from "../../utils/cutsomhooks";
import { DownloadOutlined, RedoOutlined } from "@ant-design/icons";
import { usePDF, Resolution } from "react-to-pdf";
interface DashboardProps {
  selectedvalue: any; 
}

const DashBoard :React.FC<DashboardProps> = ({ selectedvalue })=> {
  console.log(selectedvalue)
  const { toPDF, targetRef } = usePDF({
    filename: `report_${getCurrentDateDDMMYYYY()}.pdf`, resolution: Resolution.NORMAL, page: { orientation: "landscape", },
    method: "open"
  });
  const { project } = useAppSelector(
    (state) => state.reveloUserInfo
  );
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
  

  return (
    <>

      <div
        ref={targetRef}
        className="main-dashBoard-wrapper"
      >
        <div className="date-wrapper">     
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
              {getAllReport?.map((report: any, index) => {
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
                          jurisdiction={selectedvalue}
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
