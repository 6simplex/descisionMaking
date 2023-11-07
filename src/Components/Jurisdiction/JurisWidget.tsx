import { Button, Col, Row, Select, Typography } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../Redux/store/store";
import cytoscape, {
  EdgeDefinition,
  NodeDefinition,
} from "cytoscape";
import { TRUE } from "ol/functions";
const { Option } = Select;


interface SelectedValues {
  [key: string]: string; 
}
const JurisWidget: React.FC = () => {
  const [selectedValues, setSelectedValues] = useState<any>({});
  const [disabledPanels, setDisabledPanels] = useState<any>({});
  const [childWidget, setChildWidget] = useState(new Map());
  const descendantValuesMap = useRef(new Map());
  const { obcmSnapShotDetails, obcmSnapShot, userInfo, jurisdictions } =
    useAppSelector((state) => state.reveloUserInfo);

  let immediateChildEntityNode: any;
  let descendantsMap: any = new Map();
  let ancestorsMap: any = new Map();
  let widgetsMap = new Map(childWidget);

  useEffect(() => {
    // createEntitySelectorPanel();
  }, []);

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
  const jurisdictionName = jurisdictions[0].name;
  const jurisdictionType = jurisdictions[0].type;
  const obcmGraphNodes = obCMCYGraph.nodes();
  const assignedEntityNode = obCMCYGraph.nodes(
    "[id='" + jurisdictionType + "']"
  );
  ancestorsMap.set(jurisdictionType, jurisdictionName);
  //create a map of ancestors from this root to this jursidiction
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
    console.log(value)
    let options: any[] = [];
    let selectedValue = value;

    if (ancestorsMap.has(obcmEntity.name) === true) {
      var jurisdictionName = ancestorsMap.get(obcmEntity.name);
      options = [
        {
          value: jurisdictionName,
          label: jurisdictionName,
        },
      ];
      selectedValue = jurisdictionName ? jurisdictionName : value
    } else if (descendantsMap.has(obcmEntity.name) === true) {
      const retrievedValue = descendantValuesMap.current?.get(obcmEntity.name);
      if (retrievedValue !== undefined) {
        retrievedValue.forEach(function (option: any) {
          options.push({
            value: option.value,
            label: option.label,
            selected: true,
          });
        });
        console.log(retrievedValue)
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
    let existingSelectObject = widgetsMap.get(obcmEntity.name);
    if (existingSelectObject) {
      selectedValue = existingSelectObject.value || value;
    }
    let selectobject = {
      entityName: obcmEntity.name,
      options: options,
      value: selectedValue,
    };
    widgetsMap.set(obcmEntity.name, selectobject);
    console.log(descendantValuesMap)
    
    console.log(options)
    return options;
  };
  const populateChildWidget = (value: any, parentEntityName: any, selectoptions: any) => {

    let parentNode = obCMCYGraph.nodes("[id='" + parentEntityName + "']");
    let parentEntityValue = value;
    const updatedValues = { ...selectedValues, [parentEntityName]: parentEntityValue };
    const currentIndex = selectoptions.findIndex((item: any) => item.value === parentEntityValue);
    const updatedDisabled: any = { ...disabledPanels };
    let disableNext = false;
    if (parentEntityValue === "all") {
      for (let i = currentIndex + 1; i < selectoptions.length; i++) {
        if (disableNext || updatedValues[selectoptions[i].name] === 'all') {
          updatedValues[selectoptions[i].name] = 'all';
          updatedDisabled[selectoptions[i].name] = true;
          disableNext = true;
        } else {
          updatedDisabled[selectoptions[i].name] = false;
        }
      }
    } else {
      for (let i = currentIndex + 1; i < selectoptions.length; i++) {
        if (updatedValues[selectoptions[i].name] === 'all') {
          updatedValues[selectoptions[i].name] = '';
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
    setDisabledPanels(updatedDisabled);
    console.log(selectedValues)
  };

  const extractRecursively = (
    currentEntityNode: any,
    assignedEntityName: any,
    targetEntityName: any,
    ancestorsMap: any,
    snapShotObject: any
  ) => {
    //start with root
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
      let selectOption: any = createEntitySelectorPanel('', node);
      console.log(selectedValues)
      return (
        <>
          <div style={{ display: 'inline-flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'left', marginLeft: '10px' }}>
            <div style={{ margin: '5px 3px 3px 15px' }}> <label>{node.label}</label></div>
            <div>
              <Select
                key={node.value}
                style={{ width: "200px", }}
                defaultValue={selectOption[0]?.label}
                //  value={selectedValues[node.name]}
                onChange={(e) => {
                  populateChildWidget(e, node.name, arras);
                  createEntitySelectorPanel(e, node);
                }}
                // disabled={
                //   index > 1 && selectedValues[arras[index - 1].name] === 'all'
                // }
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
  return <div style={{ margin: "30px 10px 10px 20px" }}>{selectWidget()}</div>;
};

export default JurisWidget;
