import {
  Button,
  DatePicker,
  Divider,
  Select,
  Space,
  Spin,
  Typography,
  message,
} from "antd";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../Redux/store/store";
import cytoscape, { EdgeDefinition, NodeDefinition } from "cytoscape";
import "./ExplorerContent2.css";
import { getCurrentDateDDMMYYYY, todayDate } from "../../utils/cutsomhooks";
import { DownloadOutlined, RedoOutlined } from "@ant-design/icons";
import { usePDF, Resolution } from "react-to-pdf";
import { SidePanel2 } from "./components2/SidePanel2";
import axios from "axios";
import dayjs from "dayjs";
import localeData from "dayjs/plugin/localeData";
import weekday from "dayjs/plugin/weekday";
import exportFromJSON from "export-from-json";
dayjs.extend(weekday);
dayjs.extend(localeData);

const ExplorerContent2 = () => {
  const [downloadjson, setDownloadJson] = useState<any>([]);
  const [date, setDate] = useState<any>(todayDate());
  const [unitGeojson, setUnitGeojson] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toPDF, targetRef } = usePDF({
    filename: `report_${getCurrentDateDDMMYYYY()}.pdf`,
    resolution: Resolution.NORMAL,
    page: { orientation: "landscape" },
    method: "open",
  });
  //start of JS
  const [jurisdiction, setJurisdiction] = useState<any>();
  const [selectedValues, setSelectedValues] = useState<any>({});
  const [selectedOption, setSelectedOption] = useState<any>({});
  const [disabledPanels, setDisabledPanels] = useState<any>({});
  const [childWidget, setChildWidget] = useState(new Map());
  const descendantValuesMap = useRef(new Map());
  const {
    obcmSnapShotDetails,
    obcmSnapShot,
    userInfo,
    jurisdictions,
    projectConceptModel,
  } = useAppSelector((state) => state.reveloUserInfo);
  let immediateChildEntityNode: any;
  let descendantsMap: any = new Map();
  let ancestorsMap: any = new Map();
  let widgetsMap = new Map(childWidget);
  let defaultvalueRef: any = useRef();

  const buildCompoundCYGraph = (dataGraph: any) => {
    const tempCyGraph = CyCMGraph(dataGraph);
    const roots = tempCyGraph.elements().roots();
    const parentChildCyGraph = cytoscape({});
    let rootNode = null;
    roots.forEach((root) => {
      rootNode = root;
      let elementsToAdd: NodeDefinition[] = [];
      elementsToAdd = [
        {
          group: "nodes",
          data: { parent: null, ...rootNode.data() },
        },
      ];
      parentChildCyGraph.add(elementsToAdd);
      extractAndAddChildren(rootNode, parentChildCyGraph);
    });
    return parentChildCyGraph;
  };
  const extractAndAddChildren = (node: any, graph: any) => {
    let outgoers = node.outgoers();
    let elementsToAdd = [];
    for (let i = 0; i < outgoers.length; i++) {
      let outgoer = outgoers[i];
      let targetNode = outgoer.target();
      if (targetNode) {
        let targetNodeData = targetNode.data();
        if (targetNodeData) {
          let targetData = { parent: node.data().id, ...targetNodeData };
          elementsToAdd.push({
            group: "nodes",
            data: targetData,
          });

          let edgeData = outgoer.data();
          elementsToAdd.push({
            group: "edges",
            data: {
              id: targetData.parent + "_" + targetNodeData.id,
              source: targetData.parent,
              target: targetNodeData.id,
              fromId: edgeData.fromId,
              toId: edgeData.toId,
            },
          });
          if (elementsToAdd.length > 0) {
            graph.add(elementsToAdd);
          }
          extractAndAddChildren(targetNode, graph);
        }
      }
    }
  };
  const CyCMGraph = (graphData: any) => {
    const cyNodes: NodeDefinition[] = [];
    const cyEdges: EdgeDefinition[] = [];
    const vertices = graphData.entities;
    vertices.forEach((vertex: any) => {
      const vertexName = vertex.shortName;
      cyNodes.push({ data: { id: vertexName, ...vertex } });
    });
    const edges = graphData.relations;
    edges.forEach((edge: any) => {
      cyEdges.push({
        data: {
          id: edge.name,
          source: edge.from,
          target: edge.to,
          ...edge,
        },
      });
    });
    const cy = cytoscape({
      elements: {
        nodes: cyNodes,
        edges: cyEdges,
      },
    });
    return cy;
  };
  const obCMCYGraph = buildCompoundCYGraph(obcmSnapShotDetails);
  const hierarchyInfo = userInfo.userInfo.hierarchy;
  const jurisdictionName = jurisdictions[0]?.name;
  const jurisdictionType = jurisdictions[0]?.type;
  const obcmGraphNodes = obCMCYGraph.nodes();
  const assignedEntityNode = obCMCYGraph.nodes(
    "[id='" + jurisdictionType + "']"
  );
  ancestorsMap.set(jurisdictionType, jurisdictionName);
  const getAncestors = (
    entityNode: any,
    hierarchyInfo: any,
    ancestorsMap: any
  ) => {
    let incomers = entityNode.incomers();
    if (incomers.length === 2) {
      let parentNode = incomers[1];
      if (parentNode) {
        let jurisdiction = hierarchyInfo.jurisdiction;
        ancestorsMap.set(jurisdiction.type, jurisdiction.name);
        getAncestors(parentNode, hierarchyInfo.parent, ancestorsMap);
      }
    }
  };
  getAncestors(assignedEntityNode, hierarchyInfo.parent, ancestorsMap);
  const getDescendants = (entityNode: any) => {
    let outgoers = entityNode.outgoers();
    if (outgoers.length === 2) {
      let childNode = outgoers[1];
      if (childNode) {
        let childEntity = childNode.data();
        descendantsMap.set(childEntity.name, childEntity);
        getDescendants(childNode);
      }
    }
  };
  const outgoers = assignedEntityNode.outgoers();
  if (outgoers.length === 2) {
    immediateChildEntityNode = outgoers[1];
  }
  if (immediateChildEntityNode) {
    getDescendants(immediateChildEntityNode);
  }
  const extractValueOptionsFromObject = (
    entityName: any,
    ancestorsMap: any
  ) => {
    let values = [
      {
        value: "all",
        label: "All",
        selected: true,
      },
    ];
    let snapShotObject = obcmSnapShot;
    let rootEntityNode = obCMCYGraph.nodes().first();
    const updatedSnapshot = extractRecursively(
      rootEntityNode,
      jurisdictionType,
      entityName,
      ancestorsMap,
      snapShotObject
    );
    if (updatedSnapshot) {
      let entityValuesObject = updatedSnapshot[entityName];
      if (entityValuesObject) {
        let entityValues = Object.keys(entityValuesObject);
        if (entityValues.length > 0) {
          entityValues.forEach(function (entityValue) {
            values.push({
              value: entityValue,
              label: entityValue,
              selected: false,
            });
          });
        }
      }
    }
    return values;
  };

  const createEntitySelectorPanel = (value: any, obcmEntity: any) => {
    let options: any[] = [];
    let selectedValue = value;

    if (ancestorsMap.has(obcmEntity?.name) === true) {
      var jurisdictionName = ancestorsMap.get(obcmEntity.name);
      console.log(jurisdictionName);
      if (jurisdictionName) {
        defaultvalueRef.current = `${obcmEntity.name}`;
      }

      options = [
        {
          value: jurisdictionName,
          label: jurisdictionName,
        },
      ];
    } else if (descendantsMap.has(obcmEntity?.name) === true) {
      const retrievedValue = descendantValuesMap.current?.get(obcmEntity?.name);
      if (retrievedValue !== undefined) {
        retrievedValue.forEach(function (option: any) {
          options.push({
            value: option.value,
            label: option.label,
            selected: true,
          });
        });
      } else {
        options = [
          {
            value: "all",
            label: "All",
            selected: true,
          },
        ];
      }
    } else {
      options = extractValueOptionsFromObject(
        immediateChildEntityNode.data().name,
        ancestorsMap
      );
    }
    selectedValue = jurisdictionName ? jurisdictionName : value;
    let existingSelectObject = widgetsMap.get(obcmEntity?.name);
    if (existingSelectObject) {
      selectedValue = existingSelectObject.value || value;
    }
    let selectobject = {
      entityName: obcmEntity?.name,
      options: options,
      value: selectedValue,
    };
    widgetsMap.set(obcmEntity?.name, selectobject);

    return options;
  };

  const populateChildWidget = (
    value: any,
    parentEntityName: any,
    selectOptions: any,
    index: any
  ) => {
    const previousSelectedValue = selectedValues[parentEntityName];
    setSelectedOption({
      name: value === "all" ? previousSelectedValue : value,
      type: parentEntityName,
    });
    let options: any = [];
    let parentNode = obCMCYGraph.nodes("[id='" + parentEntityName + "']");
    let parentEntityValue = value;
    const updatedValues = {
      ...selectedValues,
      [parentEntityName]: parentEntityValue,
    };
    const currentIndex = selectOptions.findIndex(
      (item: any) => item.value === parentEntityValue
    );
    const updatedDisabled: any = { ...disabledPanels };
    setSelectedValues(updatedValues);
    setDisabledPanels(updatedDisabled);
    let disableNext = false;
    if (parentEntityValue === "all") {
      for (let i = currentIndex + 1; i < selectOptions.length; i++) {
        options = [
          {
            label: "All",
            selected: true,
            value: "all",
          },
        ];
        if (disableNext || updatedValues[selectOptions[i].name] === "all") {
          updatedValues[selectOptions[i].name] = "All";
          updatedDisabled[selectOptions[i].name] = true;
          disableNext = true;
        } else {
          updatedDisabled[selectOptions[i].name] = false;
        }
      }
    } else {
      options = [
        {
          label: parentEntityValue,
          selected: true,
          value: parentEntityValue,
        },
      ];
      for (let i = currentIndex + 1; i < selectOptions.length; i++) {
        if (updatedValues[selectOptions[i].name] === "all") {
          updatedValues[selectOptions[i].name] = options;
          updatedDisabled[selectOptions[i].name] = true;
        } else {
          updatedDisabled[selectOptions[i].name] = false;
        }
      }
      let childEntity, childNode;
      var outgoers = parentNode.outgoers();
      if (outgoers.length === 2) {
        childNode = outgoers[1];
        if (childNode) {
          childEntity = childNode.data();
        }
      }
      if (!childEntity) {
        return;
      }
      console.log(disabledPanels);
      let childEntityName = childEntity.name;
      let ancestorsMap = new Map();
      ancestorsMap.set(parentEntityName, parentEntityValue);
      parentNode.ancestors().forEach(function (ancestorElement) {
        if (ancestorElement.group() === "nodes") {
          var ancestorEntity = ancestorElement.data();
          var ancestorWidget = widgetsMap.get(ancestorEntity.name);
          ancestorsMap.set(ancestorEntity.name, ancestorWidget.value);
        }
      });
      setChildWidget(widgetsMap);
      let values = [
        {
          value: "all",
          label: "All",
        },
      ];
      let snapShotObject = obcmSnapShot;
      let rootEntityNode = obCMCYGraph.nodes().first();
      let updatedSnapshot = extractRecursively(
        rootEntityNode,
        parentEntityName,
        childEntityName,
        ancestorsMap,
        snapShotObject
      );
      if (updatedSnapshot) {
        var entityValuesObject = updatedSnapshot[childEntityName];
        if (entityValuesObject) {
          var entityValues = Object.keys(entityValuesObject);
          if (entityValues.length > 0) {
            entityValues.forEach(function (entityValue) {
              values.push({
                value: entityValue,
                label: entityValue,
              });
            });
          }
        }
      }
      descendantValuesMap.current.set(childEntityName, values);
    }
  };

  const extractRecursively = (
    currentEntityNode: any,
    assignedEntityName: any,
    targetEntityName: any,
    ancestorsMap: any,
    snapShotObject: any
  ) => {
    const currentEntityName = currentEntityNode.data().name;
    if (snapShotObject.hasOwnProperty(currentEntityName) === true) {
      const currentEntityValue = ancestorsMap.get(currentEntityName);
      const dataObject = snapShotObject[currentEntityName][currentEntityValue];
      if (dataObject) {
        snapShotObject = dataObject["children"];
        if (currentEntityName !== assignedEntityName) {
          const outgoers = currentEntityNode.outgoers();
          if (outgoers.length === 2) {
            const parentNode = outgoers[1];
            if (parentNode) {
              snapShotObject = extractRecursively(
                parentNode,
                assignedEntityName,
                targetEntityName,
                ancestorsMap,
                snapShotObject
              );
            }
          }
        }
      } else {
        return null;
      }
    }
    return snapShotObject;
  };
  const handleReset = () => {
    const resetValues: any = {};
    Object.keys(selectedValues).forEach((panel) => {
      resetValues[panel] = "All";
    });
    setSelectedValues(resetValues);
    setJurisdiction(undefined);
    setSelectedOption(undefined);
  };
  const selectWidget = () => {
    let obcmEntity: any;
    let arras: any = [];
    obcmGraphNodes.forEach((currentNode: any) => {
      obcmEntity = currentNode.data();
      arras.push(obcmEntity);
    });
    return arras.map((node: any, index: any) => {
      const selectOption = createEntitySelectorPanel(
        selectedValues[node.name],
        node
      );
      console.log(arras[index].name);
      return (
        <>
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              justifyContent: "space-around",
              alignItems: "left",
              marginLeft: "0px",
            }}
          >
            <Typography style={{ marginLeft: "0.7rem" }}>
              {node.label}
            </Typography>
            <div>
              <Select
                key={node.value}
                style={{
                  width: "160px",
                  marginTop: "3px",
                  marginLeft: "0.5rem",
                }}
                defaultValue={selectOption[0]?.label}
                value={selectedValues[node.name]}
                onChange={(e) => {
                  populateChildWidget(e, node.name, arras, index);
                }}
                disabled={
                  arras[index].name ===
                    userInfo.userInfo.jurisdictions[0].type ||
                  (index > 0 && disabledPanels[arras[index - 1].name])
                }
              >
                {selectOption?.map((elss: any) => {
                  return (
                    <>
                      <Select.Option value={elss.value}>
                        {elss.label}
                      </Select.Option>
                    </>
                  );
                })}
              </Select>
            </div>
          </div>
        </>
      );
    });
  };
  ///end JS
  const getJtypeandJname = (): string[] => {
    if (jurisdiction === "All") {
      return [
        userInfo.userInfo.jurisdictions[0]?.name,
        userInfo.userInfo.jurisdictions[0]?.type,
      ];
    } else if (jurisdiction) {
      return [jurisdiction.name, jurisdiction.type];
    } else {
      return [
        userInfo.userInfo.jurisdictions[0]?.name,
        userInfo.userInfo.jurisdictions[0]?.type,
      ];
    }
  };
  const getReports = async () => {
    let payload: any = [];
    let protocol = userInfo.userInfo.customerInfo.outputStore.securityInfo
      .isSSLEnabled
      ? "https"
      : "http";
    let domain = `${userInfo.userInfo.customerInfo.outputStore.hostName}:${userInfo.userInfo.customerInfo.outputStore.portNumber}`;
    try {
      const reportOutPut = await axios.post(
        `${protocol}://${domain}/nmc_explorer_data_generator/_search`,
        {
          size: 1000,
          query: {
            match: {
              shiftdate: date,
            },
          },
        }
      );
      
      if (reportOutPut.data.error) {
        setLoading(false);
        return message.error("Something went Wrong");
      }
      reportOutPut.data.hits.hits.forEach((outPut: any) => {
        payload.push(outPut._source);
        setDownloadJson(payload);
      });
    } catch (err) {
      console.log(err);
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
        if (res.status === 200) {
          setUnitGeojson(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.log(err);
        setLoading(false);
      });
  };
  useEffect(() => {
    getReports();
  }, [date]);
  useEffect(() => {
    getlistdata();
  }, [jurisdiction]);
  return (
    <>
      <div className="widget-wrapper">
        <div className="select-widget">
          <div
            style={{
              display: "inline-flex",
              flexDirection: "column",
              justifyContent: "space-around",
              alignItems: "left",
              marginLeft: "15px",
            }}
          >
            <Typography style={{ marginLeft: "5px" }}>Date</Typography>
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
              }}
            />
          </div>
          {selectWidget()}
          <div className="button-wrapper">
            <Space>
              <Button
                type="primary"
                onClick={() => {
                  setJurisdiction(selectedOption);
                }}
              >
                Apply Filters
              </Button>
              <Button
                type="link"
                onClick={() => {
                  handleReset();
                  // setDate("")
                }}
              >
                Reset
              </Button>
            </Space>
          </div>
        </div>
        <div ref={targetRef} className="button-refresh">
          <Button
            type="primary"
            onClick={() => {
              if (downloadjson.length === 0) {
                message.info("No report for selected Date");
              } else {
                const data = downloadjson;
                const fileName = `tmsreport_${downloadjson[0].shiftdate}`;
                const exportType = exportFromJSON.types.xls;
                const fields = {
                  shiftdate: "Shift Date",
                  vendorname: "Vendor Name",
                  unitname: "Unit Name",
                  ward: "Ward",
                  zone: "Zone",
                  city: "City",
                  numshift: "No of shift",
                  numshiftcleaned: "No of Shift Cleaned",
                  numshiftskipped: "No of shift Skipped",
                  numshiftDamaged: "No of Shift Damaged",
                  numshiftBlocked: "No of Shift Blocked",
                  numshiftLocked: "No of Shift Locked",
                  numshiftStolen: "No of Shift Stolen",
                  amount: "amount",
                };
                exportFromJSON({ data, fileName, fields: fields, exportType });
              }
            }}
            icon={<DownloadOutlined />}
          />
          <Button
            type="primary"
            style={{ marginLeft: "3px" }}
            onClick={() => {
              handleReset();
              // setDate("")
            }}
            icon={<RedoOutlined />}
          />
        </div>
      </div>
      <div className="main-dashBoard-wrapper1">
        {/* {loading ? (
        <>
          <Spin tip="Loading..." style={{ display: "flex", flexDirection: "column", placeContent: "center", placeItems: "center" }} />
        </>
      ) : (
        <> */}

        <div className="chart-container1">
          <SidePanel2
            loading={loading}
            unit={unitGeojson}
            jurisdiction={getJtypeandJname()}
            date={date}
          />
        </div>
        {/* </>
      )} */}
      </div>
    </>
  );
};

export default ExplorerContent2;
