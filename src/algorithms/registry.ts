import type { Algorithm } from "./types";
import { bfs } from "./bfs";
import { dfs } from "./dfs";
import { ssspBfs } from "./sssp-bfs";

export const algorithms: readonly Algorithm[] = [bfs, dfs, ssspBfs];

export function getAlgorithm(id: string): Algorithm | undefined {
  return algorithms.find((algorithm) => algorithm.id === id);
}
