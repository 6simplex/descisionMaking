import { fromLonLat } from "ol/proj";
import { useEffect, useRef, useState } from "react";
import { RFeature, RLayerVector, RMap, ROSM, RStyle } from "rlayers";
import { Point } from "ol/geom";
import axios from "axios";
import { useAppSelector } from "../../Redux/store/store";
import { Spin, Table, message } from "antd";
import ReveloBarGraph from "../../Dashboard/Dashboard/Widgets/ReveloBarGraph/ReveloBarGraph";
import ReveloPie from "../../Dashboard/Dashboard/Widgets/ReveloPie/ReveloPie";
import './report.css'
const center = fromLonLat([79.081993, 21.147913]);

const IndividualReportMap = (props: any) => {
  console.log(props)
  const [reportData, setReportData] = useState<any>();
  const [reportValueFields, setReportValueFields] = useState<any[]>([]);
  const [reportOutput, setReportOutput] = useState<any[]>([]);
  const [initialIds, setInitialIds] = useState();
  const [attrValue, setAttrValue] = useState<any>(null);
  const [attributes, setAttributes] = useState();
  const [loading, setLoading] = useState(true);
  const vectorRef = useRef<RLayerVector | any>(null);
  const mapRef = useRef<RMap>(null)
  const [features, setFeatures] = useState<any>();
  const [properties, setProperties] = useState<any>();
  const serverUrl = window.__rDashboard__.serverUrl;
  const allIds = useRef<any[]>([]);
  const { project, userInfo, projectConceptModel } = useAppSelector((state) => state.reveloUserInfo);
  const graphContainer = props.name === 'valuestatus' ? 'graph-table-wrapper' : 'graph-map-wrapper'
  const container = props.name === 'valuestatus' ? 'table-wrapper' : 'map-wrapper'

  const columns = [
    {
      title: 'Index',
      dataIndex: 'index',
      render: (text: any, record: any, index: number) => index + 1,
    },
    {
      title: 'Shift Type',
      dataIndex: 'shiftname',
      key: 'shiftname',
    },
    {
      title: 'Shift Date',
      dataIndex: 'shiftDate',
      key: 'shiftDate',
    },
    {
      title: 'Shift Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Block',
      dataIndex: 'blocksid',
      key: 'blocksid',
    },
    {
      title: 'Zone',
      dataIndex: 'zone',
      key: 'zone',
    },

  ];

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
    let protocol = userInfo.userInfo.customerInfo.outputStore.securityInfo.isSSLEnabled ? "https" : "http";
    let domain = `${userInfo.userInfo.customerInfo.outputStore.hostName}:${userInfo.userInfo.customerInfo.outputStore.portNumber}`;
    try {
      const reportOutPut = await axios.post(`${protocol}://${domain}/report_${project.name}_${props.name.toLocaleLowerCase()}/_search`, {
        size: 1000,
        "query": {
          "dis_max": {
            "queries": [
              { "match_phrase": { jurisdictionName: getJtypeandJname()[0] } }
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
      setReportOutput(payload);
      if (Array.isArray(payload) && payload.length > 0) {
        const metadataString = payload ? payload[0].metadata : ""
        const metadata = JSON.parse(metadataString);
        console.log(metadata.mainEntityIDs)
        getEntityData(metadata.mainEntityIDs)
      }
      setLoading(false);
    } catch (err) {
      console.log(err)
      setLoading(false);
    }
  }

  const getEntityData = async (attributes: any) => {
    console.log(attributes)
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
    console.log(attributes)
    await axios.post(`${serverUrl}/conceptmodels/${projectConceptModel.name}/entities/shift/query`,
      {
        query: {
          datasource: {
            targetArtifact: "original",
            // jurisdiction: jurisdiction,
            attributes: {
              shiftid: attributes
            }
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
        if (res.status === 200) {
          res.data?.features.forEach((el: any) => {
            const date = el.properties.shifttime
            const dateObject = new Date(date);
            const shiftDate = dateObject.toISOString().split('T')[0];
            payload.push({
              shiftname: el.properties.shiftname,
              status: el.properties.status,
              blocksid: el.properties.blocksid,
              shiftid: el.properties.shiftid,
              zone: el.properties.zone,
              shiftDate: shiftDate
            })
          })

          console.log(payload)
          setProperties(payload)
          allIds.current = payload
          setFeatures(res.data.features);
        }
        else{
          console.log('Retrying...');
          (async () => {
            await new Promise(resolve => setTimeout(resolve, 1000));
            await getEntityData(attributes); 
          })();
        }
        // if (res.status === 400) {
         
        // }

        setLoading(false)
      })
      .catch((err) => {
        console.log(err)

        setLoading(false)
      })
  }

  const getCategoryData = (data: any) => {
    console.log(data.data.indexValue)
    console.log(allIds.current)
    if (Array.isArray(allIds.current)) {
      const Objects = props.allFeatures.filter((item: any) => item.status === data.data.indexValue);
      const ObjectIds = Objects.map((item: any) => item.shiftid);
      console.log(ObjectIds)
      getEntityData(ObjectIds)
    }
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
          <div className={container}>
            <div className="graph-class-container">
              <div className={graphContainer} >
                <div className="graph-class">
                  {reportData?.visualizations.type === "pieChart" ? (
                    <>
                      <ReveloPie
                        onClick={(data: any) => { getCategoryData(data) }}
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
                        onClick={(data: any) => { getCategoryData(data) }}
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
                {props.name === "valuestatus" ? (null) : (
                  <>
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
                  </>)}
              </div>
            </div>

            <div style={{
              // height: '50vh', 
              width: '100%',
              border: '1px solid rgb(183, 183, 183)',
              textAlign: 'center',
              // height: "80vh",
              // overflowY: "auto"

            }}>
              <Table
                columns={columns}
                // rowSelection={{
                //   type: 'checkbox',
                //   // onChange: handleRowSelection,
                //   // selectedRowKeys: selectedUsers,
                // }}
                dataSource={properties}
                scroll={{ y: 730 }}
                pagination={false}
              />
            </div>
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