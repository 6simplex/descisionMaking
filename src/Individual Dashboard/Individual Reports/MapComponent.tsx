import { fromLonLat } from "ol/proj";
import { useEffect, useRef, useState } from "react";
import { RFeature, RLayerVector, RMap, ROSM, RStyle } from "rlayers";
import { Feature } from "ol";
import { Point } from "ol/geom";
import axios from "axios";
import { useAppSelector } from "../../Redux/store/store";
import { formattedDate, olStyle } from "../../utils/openlayers/openlayesStyle";
const center = fromLonLat([79.081993, 21.147913]);

const IndividualReportMap = () => {
  const [pos, setPos] = useState(new Point(fromLonLat([79.081993, 21.147913])));
  const vectorRef = useRef<RLayerVector | any>(null);
  const mapRef = useRef<RMap>(null)
  const [features, setFeatures] = useState<any>();
  const serverUrl = window.__rDashboard__.serverUrl;
  const { project, userInfo, projectConceptModel } = useAppSelector((state) => state.reveloUserInfo);
  useEffect(() => {
    getEntityData();
  }, [])

  const getEntityData = async () => {

    const res = await axios.get(`${serverUrl}/conceptmodels/${projectConceptModel.name}/entities/member/data?format=geojson&source=remote&targetArtifact=original`)
    let allFeatures: any = [];
    setFeatures(res.data.features);
    // res.data.features.forEach((el: any, index: any) => {

    //   let feature = ({
    //     geometry: el.geometry.coordinates,
    //     id: el.id,
    //   });
    //   // feature.setId(`${index + 1}`);
    //   // feature.setStyle(
    //   //   olStyle(index + 1, true, "", 12, "red", "red", "red", 6, 0, false, "red", "", 0, 999)

    //   // );
    //   // allFeatures.push(feature);
      
    // });
  }
  return (<>
    <RMap width={"100%"} height={"100%"} initial={{ center: center, zoom: 13 }} >
      <ROSM />
      <RLayerVector  zIndex={10} >
      <RStyle.RStyle>
                  <RStyle.RCircle radius={5}>
                    <RStyle.RFill color="blue" />
                  </RStyle.RCircle>
                </RStyle.RStyle>
                {/* <RFeature geometry={pos}></RFeature> */}
        {features && features?.map((feature: any) => {
          console.log(feature)
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
  </>)
}
export default IndividualReportMap;