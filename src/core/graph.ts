import type { Graph, GraphEdge, GraphNode, NodeId } from "./types";

export function nodeById(graph: Graph, id: NodeId): GraphNode | undefined {
  return graph.nodes.find((node) => node.id === id);
}

export function requireNode(graph: Graph, id: NodeId): GraphNode {
  const node = nodeById(graph, id);
  if (node === undefined) {
    throw new Error(`No vertex with id "${id}".`);
  }
  return node;
}

export function edgeById(graph: Graph, id: string): GraphEdge | undefined {
  return graph.edges.find((edge) => edge.id === id);
}

export interface IncidentEdge {
  nodeId: NodeId;
  edge: GraphEdge;
}

export function neighbors(graph: Graph, id: NodeId): IncidentEdge[] {
  const result: IncidentEdge[] = [];
  for (const edge of graph.edges) {
    if (edge.source === id) {
      result.push({ nodeId: edge.target, edge });
    } else if (!graph.directed && edge.target === id) {
      result.push({ nodeId: edge.source, edge });
    }
  }
  return result;
}

/** Builds a graph from its edges and lays the vertices out on a grid. The id is also the label. */
export function makeGraph(directed: boolean, links: readonly (readonly [string, string])[]): Graph {
  const ids: string[] = [];
  for (const [source, target] of links) {
    if (!ids.includes(source)) {
      ids.push(source);
    }
    if (!ids.includes(target)) {
      ids.push(target);
    }
  }
  const columns = Math.max(1, Math.ceil(Math.sqrt(ids.length)));
  return {
    directed,
    nodes: ids.map((id, index) => ({
      id,
      label: id,
      x: 140 + (index % columns) * 170,
      y: 120 + Math.floor(index / columns) * 150,
    })),
    edges: links.map(([source, target]) => ({ id: `${source}-${target}`, source, target })),
  };
}

export function cloneGraph(graph: Graph): Graph {
  return {
    directed: graph.directed,
    nodes: graph.nodes.map((node) => ({ ...node })),
    edges: graph.edges.map((edge) => ({ ...edge })),
  };
}
