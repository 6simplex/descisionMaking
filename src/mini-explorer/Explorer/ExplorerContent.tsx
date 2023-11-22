import { Button, Divider, Select, Space, Spin, Typography, message } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../Redux/store/store";
import cytoscape, {
  EdgeDefinition,
  NodeDefinition,
} from "cytoscape";
import "./ExplorerContent.css";
import { fetchData, getCurrentDateDDMMYYYY } from "../../utils/cutsomhooks";
import { DownloadOutlined, RedoOutlined } from "@ant-design/icons";
import { usePDF, Resolution } from "react-to-pdf";
import { SidePanel } from "./components/SidePanel";
import axios from "axios";


const ExplorerContent = () => {
  const [unitGeojson, setUnitGeojson] = useState()
  const [loading, setLoading] = useState(true)
  const [jurisdiction, setJurisdiction] = useState();
  const [reset, setReset] = useState(false);
  const [selectedValues, setSelectedValues] = useState<any>({});
  const [selectedOption, setSelectedOption] = useState<any>({});
  const [disabledPanels, setDisabledPanels] = useState<any>({});
  const [isDisabled, setIsDisabled] = useState<boolean>(false);
  const [childWidget, setChildWidget] = useState(new Map());
  const descendantValuesMap = useRef(new Map());
  const { obcmSnapShotDetails, obcmSnapShot, userInfo, jurisdictions, projectConceptModel } =
    useAppSelector((state) => state.reveloUserInfo);
  let immediateChildEntityNode: any;
  let descendantsMap: any = new Map();
  let ancestorsMap: any = new Map();
  let widgetsMap = new Map(childWidget);

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
  const { toPDF, targetRef } = usePDF({
    filename: `report_${getCurrentDateDDMMYYYY()}.pdf`, resolution: Resolution.NORMAL, page: { orientation: "landscape", },
    method: "open"
  });

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
  };
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
    if (reset) {
      options = [
        {
          value: "all",
          label: "All",
          selected: true,
        },
      ]
    }
    if (ancestorsMap.has(obcmEntity?.name) === true) {
      var jurisdictionName = ancestorsMap.get(obcmEntity.name);
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
    }
    else {
      options = extractValueOptionsFromObject(immediateChildEntityNode.data().name, ancestorsMap);
    }
    selectedValue = jurisdictionName ? jurisdictionName : value
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
  const populateChildWidget = (value: any, parentEntityName: any, selectoptions: any, index: any) => {
    console.log(value)
    const previousSelectedValue = selectedValues[parentEntityName];
    setSelectedOption({
      name: value,
      type: parentEntityName,
    })

    let options: any = [];
    let parentNode = obCMCYGraph.nodes("[id='" + parentEntityName + "']");
    let parentEntityValue = value;
    const updatedValues = { ...selectedValues, [parentEntityName]: parentEntityValue };
    const currentIndex = selectoptions.findIndex((item: any) => item.value === parentEntityValue);
    const updatedDisabled: any = { ...disabledPanels };
    let disableNext = false;
    if (parentEntityValue === "all") {
      updatedValues[parentEntityName] = previousSelectedValue;
      console.log(previousSelectedValue)
      parentNode.descendants().forEach(function (descendantElement) {
        if (descendantElement.group() === "nodes") {
          var descendantEntity = descendantElement.data();
          var gcWidget = widgetsMap.get(descendantEntity.name);
          console.log(gcWidget)
          if (gcWidget) {
            setSelectedValues(undefined);
            setSelectedOption(undefined);
            setIsDisabled(true);
          }
        }
      },);
      for (let i = currentIndex + 1; i < selectoptions.length; i++) {
        options = [{
          label: "All",
          selected: true,
          value: "all"
        }]
        if (disableNext || updatedValues[selectoptions[i].name] === "all") {
          updatedValues[selectoptions[i].name] = options;
          updatedDisabled[selectoptions[i].name] = true;
          disableNext = true;
        } else {
          updatedDisabled[selectoptions[i].name] = false;
        }
      }
    } else {
      for (let i = currentIndex + 1; i < selectoptions.length; i++) {
        if (updatedValues[selectoptions[i].name] === 'all') {
          updatedValues[selectoptions[i].name] = options;
          updatedDisabled[selectoptions[i].name] = true;
        } else {
          updatedDisabled[selectoptions[i].name] = false;
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
      let childEntityName = childEntity.name;
      let ancestorsMap = new Map();
      ancestorsMap.set(parentEntityName, parentEntityValue);
      parentNode.ancestors().forEach(function (ancestorElement) {
        if (ancestorElement.group() === "nodes") {
          var ancestorEntity = ancestorElement.data();
          var ancestorWidget = widgetsMap.get(ancestorEntity.name);
          ancestorsMap.set(ancestorEntity.name, ancestorWidget.value);
        }
      })
      setChildWidget(widgetsMap)
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
                "label": entityValue
              });
            });
          }
        }
      }
      descendantValuesMap.current.set(childEntityName, values)
    }
    setSelectedValues(updatedValues);
    // setSelectedOption(selectedValues[parentEntityName])
    setDisabledPanels(updatedDisabled);

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
  const selectWidget = () => {
    let obcmEntity: any;
    let arras: any = [];
    obcmGraphNodes.forEach((currentNode: any) => {
      obcmEntity = currentNode.data();
      arras.push(obcmEntity);
    });
    return arras.map((node: any, index: any) => {
      const selectOption = createEntitySelectorPanel(selectedValues[node.name], node);

      return (
        <>
          <div style={{ display: 'inline-flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'left', marginLeft: '10px' }}>
            <Typography style={{ marginLeft: '0.7rem' }}>{node.label}</Typography>
            <div>
              <Select
                key={node.value}
                style={{ width: "180px", marginTop: '3px', marginLeft: '0.5rem' }}
                defaultValue={selectOption[0]?.label}
                // value={selectedValues[node.name]}
                onChange={(e) => {
                  populateChildWidget(e, node.name, arras, index);
                  // createEntitySelectorPanel(e, node);
                }}
                // onSelect={selectedOption === undefined ? "All" : selectedOption}
                // disabled={isDisabled}
                disabled={index > 0 && disabledPanels[arras[index - 1].name]}
              >
                {selectOption?.map((elss: any) => {
                  return (
                    <>
                      <Select.Option value={elss.value}>{elss.label}</Select.Option>
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
  const getlistdata = async () => {
    setLoading(true)
    await axios.get(`${window.__rDashboard__.serverUrl}/conceptmodels/${projectConceptModel.name}/entities/unit/data?format=geojson&source=remote&targetArtifact=original`).then(((res) => {
      if (res.status === 200) {
        setUnitGeojson(res.data)
        setLoading(false)
      }

    })).catch(((err) => {
      console.log(err)
      setLoading(false)

    }))
  }
  
  useEffect(() => {
    getlistdata()
  }, [])
  return (<>
    <div className='widget-wrapper'  >
      <div className='select-widget' >{selectWidget()}
        <div className="button-wrapper">
          <Space>
            <Button type="primary" size="large" onClick={() => { setJurisdiction(selectedOption) }}>
              Apply Filters
            </Button>
            <Button type="link" size="large" onClick={() => {
              setJurisdiction(undefined); setSelectedOption(undefined); setReset(true)
            }}>
              Reset
            </Button>
          </Space>
        </div>
      </div>

      <div ref={targetRef} className="button-refresh">
        <Button type="primary" onClick={() => { toPDF() }} icon={<DownloadOutlined />} />
        <Button type="primary" style={{ marginLeft: '3px' }} onClick={() => { }} icon={<RedoOutlined />} />
      </div>


    </div>
    <Divider />
    <div
      // ref={targetRef}
      className="main-dashBoard-wrapper"
    >

      {loading ? (
        <>
          <Spin tip="Loading..." />
        </>
      ) : (
        <>
          <div className="chart-container1">
            <SidePanel unit={unitGeojson}/>
          </div>
        </>
      )}
    </div>
  </>
  )


}

export default ExplorerContent