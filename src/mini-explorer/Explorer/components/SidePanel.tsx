import axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { useAppSelector } from '../../../Redux/store/store'
import { Checkbox, List, Typography } from 'antd';
import { fromLonLat } from "ol/proj";
import "ol/ol.css";
import { RFeature, RLayerVector, RMap, ROSM, } from "rlayers";
import { MultiPolygon } from 'ol/geom';
import { Fill, Stroke, Style, Text } from 'ol/style';
import VectorLayer from 'ol/layer/Vector';

const center = fromLonLat([79.088860, 21.146633]);
type Props = {
    unit: any;
}
export const SidePanel = (props: Props) => {
    const { projectConceptModel } = useAppSelector(state => state.reveloUserInfo)
    const [indexes, setIndexes] = useState("")
    const [blocks, setBlocks] = useState([])
    const [bill, setBill] = useState([])
    const [loading, setLoading] = useState(true)
    const [l1, setL1] = useState(false)
    const unitVecRef = useRef<any>(null)
    const getBlocks = async (id: any) => {
        await axios.get(`${window.__rDashboard__.serverUrl}/conceptmodels/${projectConceptModel.name}/entities/blocks/query?unitid=${id}`).then(((res) => {
            if (res.status === 200) {
                setBlocks(res.data.features)
                setLoading(false)
            }

        })).catch(((err) => {
            console.log(err)
            setLoading(false)

        }))
    }
    const getBilling = async (id: any) => {
        setL1(true)
        await axios.get(`${window.__rDashboard__.serverUrl}/conceptmodels/${projectConceptModel.name}/entities/billing/query?vendorid=${id}`).then(((res) => {
            if (res.status === 200) {
                console.log(res.data)
                setBill(res.data.features)
                setL1(false)
            }

        })).catch(((err) => {
            console.log(err)
            setL1(false)

        }))
    }

    return (<>
        <div style={{ display: "flex", flexDirection: "row", placeContent: "flex-start", placeItems: "flex-start", minHeight: "50%" }}>
            <List
                style={{ width: "50%", height: "100%", overflowY: "auto", }}
                header={<div style={{ fontSize: "100%", fontWeight: "bolder" }}>Unit ({props.unit.features.length})</div>}
                bordered
                dataSource={props.unit.features}
                renderItem={(item: any, index) => (

                    <List.Item style={{ display: "flex", flexDirection: "row", placeItems: "center", placeContent: "flex-start" }}>
                        <Checkbox style={{ marginRight: "20%" }} checked={indexes === item.properties.unitname} value={indexes} onChange={(e) => {
                            setIndexes(item.properties.unitname);
                            getBlocks(item.properties.unitid)
                            getBilling(item.properties.vendorid)
                            unitVecRef.current.context.map.getLayers().getArray().forEach((layer: any) => {
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
                            })


                        }} />
                        <Typography.Text >{item.properties.unitname}</Typography.Text>
                    </List.Item>
                )}
            />
            <List
                style={{ width: "50%", overflowY: "auto", height: "100%" }}
                header={<div style={{ fontSize: "100%", fontWeight: "bolder", }}>Blocks ({blocks.length})</div>}
                bordered
                dataSource={blocks}
                renderItem={(item: any, index) => {
                    return (

                        <List.Item style={{ display: "flex", flexDirection: "row", placeItems: "center", placeContent: "flex-start" }}>

                            <Typography.Text >{item.properties.blocknumber}</Typography.Text>
                        </List.Item>
                    )
                }}
            />
        </div >
        <div style={{ minHeight: "50%", display: "grid", gridTemplateRows: "30% 70%" }}>
            {bill.length === 0 ? <>
                <div style={{ height: "100%", display: "flex", flexDirection: "column", placeContent: "center", placeItems: "center", paddingBottom: "2px", border: "1px solid #d9d9d9" }}>
                    No data to display
                </div>
            </> : <>
                {bill.map((bill: any) => {
                    return (<>
                        <div style={{ height: "100%", display: "grid", gridTemplateColumns: "25% 25% 25% 25%", paddingBottom: "2px" }}>
                            <div style={{ display: "flex", flexDirection: "column", placeContent: "center", placeItems: "center", height: "inherit", border: "1px solid #d9d9d9" }}>
                                <Typography style={{ fontWeight: "bold" }}>Vendor Name</Typography>
                                <Typography style={{ fontSize: "2rem" }}>{bill.properties.vendorname}</Typography>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", placeContent: "center", placeItems: "center", height: "inherit", border: "1px solid #d9d9d9" }}>
                                <Typography style={{ fontWeight: "bold" }}>Amount</Typography>
                                <Typography style={{ fontSize: "2rem" }}>{bill.properties.amount}</Typography>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", placeContent: "center", placeItems: "center", height: "inherit", border: "1px solid #d9d9d9" }}>
                                <Typography style={{ fontWeight: "bold" }}>Total Shifts</Typography>
                                <Typography style={{ fontSize: "2rem" }}>{bill.properties.numshift}</Typography>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", placeContent: "center", placeItems: "center", height: "inherit", border: "1px solid #d9d9d9" }}>
                                <Typography style={{ fontWeight: "bold" }}>Shifts Skipped</Typography>
                                <Typography style={{ fontSize: "2rem" }}>{bill.properties.numshiftskipped}</Typography>
                            </div>

                        </div>
                    </>)
                })}
            </>}


            <div style={{ height: "100%", border: "1px solid #d9d9d9" }}>
                <RMap width={"100%"} height={"inherit"} initial={{ center: center, zoom: 11 }}>
                    <ROSM />
                    <RLayerVector
                        ref={unitVecRef}
                        zIndex={10}
                        properties={{ name: "unit" }}


                    >
                        {props.unit.features.map((f: any) => {


                            return (<>

                                <RFeature properties={f.properties} style={new Style(
                                    {
                                        fill: new Fill({
                                            color: 'rgba(255, 0, 0, 0.5)'

                                        }),
                                        stroke: new Stroke({
                                            width: 2
                                        }),
                                        text: new Text({
                                            font: "15px sens-sarif",
                                            text: f.properties.unitname,

                                            fill: new Fill({
                                                color: "white"
                                            })
                                        })
                                    }
                                )} geometry={new MultiPolygon(f.geometry.coordinates)}>

                                </RFeature>
                            </>)
                        })}



                    </RLayerVector>
                </RMap>
            </div>
        </div>
    </>
    )
}
