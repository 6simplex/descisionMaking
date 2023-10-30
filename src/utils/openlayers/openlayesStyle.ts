/* eslint-disable @typescript-eslint/no-explicit-any */

import { Style, Text, Fill, Stroke, Icon } from "ol/style";
import CircleStyle from "ol/style/Circle";
import { getStopSvgwithText, getStopSvgwithTextGreen } from "../map";
import { ProjectConceptModel } from "../../revelo-Interface/conceptmodel";
import { Datasource, Project } from "../../revelo-Interface/common";
import { fetchData } from "../cutsomhooks";
import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON";

import axios from "axios";

export function olStyle(
  textSvg: string,
  IsSVGicon: boolean,
  textlabel: string,
  textYOffset: number,
  textFill: string,
  textStroke: string,
  circleFill: string,
  circleRadius: number,
  circleRotation: number,
  circleRotateWithView: boolean,
  circleStroke: string,
  olStyleStrokeColor: string,
  olStyleStrokeWidth: number,
  zIndex: number
): Style {
  const textStyle = new Text({
    font: "13px Calibri",
    text: textlabel,
    textAlign: "center",
    justify: "center",
    textBaseline: "alphabetic",
    maxAngle: 360.0,
    offsetX: 0,
    offsetY: textYOffset,
    rotation: 0,
    padding: [20, 20, 20, 20],
    fill: new Fill({
      color: textFill,
    }),
    stroke: new Stroke({
      color: textStroke,
      width: 1,
    }),
  });
  const circleStyle = new CircleStyle({
    fill: new Fill({
      color: circleFill,
    }),
    stroke: new Stroke({
      color: circleStroke,
      width: 1,
    }),
    radius: circleRadius,
    rotation: circleRotation,
    rotateWithView: circleRotateWithView,
  });
  const olStyleStroke = new Stroke({
    color: olStyleStrokeColor,
    width: olStyleStrokeWidth,
  });
  const icon = new Icon({
    src: "data:image/svg+xml;utf8," + getStopSvgwithText(textSvg),
    size: [30, 30],
  });
  return new Style({
    stroke: olStyleStroke,
    image: IsSVGicon ? icon : circleStyle,

    text: textStyle,
    zIndex: zIndex,
  });
}
export function olStyleGreen(
  textSvg: string,
  IsSVGicon: boolean,
  textlabel: string,
  textYOffset: number,
  textFill: string,
  textStroke: string,
  circleFill: string,
  circleRadius: number,
  circleRotation: number,
  circleRotateWithView: boolean,
  circleStroke: string,
  olStyleStrokeColor: string,
  olStyleStrokeWidth: number,
  zIndex: number
): Style {
  const textStyle = new Text({
    font: "13px Calibri",
    text: textlabel,
    textAlign: "center",
    justify: "center",
    textBaseline: "alphabetic",
    maxAngle: 360.0,
    offsetX: 0,
    offsetY: textYOffset,
    rotation: 0,
    padding: [20, 20, 20, 20],
    fill: new Fill({
      color: textFill,
    }),
    stroke: new Stroke({
      color: textStroke,
      width: 1,
    }),
  });
  const circleStyle = new CircleStyle({
    fill: new Fill({
      color: circleFill,
    }),
    stroke: new Stroke({
      color: circleStroke,
      width: 1,
    }),
    radius: circleRadius,
    rotation: circleRotation,
    rotateWithView: circleRotateWithView,
  });
  const olStyleStroke = new Stroke({
    color: olStyleStrokeColor,
    width: olStyleStrokeWidth,
  });
  const icon = new Icon({
    src: "data:image/svg+xml;utf8," + getStopSvgwithTextGreen(textSvg),
    size: [30, 30],
  });
  return new Style({
    stroke: olStyleStroke,
    image: IsSVGicon ? icon : circleStyle,
    text: textStyle,
    zIndex: zIndex,
  });
}

export function spatialLayerStyle(
  entity: any,
  feature: any,
  properties: any,
  zoomlevel?: any
): Style {
  let circleStyle1;
  let label: any;
  if (entity.geometryType === "Point" || entity.geometryType === "point") {
    circleStyle1 = new CircleStyle({
      fill: new Fill({
        color:
          entity.layerStyles.renderers.uniqueValue.style.mapping.remainingValues
            .fill.color,
      }),
      stroke: new Stroke({
        color:
          entity.layerStyles.renderers.uniqueValue.style.mapping.remainingValues
            .stroke.color,
        width:
          entity.layerStyles.renderers.uniqueValue.style.mapping.remainingValues
            .stroke.width,
      }),
      radius:
        entity.layerStyles.renderers.uniqueValue.style.mapping.remainingValues
          .radius,
    });
  }
  if (zoomlevel) {
    const maxzoom = entity.layerStyles.textStyle.style.maxZoom;
    const minzoom = entity.layerStyles.textStyle.style.minZoom;
    if (zoomlevel < maxzoom && zoomlevel > minzoom) {
      label = feature.get(properties.labelPropertyName);
    } else {
      label = "";
    }
    return new Style({
      image: circleStyle1,
      stroke: new Stroke({
        color:
          entity.layerStyles.renderers.uniqueValue.style.mapping.remainingValues
            .stroke.color,
        width:
          entity.layerStyles.renderers.uniqueValue.style.mapping.remainingValues
            .stroke.width,
      }),
      fill: new Fill({
        color:
          entity.layerStyles.renderers.uniqueValue.style.mapping.remainingValues
            .fill.color,
      }),

      text: new Text({
        text: label,
        font: entity.layerStyles.textStyle.style.font,
        textAlign:
          entity.layerStyles.textStyle.style.textAlign.toLocaleLowerCase(),
        textBaseline:
          entity.layerStyles.textStyle.style.textBaseline.toLocaleLowerCase(),
        offsetX: entity.layerStyles.textStyle.style.offsetX,
        offsetY: entity.layerStyles.textStyle.style.offsetY,
        rotation: entity.layerStyles.textStyle.style.rotation,
        placement: entity.layerStyles.textStyle.style.placement,
        maxAngle: entity.layerStyles.textStyle.style.maxAngle,
        overflow: entity.layerStyles.textStyle.style.overflow,
      }),
    });
  } else {
    return new Style({
      image: circleStyle1,
      stroke: new Stroke({
        color:
          entity.layerStyles.renderers.uniqueValue.style.mapping.remainingValues
            .stroke.color,
        width:
          entity.layerStyles.renderers.uniqueValue.style.mapping.remainingValues
            .stroke.width,
      }),
      fill: new Fill({
        color:
          entity.layerStyles.renderers.uniqueValue.style.mapping.remainingValues
            .fill.color,
      }),

      text: new Text({
        text: feature.get(properties.labelPropertyName),
        font: entity.layerStyles.textStyle.style.font,
        textAlign:
          entity.layerStyles.textStyle.style.textAlign.toLocaleLowerCase(),
        textBaseline:
          entity.layerStyles.textStyle.style.textBaseline.toLocaleLowerCase(),
        offsetX: entity.layerStyles.textStyle.style.offsetX,
        offsetY: entity.layerStyles.textStyle.style.offsetY,
        rotation: entity.layerStyles.textStyle.style.rotation,
        placement: entity.layerStyles.textStyle.style.placement,
        maxAngle: entity.layerStyles.textStyle.style.maxAngle,
        overflow: entity.layerStyles.textStyle.style.overflow,
      }),
    });
  }
}
export function formattedDate(timestamp: string): string {
  const date = new Date(timestamp);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const ampm = date.getHours() < 12 ? "am" : "pm";
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = date.getHours() % 12 || 12; // Convert to 12-hour format
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${day} ${month} ${year} at ${hours}:${minutes}:${seconds} ${ampm}`;
}
export function createEntitySpatailLayer(
  projectConceptModel: ProjectConceptModel,
  asEntity: any,
  project: Project,
  dataSource: Datasource
): any[] {
  const payloadVector: any = [];
  projectConceptModel.entities.forEach(async (entity) => {
    if (
      entity.name !== `trips_${project.name}` &&
      entity.name !== `tripstops_${project.name}` &&
      entity.name !== `tripmetrics_${project.name}`
    ) {
      if (entity.type === "spatial") {
        const url = `${projectConceptModel.gisServerUrl}/wfs?service=WFS&version=1.1.0&request=GetFeature&typename=${projectConceptModel.datasourceName}ws:${entity.name}&outputFormat=application/json&srsname=EPSG:${dataSource.properties.wkid}`;
        const data = await fetchData(url);
        const geojsonFormat = new GeoJSON();
        const geojsonObject = geojsonFormat.readFeatures(data, {
          featureProjection: `EPSG:${dataSource.properties.wkid}`,
        });
        const vectorSource = new VectorSource({
          features: geojsonObject,
        });
        Object.keys(asEntity).forEach((key) => {
          if (`${key}_${project.name}` === entity.name) {
            const vectorLayer = new VectorLayer({
              source: vectorSource,
            });
            vectorLayer.getSource()?.forEachFeature((featture) => {
              let circleStyle1;
              if (asEntity[key].layerStyles.renderers.heatmap) {
                circleStyle1 = new CircleStyle({
                  fill: new Fill({
                    color:
                      asEntity[key].layerStyles.renderers.simple.style.fill
                        .color,
                  }),
                  stroke: new Stroke({
                    color:
                      asEntity[key].layerStyles.renderers.simple.style.stroke
                        .color,
                    width:
                      asEntity[key].layerStyles.renderers.simple.style.stroke
                        .width,
                  }),
                  radius:
                    asEntity[key].layerStyles.renderers.simple.style.radius,
                });
              }
              const s1 = new Style({
                image: circleStyle1,
                stroke: new Stroke({
                  color: asEntity[key].layerStyles.textStyle.style.stroke.color,
                  width: 2,
                }),
                fill: new Fill({
                  color: asEntity[key].layerStyles.textStyle.style.fill.color,
                }),
                text: new Text({
                  text: featture.get(entity.labelPropertyName),
                  font: asEntity[key].layerStyles.textStyle.style.font,
                  textAlign:
                    asEntity[
                      key
                    ].layerStyles.textStyle.style.textAlign.toLocaleLowerCase(),
                  textBaseline:
                    asEntity[
                      key
                    ].layerStyles.textStyle.style.textBaseline.toLocaleLowerCase(),
                  offsetX: asEntity[key].layerStyles.textStyle.style.offsetX,
                  offsetY: asEntity[key].layerStyles.textStyle.style.offsetY,
                  rotation: asEntity[key].layerStyles.textStyle.style.rotation,
                  placement:
                    asEntity[key].layerStyles.textStyle.style.placement,
                  maxAngle: asEntity[key].layerStyles.textStyle.style.maxAngle,
                  overflow: asEntity[key].layerStyles.textStyle.style.overflow,
                }),
              });

              featture.setStyle(s1);
            });
            payloadVector.push(vectorLayer);
          }
        });
      }
    }
  });
  return payloadVector;
}
export function getAllStopOfUserAndPointLayer(
  project: Project,
  tripsArray: any[],
  layers: any
) {
  const urls: any = [];
  const trackDuplicates: any = [];

  tripsArray.forEach((trip) => {
    if (!trackDuplicates.includes(trip["Trip Id"])) {
      const data = {
        url: `/conceptmodels/${project.conceptModelName}/entities/tripstops/query`,
        data: {
          query: {
            datasource: {
              targetArtifact: "original",
              attributes: {
                tripid: trip["Trip Id"],
              },
            },
          },
          resultOptions: {
            outputWKID: -1,
            returnIdsOnly: false,
            returnGeometry: false,
          },
        },
      };
      urls.push(data);
      trackDuplicates.push(trip["Trip Id"]);
    }
  });

  return new Promise((resolve) => {
    makeParallelRequests(urls, "POST")
      .then((responseArray) => {
        makeParallelRequests(layers, "GET")
          .then((res) => {
            resolve([
              {
                stops: responseArray,
                layer: res,
              },
            ]);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((error) => {
        console.error("Error making parallel requests:", error);
      });
  });
}
const makeParallelRequests = (urls: any, type: string) => {
  const stopsInfoWithCoords: any = [];
  let requests;
  if (type === "GET") {
    const payload: any = [];
    urls.forEach((url: any) => {
      const url4326: string = url.url;
      const newUrl = url4326.slice(0, -4) + "4326";
      payload.push(newUrl);
    });
    requests = payload.map((url: any) => axios.get(url));
  } else {
    requests = urls.map((url: any) => axios.post(url.url, url.data));
  }
  if (type === "GET") {
    return Promise.all(requests)
      .then((responseArray) => {
        responseArray.forEach((response: any) => {
          response.data.features.forEach((feature: any) => {
            if (feature.geometry.type === "Point") {
              stopsInfoWithCoords.push(feature);
            }
          });
        });
        return stopsInfoWithCoords;
      })
      .catch((error) => {
        console.error("Error making parallel requests:", error);
      });
  } else {
    return Promise.all(requests)
      .then((responseArray) => {
        responseArray.forEach((response: any) => {
          response.data.features.forEach((element: any) => {
            stopsInfoWithCoords.push({
              tripstopid: element.properties.tripstopid,
              geometry: element.geometry,
            });
          });
        });

        return stopsInfoWithCoords; // Return the data to be accessed outside.
      })
      .catch((error) => {
        console.error("Error making parallel requests:", error);
      });
  }
};
