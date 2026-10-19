import { neighbors } from "../core/graph";
import type { NodeId } from "../core/types";
import { nineVertices, sixVertices } from "./samples";
import { trace } from "./trace";
import type { Algorithm } from "./types";

export const bfs: Algorithm = {
  id: "bfs",
  name: "Breadth-first search",
  description: "Numbers vertices in the order a queue first reaches them. B[v] = 0 means v has no number yet.",
  needsSource: true,
  pseudocode: [
    { id: "init", text: "initialize array B of length n with 0" },
    { id: "init", text: "initialize empty queue Q" },
    { id: "start", text: "Q.push(s)" },
    { id: "start", text: "num ← 1" },
    { id: "start", text: "B[s] ← num" },
    { id: "while", text: "while Q is not empty" },
    { id: "pop", text: "current ← Q.pop()", indent: 1 },
    { id: "for", text: "for each entry i in A[current]", indent: 1 },
    { id: "if", text: "if B[i] = 0", indent: 2 },
    { id: "discover", text: "num ← num + 1", indent: 3 },
    { id: "discover", text: "Q.push(i)", indent: 3 },
    { id: "discover", text: "B[i] ← num", indent: 3 },
    { id: "note", text: "k: number of neighbors of i", indent: 1 },
  ],
  examples: [sixVertices, nineVertices],
  run(graph, sourceId) {
    const t = trace(graph, "queue");
    if (sourceId === undefined || t.nodes[sourceId] === undefined) {
      throw new Error("BFS needs a source vertex that exists in the graph.");
    }

    const source = t.label(sourceId);
    t.save("init", "Initialization", `B has one 0 for each vertex, and Q is empty. 0 means the vertex has not been numbered. Search begins at ${source}.`);

    t.push(sourceId);
    t.nodes[sourceId] = "frontier";
    let num = 1;
    t.numbers[sourceId] = num;
    t.save("start", `Start at ${source}`, `${source} is pushed onto Q, num is 1, and B[${source}] is 1.`);

    let finished: NodeId | undefined;
    while (t.items.length > 0) {
      const current = t.pop();
      if (current === undefined) {
        break;
      }
      if (finished !== undefined) {
        t.nodes[finished] = "visited";
      }
      t.nodes[current] = "current";
      const name = t.label(current);
      t.save(["while", "pop"], `current ← ${name}`, `Q is not empty. ${name} leaves the front.`);

      for (const next of neighbors(graph, current)) {
        const neighbor = t.label(next.nodeId);
        const already = t.numbers[next.nodeId];
        if (already === undefined) {
          num += 1;
          t.push(next.nodeId);
          t.nodes[next.nodeId] = "frontier";
          t.edges[next.edge.id] = "tree";
          t.numbers[next.nodeId] = num;
          t.save(
            ["for", "if", "discover"],
            `Number ${neighbor}`,
            `B[${neighbor}] was 0. num is ${num}, ${neighbor} joins the back of Q, and B[${neighbor}] is ${num}.`,
          );
        } else {
          if (t.edges[next.edge.id] !== "tree") {
            t.edges[next.edge.id] = "rejected";
          }
          t.save(["for", "if"], `Skip ${neighbor}`, `B[${neighbor}] is already ${already}, so the body is skipped.`);
        }
      }
      finished = current;
    }

    if (finished !== undefined) {
      t.nodes[finished] = "visited";
    }
    t.nodes[sourceId] = "source";
    const order = graph.nodes
      .filter((node) => t.numbers[node.id] !== undefined)
      .map((node) => `${node.label} is ${t.numbers[node.id]}`)
      .join(", ");
    t.save("while", "Queue empty", `Q is empty, so the loop ends. ${order}.`);
    return t.finish();
  },
};
