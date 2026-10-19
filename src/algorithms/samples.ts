import { makeGraph } from "../core/graph";
import type { Example } from "./types";

export const sixVertices: Example = {
  id: "sample",
  name: "Six vertices",
  description:
    "An undirected graph of six vertices. Click a vertex to choose the source.",
  source: "a",
  graph: makeGraph(false, [
    ["a", "b"],
    ["b", "c"],
    ["a", "d"],
    ["b", "e"],
    ["d", "e"],
    ["e", "f"],
  ]),
};

export const nineVertices: Example = {
  id: "nine",
  name: "Nine vertices",
  description:
    "An undirected graph of nine vertices. Click a vertex to choose the source.",
  source: "a",
  graph: makeGraph(false, [
    ["a", "b"],
    ["b", "c"],
    ["c", "d"],
    ["d", "e"],
    ["e", "f"],
    ["f", "g"],
    ["g", "h"],
    ["h", "i"],
    ["a", "d"],
    ["b", "e"],
    ["b", "i"],
    ["c", "f"],
    ["c", "h"],
    ["d", "g"],
    ["e", "h"],
    ["f", "i"],
    ["g", "b"],
    ["i", "d"],
  ]),
};
