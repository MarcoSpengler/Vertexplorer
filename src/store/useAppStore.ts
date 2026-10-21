import { defineStore } from "pinia";
import { algorithms, getAlgorithm } from "../algorithms/registry";
import type { Algorithm } from "../algorithms/types";
import { cloneGraph } from "../core/graph";
import type { Graph, NodeId, Step } from "../core/types";

export const PLAYBACK_SPEEDS = [
  { id: "slow", label: "0.5×", intervalMs: 1400 },
  { id: "normal", label: "1×", intervalMs: 800 },
  { id: "fast", label: "2×", intervalMs: 400 },
  { id: "faster", label: "4×", intervalMs: 200 },
] as const;

export type SpeedId = (typeof PLAYBACK_SPEEDS)[number]["id"];
export type ThemeMode = "light" | "dark";

interface LoadedExample {
  exampleId: string;
  graph: Graph;
  sourceId?: NodeId;
  steps: Step[];
  validationErrors: string[];
}

interface AppState extends LoadedExample {
  algorithmId: string;
  stepIndex: number;
  playing: boolean;
  speedId: SpeedId;
  theme: ThemeMode;
}

function pageTheme(): ThemeMode {
  if (typeof document === "undefined") {
    return "light";
  }
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

function execute(algorithm: Algorithm, graph: Graph, sourceId: NodeId | undefined) {
  if (algorithm.needsSource && (sourceId === undefined || graph.nodes.every((node) => node.id !== sourceId))) {
    return { steps: [] as Step[], validationErrors: ["Choose a source vertex."] };
  }
  try {
    return { steps: algorithm.run(graph, sourceId), validationErrors: [] as string[] };
  } catch (error) {
    const message = error instanceof Error ? error.message : "The algorithm failed.";
    return { steps: [] as Step[], validationErrors: [message] };
  }
}

function loadExample(algorithm: Algorithm, exampleId: string | undefined): LoadedExample {
  const example = algorithm.examples.find((item) => item.id === exampleId) ?? algorithm.examples[0];
  if (example === undefined) {
    return {
      exampleId: "",
      graph: { directed: false, nodes: [], edges: [] },
      steps: [],
      validationErrors: ["This algorithm has no example graph."],
    };
  }
  const graph = cloneGraph(example.graph);
  return {
    exampleId: example.id,
    graph,
    sourceId: example.source,
    ...execute(algorithm, graph, example.source),
  };
}

function createInitial(): LoadedExample & { algorithmId: string } {
  const algorithm = algorithms[0];
  if (algorithm === undefined) {
    return {
      algorithmId: "",
      exampleId: "",
      graph: { directed: false, nodes: [], edges: [] },
      steps: [],
      validationErrors: [],
    };
  }
  return { algorithmId: algorithm.id, ...loadExample(algorithm, undefined) };
}

export const useAppStore = defineStore("app", {
  state: (): AppState => {
    const initial = createInitial();
    return {
      algorithmId: initial.algorithmId,
      exampleId: initial.exampleId,
      graph: initial.graph,
      sourceId: initial.sourceId,
      steps: initial.steps,
      validationErrors: initial.validationErrors,
      stepIndex: 0,
      playing: false,
      speedId: "normal",
      theme: pageTheme(),
    };
  },
  actions: {
    setAlgorithm(id: string) {
      const algorithm = getAlgorithm(id);
      if (algorithm === undefined) {
        return;
      }
      this.$patch({ algorithmId: id, stepIndex: 0, playing: false, ...loadExample(algorithm, undefined) });
    },
    setExample(id: string) {
      const algorithm = getAlgorithm(this.algorithmId);
      if (algorithm === undefined) {
        return;
      }
      this.$patch({ stepIndex: 0, playing: false, ...loadExample(algorithm, id) });
    },
    setSource(id: NodeId) {
      if (this.sourceId === id) {
        return;
      }
      const algorithm = getAlgorithm(this.algorithmId);
      if (algorithm === undefined) {
        return;
      }
      const run = execute(algorithm, this.graph, id);
      this.$patch({
        sourceId: id,
        steps: run.steps,
        validationErrors: run.validationErrors,
        stepIndex: 0,
        playing: false,
      });
    },
    moveNode(id: NodeId, x: number, y: number) {
      const graph = this.graph;
      this.graph = {
        ...graph,
        nodes: graph.nodes.map((node) => (node.id === id ? { ...node, x, y } : node)),
      };
    },
    placeNodes(positions: readonly { id: NodeId; x: number; y: number }[]) {
      if (positions.length === 0) {
        return;
      }
      const byId = new Map(positions.map((position) => [position.id, position]));
      const graph = this.graph;
      this.graph = {
        ...graph,
        nodes: graph.nodes.map((node) => {
          const next = byId.get(node.id);
          return next === undefined ? node : { ...node, x: next.x, y: next.y };
        }),
      };
    },
    setStep(index: number) {
      const last = Math.max(this.steps.length - 1, 0);
      this.$patch({ stepIndex: Math.min(Math.max(index, 0), last), playing: false });
    },
    togglePlay() {
      if (this.playing) {
        this.playing = false;
        return;
      }
      if (this.steps.length === 0) {
        return;
      }
      if (this.stepIndex >= this.steps.length - 1) {
        this.$patch({ stepIndex: 0, playing: true });
        return;
      }
      this.playing = true;
    },
    pause() {
      this.playing = false;
    },
    setSpeed(speedId: SpeedId) {
      this.speedId = speedId;
    },
    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
    },
  },
});
