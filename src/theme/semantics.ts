import type { EdgeState, NodeState } from "../core/types";

export interface NodeStyle {
  label: string;
  fill: string;
  stroke: string;
  text: string;
}

export interface EdgeStyle {
  label: string;
  stroke: string;
  dashed: boolean;
}

export const NODE_STYLES: Record<NodeState, NodeStyle> = {
  unvisited: { label: "Unvisited", fill: "var(--sem-node-unvisited-fill)", stroke: "var(--sem-node-unvisited-stroke)", text: "var(--sem-node-unvisited-text)" },
  frontier: { label: "Frontier", fill: "var(--sem-node-frontier-fill)", stroke: "var(--sem-node-frontier-stroke)", text: "var(--sem-node-frontier-text)" },
  current: { label: "Current", fill: "var(--sem-node-current-fill)", stroke: "var(--sem-node-current-stroke)", text: "var(--sem-node-current-text)" },
  visited: { label: "Visited", fill: "var(--sem-node-visited-fill)", stroke: "var(--sem-node-visited-stroke)", text: "var(--sem-node-visited-text)" },
  source: { label: "Source", fill: "var(--sem-node-source-fill)", stroke: "var(--sem-node-source-stroke)", text: "var(--sem-node-source-text)" },
};

export const EDGE_STYLES: Record<EdgeState, EdgeStyle> = {
  default: { label: "Default", stroke: "var(--sem-edge-default-stroke)", dashed: false },
  tree: { label: "Tree", stroke: "var(--sem-edge-tree-stroke)", dashed: false },
  rejected: { label: "Rejected", stroke: "var(--sem-edge-rejected-stroke)", dashed: true },
};

export function nodeStyle(state: NodeState | undefined): NodeStyle {
  return state === undefined ? NODE_STYLES.unvisited : NODE_STYLES[state];
}

export function edgeStyle(state: EdgeState | undefined): EdgeStyle {
  return state === undefined ? EDGE_STYLES.default : EDGE_STYLES[state];
}
