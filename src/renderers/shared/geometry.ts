import type { GraphEdge } from "../../core/types";

export const NODE_RADIUS = 28;

export interface Point {
  x: number;
  y: number;
}

export type EdgeRoute = "straight" | "curved" | "loop";

export function pointOnCircle(center: Point, toward: Point, radius: number): Point {
  const dx = toward.x - center.x;
  const dy = toward.y - center.y;
  const distance = Math.hypot(dx, dy);
  if (distance === 0) {
    return { x: center.x + radius, y: center.y };
  }
  return {
    x: center.x + (dx / distance) * radius,
    y: center.y + (dy / distance) * radius,
  };
}

/** Antiparallel edges bow to opposite sides. A self-loop is its own route. */
export function routeForEdge(
  edge: GraphEdge,
  edges: readonly GraphEdge[],
): { route: EdgeRoute; side: 1 | -1 } {
  if (edge.source === edge.target) {
    return { route: "loop", side: 1 };
  }
  const reverse = edges.some(
    (other) =>
      other.id !== edge.id && other.source === edge.target && other.target === edge.source,
  );
  if (!reverse) {
    return { route: "straight", side: 1 };
  }
  return { route: "curved", side: edge.source < edge.target ? 1 : -1 };
}

export interface DrawnEdge {
  d: string;
  label: Point;
}

const CURVE = 42;

export function drawEdge(
  source: Point,
  target: Point,
  route: EdgeRoute,
  side: 1 | -1,
  radius = NODE_RADIUS,
): DrawnEdge {
  if (route === "loop") {
    const start = pointOnCircle(source, { x: source.x - radius, y: source.y - radius }, radius);
    const end = pointOnCircle(source, { x: source.x + radius, y: source.y - radius }, radius);
    const lift = radius + 46;
    return {
      d: `M ${start.x} ${start.y} C ${source.x - lift} ${source.y - lift}, ${source.x + lift} ${source.y - lift}, ${end.x} ${end.y}`,
      label: { x: source.x, y: source.y - lift },
    };
  }

  const start = pointOnCircle(source, target, radius);
  const end = pointOnCircle(target, source, radius);
  if (route === "straight") {
    const dx = target.x - source.x;
    const dy = target.y - source.y;
    const distance = Math.hypot(dx, dy) || 1;
    return {
      d: `M ${start.x} ${start.y} L ${end.x} ${end.y}`,
      label: {
        x: (start.x + end.x) / 2 + (-dy / distance) * 14,
        y: (start.y + end.y) / 2 + (dx / distance) * 14,
      },
    };
  }

  const dx = target.x - source.x;
  const dy = target.y - source.y;
  const distance = Math.hypot(dx, dy) || 1;
  const control = {
    x: (source.x + target.x) / 2 + (-dy / distance) * CURVE * side,
    y: (source.y + target.y) / 2 + (dx / distance) * CURVE * side,
  };
  const curveStart = pointOnCircle(source, control, radius);
  const curveEnd = pointOnCircle(target, control, radius);
  return {
    d: `M ${curveStart.x} ${curveStart.y} Q ${control.x} ${control.y} ${curveEnd.x} ${curveEnd.y}`,
    label: {
      x: 0.25 * curveStart.x + 0.5 * control.x + 0.25 * curveEnd.x,
      y: 0.25 * curveStart.y + 0.5 * control.y + 0.25 * curveEnd.y,
    },
  };
}
