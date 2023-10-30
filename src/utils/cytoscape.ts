/* eslint-disable @typescript-eslint/no-explicit-any */
import cytoscape from "cytoscape";
import { EdgeDefinition, NodeDefinition } from "cytoscape";

export function CyUserGraph(graphData: any) {
  const nodes: NodeDefinition[] = [];
  const edges: EdgeDefinition[] = [];
  Object.keys(graphData.vertices).forEach((nodeName) => {
    const node = graphData.vertices[nodeName];
    nodes.push({ data: { id: nodeName, ...node } });
  });
  graphData.edges.forEach((edge: any) => {
    edges.push({
      data: {
        source: edge.fromNodeName,
        target: edge.toNodeName,
        ...edge.properties,
      },
    });
  });
  const cy = cytoscape({
    elements: {
      nodes: nodes,
      edges: edges,
    },
  });
  return cy;
}
export const getAllDescendants = (
  parentNode: any,
  graph: any,
  userNodeMap: any,
  idFieldName: any
) => {
  const outgoers = parentNode.outgoers();
  for (let i = 0; i < outgoers.length; i++) {
    const outgoer = outgoers[i];
    const targetNode = outgoer.target();
    if (targetNode && targetNode.isNode() === true) {
      const targetNodeData = targetNode.data();
      const id = targetNodeData[idFieldName];
      userNodeMap.set(id, targetNodeData);
      getAllDescendants(targetNode, graph, userNodeMap, idFieldName);
    }
  }
};
export const ImmediateChild = (graphData: any, userName: string) => {
  const userGraph = CyUserGraph(graphData);
  const userNode = userGraph.nodes("[id='" + userName + "']");
  const immediateChildNodes = userNode.successors().data();
  if (immediateChildNodes === undefined) {
    return;
  } else {
    return immediateChildNodes.target;
  }
};
export function CyUserGraphTest(graphData: any, contain: any) {
  const nodes: NodeDefinition[] = [];
  const edges: EdgeDefinition[] = [];
  Object.keys(graphData.vertices).forEach((nodeName) => {
    const node = graphData.vertices[nodeName];
    nodes.push({ data: { id: nodeName, ...node } });
  });
  graphData.edges.forEach((edge: any) => {
    edges.push({
      data: {
        source: edge.fromNodeName,
        target: edge.toNodeName,
        ...edge.properties,
      },
    });
  });
  const cy = cytoscape({
    container: contain,
    elements: {
      nodes: nodes,
      edges: edges,
    },
    style: [
      // Add your graph styles here
      {
        selector: "node",
        style: {
          "background-color": "#666",
          label: "data(id)",
        },
      },
      {
        selector: "edge",
        style: {
          "line-color": "#ccc",
        },
      },
    ],
  });
  return cy;
}
