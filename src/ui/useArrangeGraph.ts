import { ref, watch } from "vue";
import { startLayout, type Layout } from "../core/layout/force";
import { useAppStore } from "../store/useAppStore";

/**
 * Plays the force layout into the store.
 * Each frame writes coordinates only, so the current algorithm step stays put.
 */
export function useArrangeGraph() {
  const store = useAppStore();
  const arranging = ref(false);
  let layout: Layout | null = null;

  function stop() {
    const current = layout;
    layout = null;
    arranging.value = false;
    current?.on("end", null);
    current?.stop();
  }

  function arrange() {
    if (store.graph.nodes.length === 0) {
      return;
    }
    stop();
    const next = startLayout(store.graph, (positions) => store.placeNodes(positions));
    if (next === null) {
      return;
    }
    layout = next;
    arranging.value = true;
    next.on("end", () => {
      if (layout !== next) {
        return;
      }
      layout = null;
      arranging.value = false;
    });
  }

  watch(
    () => [store.algorithmId, store.exampleId] as const,
    () => {
      stop();
    },
  );

  return { arranging, arrange, stop };
}
