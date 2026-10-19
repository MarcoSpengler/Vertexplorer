<script setup lang="ts">
import { computed } from "vue";
import { EDGE_STATES, NODE_STATES, type Step } from "../core/types";
import { EDGE_STYLES, NODE_STYLES } from "../theme/semantics";

const props = defineProps<{
  steps: readonly Step[];
}>();

const nodeStates = computed(() => {
  const nodes = new Set(props.steps.flatMap((step) => Object.values(step.nodes)));
  return NODE_STATES.filter((state) => nodes.has(state));
});

const edgeStates = computed(() => {
  const edges = new Set(props.steps.flatMap((step) => Object.values(step.edges)));
  return EDGE_STATES.filter((state) => edges.has(state));
});
</script>

<template>
  <section class="min-w-56" aria-label="Legend">
    <h2 class="mb-2 text-xs font-semibold tracking-wide text-[var(--app-muted)] uppercase">Legend</h2>
    <ul class="flex flex-nowrap gap-x-3">
      <li v-for="state in nodeStates" :key="state" class="flex items-center gap-2 text-sm">
        <span
          class="inline-block h-3.5 w-3.5 rounded-full border-2"
          :style="{ background: NODE_STYLES[state].fill, borderColor: NODE_STYLES[state].stroke }"
        />
        <span>{{ NODE_STYLES[state].label }}</span>
      </li>
      <li v-for="state in edgeStates" :key="state" class="flex items-center gap-2 text-sm">
        <span
          class="inline-block w-6 border-t-2"
          :style="{
            borderColor: EDGE_STYLES[state].stroke,
            borderTopStyle: EDGE_STYLES[state].dashed ? 'dashed' : 'solid',
          }"
        />
        <span>{{ EDGE_STYLES[state].label }}</span>
      </li>
    </ul>
  </section>
</template>
