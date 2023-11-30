import { fromLonLat } from "ol/proj";
import { useEffect, useRef, useState } from "react";
import { RFeature, RLayerVector, RMap, ROSM, RStyle } from "rlayers";
import { Point } from "ol/geom";
import axios from "axios";
import { useAppSelector } from "../../Redux/store/store";
import { Spin, Table } from "antd";
import ReveloBarGraph from "../../Dashboard/Dashboard/Widgets/ReveloBarGraph/ReveloBarGraph";
import ReveloPie from "../../Dashboard/Dashboard/Widgets/ReveloPie/ReveloPie";
import './report.css'
const center = fromLonLat([79.081993, 21.147913]);

const IndividualReportMap = (props: any) => {
  const [reportData, setReportData] = useState<any>();
  const [reportValueFields, setReportValueFields] = useState<any[]>([]);
  const [reportOutput, setReportOutput] = useState<any[]>([]);
  const [attrValue, setAttrValue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const vectorRef = useRef<RLayerVector | any>(null);
  const mapRef = useRef<RMap>(null)
  const [features, setFeatures] = useState<any>();
  const [properties, setProperties] = useState<any>();
  const serverUrl = window.__rDashboard__.serverUrl;
  const { project, userInfo, projectConceptModel } = useAppSelector((state) => state.reveloUserInfo);


  const columns = [
    {
      title: '',
      key: 'select',
    },
    {
      title: 'FirstName',
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: 'LastName',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Age',
      dataIndex: 'age',
      key: 'age',
    },

  ];


  useEffect(() => {
    // if(props.attributeValues?.indexValue){
    //   getEntityData();
    // }
    getEntityData();
  }, [props.jurisdiction])


  const getEntityData = async () => {
    setLoading(true)
    let payload: any[] = [];
    let jurisdictionType = props.jurisdiction?.type;
    let jurisdictionName = props.jurisdiction?.name;
    const jurisdiction: any = {};
    if (jurisdictionType && jurisdictionName) {
      jurisdiction[jurisdictionType] = jurisdictionName;
    } else {
      jurisdiction.country = "India";
    }
    await axios.post(`${serverUrl}/conceptmodels/${projectConceptModel.name}/entities/member/query`,
      {
        query: {
          datasource: {
            targetArtifact: "original",
            jurisdiction: jurisdiction
            // attributes: {
            //   agegroupunder: "15–64 years"
            // }
          }
        },
        resultOptions: {
          outputWKID: -1,
          returnIdsOnly: false,
          returnGeometry: false
        }
      })
      .then((res) => {
        console.log(res.data)
        res.data?.features.forEach((el: any) => {
          payload.push({
            firstName: el.properties.firstname,
            lastName: el.properties.lastname
          })
        })
        console.log(payload)
        setProperties(payload)
        setFeatures(res.data.features);
        setLoading(false)
      })
      .catch((err) => {
        console.log(err)
        setLoading(false)
      })
  }

  useEffect(() => {
    getIndividualReport();
    console.log(reportData)
  }, [props.name])

  const getIndividualReport = async () => {
    setLoading(true)
    await axios.get(`${serverUrl}/surveys/${props.projectName}/reports/${props.name}`)
      .then((response) => {
        setReportData(response.data)
        setReportValueFields(response.data.visualizations.widgetInfo.valueFieldName)
        setLoading(false)
      })
      .catch((err) => {
        console.log(err)
      })
    // if (response.status === 200) {
    //   getIndividualReportOutput();
    // }
  }
  useEffect(() => {
    getIndividualReportOutput();
  }, [props.jurisdiction, props.name])

  const getIndividualReportOutput = async () => {
    setLoading(true)
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
    const output = await axios.get(`${serverUrl}/surveys/${props.projectName}/reports/${props.name}/output?jurisdictionName=${getJtypeandJname()[0]}&jurisdictionType=${getJtypeandJname()[1]}`)
    output.data.features?.forEach((outPut: any) => {
      payload.push(outPut.properties);
    });
    setReportOutput(payload)
    setLoading(false);
  }
  return (<>
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
    ) : (<>
      {reportValueFields.length > 0 ? (
        <>
          <div className="graph-map-wrapper" >
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
                    onClick={(data: any) => { console.log(data) }}
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
            <RMap width={"100%"} height={"100%"} initial={{ center: center, zoom: 10 }} ref={mapRef}>
              <ROSM />
              <RLayerVector zIndex={10} ref={vectorRef} >
                <RStyle.RStyle>
                  <RStyle.RCircle radius={5}>
                    <RStyle.RFill color="blue" />
                  </RStyle.RCircle>
                </RStyle.RStyle>
                {features && features?.map((feature: any) => {
                  return (
                    <>
                      <RFeature
                        geometry={
                          new Point(feature.geometry.coordinates)
                        }
                      >
                      </RFeature>
                    </>
                  );
                })}
              </RLayerVector>
            </RMap>
          </div>
          <div style={{ height: '50vh', width: '100%', border: '1px solid rgb(183, 183, 183)', textAlign: 'center' }}>
            <Table
              columns={columns}
              rowSelection={{
                type: 'checkbox',
                // onChange: handleRowSelection,
                // selectedRowKeys: selectedUsers,
              }}
              dataSource={properties}
              scroll={{ y: 240 }}
              pagination={false}
            />
          </div>
        </>
      ) : (
        <></>
      )}
    </>
    )}


  </>)
}


export default IndividualReportMap;