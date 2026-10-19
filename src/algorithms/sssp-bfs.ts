import { neighbors } from "../core/graph";
import { nineVertices, sixVertices } from "./samples";
import { trace } from "./trace";
import type { Algorithm } from "./types";

export const ssspBfs: Algorithm = {
  id: "sssp-bfs",
  name: "SSSP-BFS",
  description:
    "Shortest paths from s in an unweighted graph. L[v] is the layer, M[v] is null, 1, or 2, and P[v] is the predecessor of v.",
  needsSource: true,
  pseudocode: [
    { id: "init", text: "initialize arrays L, M and P of length n with null" },
    { id: "init", text: "initialize empty queue Q" },
    { id: "start", text: "Q.push(s)" },
    { id: "start", text: "M[s] ← 1" },
    { id: "start", text: "L[s] ← 0" },
    { id: "while", text: "while Q is not empty" },
    { id: "pop", text: "current ← Q.pop()", indent: 1 },
    { id: "for", text: "for each entry i in A[current]", indent: 1 },
    { id: "if", text: "if M[i] = null", indent: 2 },
    { id: "discover", text: "M[i] ← 1", indent: 3 },
    { id: "discover", text: "P[i] ← current", indent: 3 },
    { id: "discover", text: "L[i] ← L[current] + 1", indent: 3 },
    { id: "discover", text: "Q.push(i)", indent: 3 },
    { id: "done", text: "M[current] ← 2", indent: 1 },
  ],
  examples: [sixVertices, nineVertices],
  run(graph, sourceId) {
    const t = trace(graph, "queue", "L");
    if (sourceId === undefined || t.nodes[sourceId] === undefined) {
      throw new Error("SSSP-BFS needs a source vertex that exists in the graph.");
    }

    const mark: Record<string, number> = {};
    const source = t.label(sourceId);
    t.save(
      "init",
      "Initialization",
      `L, M, and P are null for every vertex, and Q is empty. null means the vertex has not been reached. Search begins at ${source}.`,
    );

    t.push(sourceId);
    mark[sourceId] = 1;
    t.numbers[sourceId] = 0;
    t.nodes[sourceId] = "frontier";
    t.save("start", `Start at ${source}`, `${source} joins Q. M[${source}] is 1 and L[${source}] is 0. P[${source}] stays null.`);

    while (t.items.length > 0) {
      const current = t.pop();
      if (current === undefined) {
        break;
      }
      const name = t.label(current);
      const distance = t.numbers[current] ?? 0;
      t.nodes[current] = "current";
      t.save(["while", "pop"], `current ← ${name}`, `Q is not empty. ${name} leaves the front. L[${name}] is ${distance}.`);

      for (const next of neighbors(graph, current)) {
        const neighbor = t.label(next.nodeId);
        const seen = mark[next.nodeId];
        if (seen === undefined) {
          const layer = distance + 1;
          mark[next.nodeId] = 1;
          t.numbers[next.nodeId] = layer;
          t.edges[next.edge.id] = "tree";
          t.push(next.nodeId);
          t.nodes[next.nodeId] = "frontier";
          t.save(
            ["for", "if", "discover"],
            `Reach ${neighbor}`,
            `M[${neighbor}] was null. M[${neighbor}] is 1, P[${neighbor}] is ${name}, L[${neighbor}] is ${layer}, and ${neighbor} joins the back of Q.`,
          );
        } else {
          if (t.edges[next.edge.id] !== "tree") {
            t.edges[next.edge.id] = "rejected";
          }
          t.save(["for", "if"], `Skip ${neighbor}`, `M[${neighbor}] is already ${seen}, so the body is skipped.`);
        }
      }

      mark[current] = 2;
      t.nodes[current] = "visited";
      t.save("done", `Finish ${name}`, `Every neighbor of ${name} has been checked, so M[${name}] is 2.`);
    }

    t.nodes[sourceId] = "source";
    const order = graph.nodes
      .filter((node) => t.numbers[node.id] !== undefined)
      .map((node) => `${node.label} is ${t.numbers[node.id]}`)
      .join(", ");
    t.save("while", "Queue empty", `Q is empty, so the loop ends. Every reached vertex has M = 2. Layers: ${order}.`);
    return t.finish();
  },
};
