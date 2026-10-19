<script setup lang="ts">
import { computed } from "vue";
import { Magnet } from "lucide-vue-next";
import type { GraphRendererProps } from "./types";
import SvgRenderer from "./svg/SvgRenderer.vue";

const props = defineProps<GraphRendererProps & { arranging: boolean }>();

const emit = defineEmits<{
  arrange: [];
  stopArrange: [];
}>();

const canArrange = computed(() => props.graph.nodes.length > 0);
</script>

<template>
  <div class="flex h-full min-h-0 flex-col">
    <div class="flex shrink-0 items-center gap-3 border-b border-[var(--app-line)] px-3 py-2">
      <button
        type="button"
        :aria-pressed="arranging"
        :disabled="!canArrange"
        class="inline-flex h-8 items-center gap-1.5 rounded-md border border-[var(--app-line)] px-2.5 text-xs disabled:opacity-40"
        :style="{ background: arranging ? 'var(--app-accent-soft)' : 'var(--app-surface)' }"
        @click="arranging ? emit('stopArrange') : emit('arrange')"
      >
        <Magnet aria-hidden="true" :size="14" />
        {{ arranging ? "Stop" : "Arrange" }}
      </button>
    </div>
    <div class="min-h-0 flex-1">
      <SvgRenderer
        :graph="graph"
        :view="view"
        :needs-source="needsSource"
        :fit-token="fitToken"
        :arranging="arranging"
      />
    </div>
  </div>
</template>
