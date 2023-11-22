import axios from "axios";
import { useLocation, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import ReveloPie from "../../Dashboard/Dashboard/Widgets/ReveloPie/ReveloPie";
import './report.css'
import IndividualReportMap from "./MapComponent";
import { useAppSelector } from "../../Redux/store/store";
import ReveloBarGraph from "../../Dashboard/Dashboard/Widgets/ReveloBarGraph/ReveloBarGraph";
import { Feature } from "ol";
import { fromLonLat } from "ol/proj";
import { Point } from "ol/geom";

const IndividualReport = (props: any) => {
  const serverUrl = window.__rDashboard__.serverUrl;

  const [reportData, setReportData] = useState<any>();
  const [reportValueFields, setReportValueFields] = useState<any[]>([]);
  const [reportOutput, setReportOutput] = useState<any[]>([]);
  const { project, userInfo, projectConceptModel } = useAppSelector((state) => state.reveloUserInfo);
  const [loading, setLoading] = useState(true);
  const { name } = useParams();
  const { projectName } = useParams();

  useEffect(() => {
    getIndividualReport();
  }, [name])

  const getIndividualReport = async () => {
    setLoading(true)
    const response = await axios.get(`${serverUrl}/surveys/${projectName}/reports/${name}`)
    console.log(response.data)
    setReportData(response.data)
    setReportValueFields(response.data.visualizations.widgetInfo.valueFieldName)
    if (response.status === 200) {
      getIndividualReportOutput();
    }
  }
  // useEffect(() => {
  //   getIndividualReportOutput();
  // }, [name])

  const getIndividualReportOutput = async () => {
    const payload: any[] = [];
    const getJtypeandJname = (): string[] => {
      if (props.jurisdiction === "All") {
        return [
          userInfo.userInfo.jurisdictions[0]?.name,
          userInfo.userInfo.jurisdictions[0]?.type,
        ];
      } else if (props.jurisdiction) {
        return [props.jurisdiction, "parliamentaryconstituencies"];
      } else {
        return [
          userInfo.userInfo.jurisdictions[0]?.name,
          userInfo.userInfo.jurisdictions[0]?.type,
        ];
      }
    };
    const output = await axios.get(`${serverUrl}/surveys/${projectName}/reports/${name}/output?jurisdictionName=${getJtypeandJname()[0]}&jurisdictionType=${getJtypeandJname()[1]}`)
    output.data.features?.forEach((outPut: any) => {
      payload.push(outPut.properties);
    });
    setReportOutput(payload)
    console.log(payload)
    setLoading(false);
  }

  return (
    <>
      <div>
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
            {reportValueFields.length > 0 ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'row', placeItems: 'center' }}>
                  <div className="main-wrapper">
                    <div className="graph-class">

                      {reportData?.visualizations.type === "pieChart" ? (
                        <>
                          <ReveloPie
                            data={reportOutput}
                            valueFieldName={
                              reportValueFields
                            }

                          />
                        </>
                      ) : (
                        <></>
                      )}
                      {reportData?.visualizations.type === "barGraph" ? (
                        <>
                          <ReveloBarGraph
                            data={reportOutput}
                            valueFieldName={
                              reportValueFields
                            }
                            xAxis={reportData.visualizations.widgetInfo.xAxis.labelFieldName}
                            yAxis={reportData.visualizations.widgetInfo.yAxis.labelFieldName}
                          />
                        </>
                      ) : (
                        <></>
                      )}
                    </div>
                  </div>
                  <div className="main-wrapper"><IndividualReportMap /></div>
                </div>
              
                <div style={{ height: '50vh', width: '100%', border: '1px solid rgb(183, 183, 183)', textAlign: 'center' }}> Table </div>
              </>
            ) : (
              <></>
            )}
          </>
        )}
      </div>
    </>
  )
}
export default IndividualReport;