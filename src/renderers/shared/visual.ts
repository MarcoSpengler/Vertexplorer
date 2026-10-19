import type { EdgeState, GraphEdge } from "../../core/types";

export function edgeArrows(directed: boolean): { start: boolean; end: boolean } {
  return directed ? { start: false, end: true } : { start: false, end: false };
}

export function edgeCaption(edge: GraphEdge): string | undefined {
  return edge.weight === undefined ? undefined : String(edge.weight);
}

/** Tree edges paint above rejected ones. */
export function edgeRank(state: EdgeState | undefined): number {
  if (state === "tree") {
    return 2;
  }
  if (state === "rejected") {
    return 1;
  }
  return 0;
}
