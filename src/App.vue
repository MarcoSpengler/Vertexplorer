<script setup lang="ts">
import { computed, watch } from "vue";
import { getAlgorithm } from "./algorithms/registry";
import Legend from "./panels/Legend.vue";
import QueuePanel from "./panels/QueuePanel.vue";
import CanvasStage from "./renderers/CanvasStage.vue";
import { EMPTY_VIEW } from "./renderers/types";
import { useAppStore } from "./store/useAppStore";
import ExplanationPanel from "./ui/ExplanationPanel.vue";
import Player from "./ui/Player.vue";
import PseudocodePanel from "./ui/PseudocodePanel.vue";
import TopBar from "./ui/TopBar.vue";
import { useArrangeGraph } from "./ui/useArrangeGraph";
import ValidationBanner from "./ui/ValidationBanner.vue";

const store = useAppStore();
const algorithm = computed(() => getAlgorithm(store.algorithmId));
const step = computed(() => store.steps[store.stepIndex]);
const view = computed(() => {
  const current = step.value;
  if (current === undefined) {
    return EMPTY_VIEW;
  }
  return { nodes: current.nodes, edges: current.edges, numbers: current.numbers };
});
const { arranging, arrange, stop } = useArrangeGraph();

watch(
  () => store.theme,
  (theme) => {
    document.documentElement.dataset.theme = theme;
  },
  { immediate: true },
);
</script>

<template>
  <div class="flex h-svh flex-col overflow-hidden bg-[var(--app-bg)] text-[var(--app-ink)]">
    <TopBar />
    <ValidationBanner :errors="store.validationErrors" />
    <div class="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_22rem] lg:grid-rows-1">
      <section class="flex min-h-0 flex-col overflow-hidden">
        <div class="min-h-0 flex-1 overflow-hidden">
          <CanvasStage
            :graph="store.graph"
            :view="view"
            :needs-source="algorithm?.needsSource === true"
            :fit-token="`${store.algorithmId}:${store.exampleId}`"
            :arranging="arranging"
            @arrange="arrange"
            @stop-arrange="stop"
          />
        </div>
        <div class="flex shrink-0 items-start gap-6 overflow-x-auto border-t border-[var(--app-line)] px-4 py-3">
          <QueuePanel :pile="step?.pile ?? 'queue'" :items="step?.items ?? []" :value-name="step?.valueName" />
          <Legend :steps="store.steps" />
        </div>
      </section>
      <aside class="flex min-h-0 flex-col overflow-hidden border-t border-[var(--app-line)] lg:border-t-0 lg:border-l">
        <PseudocodePanel :lines="algorithm?.pseudocode ?? []" :active="step?.line" />
        <ExplanationPanel :step="step" :index="store.stepIndex" :total="store.steps.length" />
      </aside>
    </div>
    <Player />
  </div>
</template>
