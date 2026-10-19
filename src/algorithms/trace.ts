import type { EdgeState, Graph, NodeId, NodeState, Pile, Step } from "../core/types";

/**
 * The picture the canvas will draw, plus the snapshots already saved.
 * Change `nodes`, `edges`, and `numbers`, push or pop, then call `save` to keep a copy.
 * Index 0 of `items` is the front of a queue or the top of a stack: the next vertex to remove.
 * `numbers` stores the named array after an entry has been written. A missing entry has not been written.
 * `valueName` is B for the numbering searches and L for shortest-path layers.
 */
export function trace(graph: Graph, pile: Pile, valueName = "B") {
  const nodes: Record<NodeId, NodeState> = {};
  for (const node of graph.nodes) {
    nodes[node.id] = "unvisited";
  }
  const edges: Record<string, EdgeState> = {};
  const numbers: Record<NodeId, number> = {};
  const items: NodeId[] = [];
  const steps: Step[] = [];

  function label(id: NodeId): string {
    return graph.nodes.find((node) => node.id === id)?.label ?? id;
  }

  return {
    nodes,
    edges,
    numbers,
    items,
    label,
    push(id: NodeId) {
      if (pile === "queue") {
        items.push(id);
      } else {
        items.unshift(id);
      }
    },
    pop(): NodeId | undefined {
      return items.shift();
    },
    save(line: string | readonly string[], title: string, text: string) {
      steps.push({
        line,
        title,
        text,
        nodes: { ...nodes },
        edges: { ...edges },
        numbers: { ...numbers },
        valueName,
        pile,
        items: items.map((id) => {
          const value = numbers[id];
          return value === undefined ? { label: label(id) } : { label: label(id), value };
        }),
      });
    },
    finish() {
      return steps;
    },
  };
}
