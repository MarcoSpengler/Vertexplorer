import { neighbors } from "../core/graph";
import type { NodeId } from "../core/types";
import { nineVertices, sixVertices } from "./samples";
import { trace } from "./trace";
import type { Algorithm } from "./types";

export const dfs: Algorithm = {
  id: "dfs",
  name: "Depth-first search",
  description: "Numbers vertices in the order a stack first pops them. B[v] = 0 means v has no number yet.",
  needsSource: true,
  pseudocode: [
    { id: "init", text: "initialize array B of length n with 0" },
    { id: "init", text: "initialize empty stack S" },
    { id: "start", text: "S.push(s)" },
    { id: "start", text: "num ← 1" },
    { id: "while", text: "while S is not empty" },
    { id: "pop", text: "current ← S.pop()", indent: 1 },
    { id: "if-current", text: "if B[current] = 0", indent: 1 },
    { id: "enter", text: "B[current] ← num", indent: 2 },
    { id: "enter", text: "num ← num + 1", indent: 2 },
    { id: "for", text: "for each entry i in A[current]", indent: 2 },
    { id: "if-neighbor", text: "if B[i] = 0", indent: 3 },
    { id: "push", text: "S.push(i)", indent: 4 },
  ],
  examples: [sixVertices, nineVertices],
  run(graph, sourceId) {
    const t = trace(graph, "stack");
    if (sourceId === undefined || t.nodes[sourceId] === undefined) {
      throw new Error("DFS needs a source vertex that exists in the graph.");
    }

    const source = t.label(sourceId);
    t.save("init", "Initialization", `B has one 0 for each vertex, and S is empty. 0 means the vertex has not been numbered. Search begins at ${source}.`);

    // Each stack entry remembers the edge that pushed it. The tree edge is that edge on the copy popped while B is still 0.
    const via: ({ edgeId: string; from: NodeId } | undefined)[] = [];
    function push(id: NodeId, along?: { edgeId: string; from: NodeId }) {
      t.push(id);
      via.unshift(along);
    }
    function pop() {
      const id = t.pop();
      const along = via.shift();
      return id === undefined ? undefined : { id, along };
    }

    push(sourceId);
    t.nodes[sourceId] = "frontier";
    let num = 1;
    t.save("start", `Start at ${source}`, `${source} is the top of S and num is 1. B[${source}] is still 0 until ${source} is popped.`);

    let finished: NodeId | undefined;
    while (t.items.length > 0) {
      const entry = pop();
      if (entry === undefined) {
        break;
      }
      const current = entry.id;
      if (finished !== undefined && t.nodes[finished] === "current") {
        t.nodes[finished] = "visited";
      }
      const name = t.label(current);
      const seen = t.numbers[current];
      t.nodes[current] = "current";
      t.save(["while", "pop"], `current ← ${name}`, `S is not empty. ${name} leaves the top.`);

      if (seen === undefined) {
        if (entry.along !== undefined) {
          t.edges[entry.along.edgeId] = "tree";
        }
        t.numbers[current] = num;
        num += 1;
        const arrived = entry.along === undefined ? "" : ` The edge from ${t.label(entry.along.from)} is a tree edge.`;
        t.save(["if-current", "enter"], `Number ${name}`, `B[${name}] was 0, so B[${name}] is ${num - 1} and num is now ${num}.${arrived}`);

        for (const next of neighbors(graph, current)) {
          const neighbor = t.label(next.nodeId);
          if (t.numbers[next.nodeId] === undefined) {
            push(next.nodeId, { edgeId: next.edge.id, from: current });
            if (next.nodeId !== current) {
              t.nodes[next.nodeId] = "frontier";
            }
            t.save(["for", "if-neighbor", "push"], `Push ${neighbor}`, `B[${neighbor}] is 0, so ${neighbor} is the new top of S.`);
          } else {
            if (t.edges[next.edge.id] !== "tree") {
              t.edges[next.edge.id] = "rejected";
            }
            const value = t.numbers[next.nodeId];
            t.save(["for", "if-neighbor"], `Skip ${neighbor}`, `B[${neighbor}] is already ${value}, so it is not pushed.`);
          }
        }
        finished = current;
      } else {
        if (entry.along !== undefined && t.edges[entry.along.edgeId] !== "tree") {
          t.edges[entry.along.edgeId] = "rejected";
        }
        t.nodes[current] = "visited";
        t.save("if-current", `Skip ${name}`, `${name} was popped again, but B[${name}] is already ${seen}, so the body is skipped.`);
      }
    }

    if (finished !== undefined) {
      t.nodes[finished] = "visited";
    }
    t.nodes[sourceId] = "source";
    const order = graph.nodes
      .filter((node) => t.numbers[node.id] !== undefined)
      .map((node) => `${node.label} is ${t.numbers[node.id]}`)
      .join(", ");
    t.save("while", "Stack empty", `S is empty, so the loop ends. ${order}.`);
    return t.finish();
  },
};
