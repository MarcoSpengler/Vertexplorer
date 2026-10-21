import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Simulation,
  type SimulationNodeDatum,
} from "d3-force";
import type { Graph, NodeId } from "../types";

/** Comfortable length of an edge, in the same units as vertex coordinates. */
const SPRING_LENGTH = 150;
/** How strongly vertices push each other away. More negative means a stronger push. */
const REPULSION = -380;
/** Centers stay at least this far apart, so the drawn circles do not pile up. */
const BODY_RADIUS = 36;

interface SimNode extends SimulationNodeDatum {
  id: NodeId;
}

export type Layout = Simulation<SimNode, undefined>;

/** One spring per pair. A reverse edge would otherwise pull a second time. */
function springs(graph: Graph, nodes: readonly SimNode[]) {
  const ids = new Set(nodes.map((node) => node.id));
  const seen = new Set<string>();
  const links: { source: NodeId; target: NodeId }[] = [];
  for (const edge of graph.edges) {
    if (edge.source === edge.target || !ids.has(edge.source) || !ids.has(edge.target)) {
      continue;
    }
    const key = edge.source < edge.target ? `${edge.source}\0${edge.target}` : `${edge.target}\0${edge.source}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    links.push({ source: edge.source, target: edge.target });
  }
  return links;
}

/**
 * Runs d3-force on a copy of the vertices. `onMove` receives coordinates each frame.
 * Call `layout.stop()` to cancel.
 */
export function startLayout(graph: Graph, onMove: (positions: { id: NodeId; x: number; y: number }[]) => void): Layout | null {
  const nodes: SimNode[] = graph.nodes.map((node) => ({ id: node.id, x: node.x, y: node.y }));
  if (nodes.length === 0) {
    return null;
  }
  const origin = {
    x: nodes.reduce((sum, node) => sum + (node.x ?? 0), 0) / nodes.length,
    y: nodes.reduce((sum, node) => sum + (node.y ?? 0), 0) / nodes.length,
  };
  return forceSimulation(nodes)
    .force(
      "link",
      forceLink<SimNode, { source: NodeId; target: NodeId }>(springs(graph, nodes))
        .id((node) => node.id)
        .distance(SPRING_LENGTH),
    )
    .force("charge", forceManyBody<SimNode>().strength(REPULSION))
    .force("collide", forceCollide<SimNode>(BODY_RADIUS))
    .force("center", forceCenter(origin.x, origin.y))
    .velocityDecay(0.28)
    .alphaDecay(0.028)
    .alphaMin(0.02)
    .on("tick", () => {
      onMove(nodes.map((node) => ({ id: node.id, x: node.x ?? 0, y: node.y ?? 0 })));
    });
}
