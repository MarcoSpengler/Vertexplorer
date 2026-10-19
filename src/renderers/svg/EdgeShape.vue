<script setup lang="ts">
import { computed } from "vue";
import type { EdgeState, GraphEdge, GraphNode } from "../../core/types";
import { edgeStyle } from "../../theme/semantics";
import { drawEdge, routeForEdge } from "../shared/geometry";
import { edgeArrows, edgeCaption } from "../shared/visual";

const props = defineProps<{
  edge: GraphEdge;
  edges: readonly GraphEdge[];
  directed: boolean;
  state: EdgeState | undefined;
  source: GraphNode | undefined;
  target: GraphNode | undefined;
}>();

const drawn = computed(() => {
  if (props.source === undefined || props.target === undefined) {
    return null;
  }
  const route = routeForEdge(props.edge, props.edges);
  return drawEdge(props.source, props.target, route.route, route.side);
});

const paint = computed(() => edgeStyle(props.state));
const caption = computed(() => edgeCaption(props.edge));
const arrows = computed(() => edgeArrows(props.directed));
const captionWidth = computed(() => {
  const text = caption.value;
  return text === undefined ? 0 : Math.max(22, text.length * 8 + 12);
});
</script>

<template>
  <g v-if="drawn !== null && source !== undefined && target !== undefined" pointer-events="none">
    <path
      :d="drawn.d"
      fill="none"
      :stroke="paint.stroke"
      :stroke-width="state === 'tree' ? 2.75 : 1.75"
      :stroke-dasharray="paint.dashed ? '7 5' : undefined"
      :marker-end="arrows.end ? 'url(#graph-arrow)' : undefined"
      :style="{ transition: 'stroke 180ms ease' }"
    />
    <g v-if="caption !== undefined">
      <rect
        :x="drawn.label.x - captionWidth / 2"
        :y="drawn.label.y - 9"
        :width="captionWidth"
        height="18"
        rx="4"
        fill="var(--app-surface)"
        stroke="var(--app-line)"
      />
      <text
        :x="drawn.label.x"
        :y="drawn.label.y"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="12"
        fill="var(--app-ink)"
      >
        {{ caption }}
      </text>
    </g>
  </g>
</template>
