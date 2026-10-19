<script setup lang="ts">
import { computed } from "vue";
import type { GraphNode, NodeId, NodeState } from "../../core/types";
import { nodeStyle } from "../../theme/semantics";
import { NODE_RADIUS } from "../shared/geometry";

const props = defineProps<{
  node: GraphNode;
  state: NodeState | undefined;
  layer: number | undefined;
  needsSource: boolean;
}>();

const emit = defineEmits<{
  pointerDown: [event: PointerEvent];
  selectSource: [id: NodeId];
}>();

const paint = computed(() => nodeStyle(props.state));
const strokeWidth = computed(() => (props.state === "current" || props.state === "source" ? 3 : 1.75));
const badge = computed(() => (props.layer === undefined ? undefined : String(props.layer)));
const badgeWidth = computed(() => {
  const text = badge.value;
  return text === undefined ? 0 : Math.max(18, text.length * 8 + 10);
});
const label = computed(() =>
  props.needsSource ? `Vertex ${props.node.label}. Activate to set the source.` : `Vertex ${props.node.label}`,
);

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== "Enter" && event.key !== " ") {
    return;
  }
  event.preventDefault();
  event.stopPropagation();
  if (props.needsSource) {
    emit("selectSource", props.node.id);
  }
}
</script>

<template>
  <g
    data-vertex="true"
    :transform="`translate(${node.x} ${node.y})`"
    role="button"
    tabindex="0"
    :aria-label="label"
    :style="{ cursor: needsSource ? 'pointer' : 'grab' }"
    @pointerdown="emit('pointerDown', $event)"
    @keydown="onKeyDown"
  >
    <circle
      :r="NODE_RADIUS"
      :fill="paint.fill"
      :stroke="paint.stroke"
      :stroke-width="strokeWidth"
      :style="{ transition: 'fill 180ms ease, stroke 180ms ease' }"
    />
    <text
      text-anchor="middle"
      dominant-baseline="middle"
      font-size="15"
      font-weight="600"
      :fill="paint.text"
      pointer-events="none"
    >
      {{ node.label }}
    </text>
    <g v-if="badge !== undefined" pointer-events="none">
      <rect
        :x="NODE_RADIUS * 0.35"
        :y="NODE_RADIUS * 0.35"
        :width="badgeWidth"
        height="16"
        rx="8"
        fill="var(--app-surface)"
        :stroke="paint.stroke"
      />
      <text
        :x="NODE_RADIUS * 0.35 + badgeWidth / 2"
        :y="NODE_RADIUS * 0.35 + 8"
        text-anchor="middle"
        dominant-baseline="middle"
        font-size="10"
        fill="var(--app-ink)"
      >
        {{ badge }}
      </text>
    </g>
  </g>
</template>
