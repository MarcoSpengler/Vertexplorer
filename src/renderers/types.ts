import type { EdgeState, Graph, NodeId, NodeState } from "../core/types";

/** The part of a step the canvas draws. */
export interface GraphView {
  nodes: Record<NodeId, NodeState>;
  edges: Record<string, EdgeState>;
  numbers: Record<NodeId, number>;
}

export const EMPTY_VIEW: GraphView = { nodes: {}, edges: {}, numbers: {} };

export interface GraphRendererProps {
  graph: Graph;
  view: GraphView;
  needsSource: boolean;
  fitToken: string;
}
