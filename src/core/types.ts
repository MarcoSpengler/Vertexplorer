export type NodeId = string;

export interface GraphNode {
  id: NodeId;
  label: string;
  x: number;
  y: number;
}

export interface GraphEdge {
  id: string;
  source: NodeId;
  target: NodeId;
  weight?: number;
}

export interface Graph {
  directed: boolean;
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/** What a vertex is doing in this snapshot. Algorithms name the role. The theme picks the color. */
export const NODE_STATES = ["unvisited", "frontier", "current", "visited", "source"] as const;
export type NodeState = (typeof NODE_STATES)[number];

/** What an edge is doing in this snapshot. */
export const EDGE_STATES = ["default", "tree", "rejected"] as const;
export type EdgeState = (typeof EDGE_STATES)[number];

export type Pile = "queue" | "stack";

export interface PileItem {
  label: string;
  /** The number written for this vertex, once that entry exists. */
  value?: number;
}

/**
 * One moment of an algorithm.
 * The graph's vertices and edges stay the same for the whole trace.
 * A step only says how to color them, which line of pseudocode is active, and what the queue or stack holds.
 * `numbers` is the array drawn on the vertices. A missing entry has not been written.
 * `valueName` is that array's name, such as B or L, and is shown on the pile chips.
 */
export interface Step {
  /** One id, or several ids that light up together. */
  line: string | readonly string[];
  title: string;
  text: string;
  nodes: Record<NodeId, NodeState>;
  edges: Record<string, EdgeState>;
  numbers: Record<NodeId, number>;
  valueName: string;
  pile: Pile;
  items: PileItem[];
}
