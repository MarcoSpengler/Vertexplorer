import type { Graph, NodeId, Step } from "../core/types";

export interface PseudocodeLine {
  id: string;
  text: string;
  /** Spaces the line in. Leave it out for a top-level line. */
  indent?: number;
}

export interface Example {
  id: string;
  name: string;
  description: string;
  graph: Graph;
  source?: NodeId;
}

/**
 * One algorithm. To add another, copy `bfs.ts`, change `run`, and add it to `registry.ts`.
 * `run` receives the graph and the chosen source, and returns the snapshots the player will show.
 */
export interface Algorithm {
  id: string;
  name: string;
  description: string;
  needsSource: boolean;
  pseudocode: PseudocodeLine[];
  examples: Example[];
  run(graph: Graph, source?: NodeId): Step[];
}
