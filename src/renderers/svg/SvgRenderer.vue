<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior, type ZoomTransform } from "d3-zoom";
import { LocateFixed, Minus, Plus } from "lucide-vue-next";
import type { GraphNode, NodeId } from "../../core/types";
import { useAppStore } from "../../store/useAppStore";
import type { GraphRendererProps } from "../types";
import { NODE_RADIUS } from "../shared/geometry";
import { edgeRank } from "../shared/visual";
import EdgeShape from "./EdgeShape.vue";
import NodeShape from "./NodeShape.vue";

const MIN_SCALE = 0.25;
const MAX_SCALE = 3.5;

interface NodeDrag {
  pointerId: number;
  id: NodeId;
  originX: number;
  originY: number;
  nodeX: number;
  nodeY: number;
  moved: boolean;
}

const props = defineProps<GraphRendererProps & { arranging: boolean }>();
const store = useAppStore();

const svgRef = ref<SVGSVGElement | null>(null);
let zoomBehavior: ZoomBehavior<SVGSVGElement, unknown> | null = null;
let resizeObserver: ResizeObserver | null = null;
let nodes = props.graph.nodes;
let transformState: ZoomTransform = zoomIdentity;
let fitted = false;
let wasArranging = false;
let drag: NodeDrag | null = null;
const transform = ref<ZoomTransform>(zoomIdentity);

const orderedEdges = computed(() =>
  [...props.graph.edges].sort(
    (left, right) => edgeRank(props.view.edges[left.id]) - edgeRank(props.view.edges[right.id]),
  ),
);

function fit() {
  const svg = svgRef.value;
  const behavior = zoomBehavior;
  const next = svg === null || behavior === null ? null : viewTransform(svg, nodes);
  if (svg === null || behavior === null || next === null) {
    return;
  }
  select(svg).call(behavior.transform, next);
  fitted = true;
}

function zoomBy(factor: number) {
  const svg = svgRef.value;
  const behavior = zoomBehavior;
  if (svg === null || behavior === null) {
    return;
  }
  select(svg).call(behavior.scaleBy, factor);
}

function onNodePointerDown(event: PointerEvent, node: GraphNode) {
  if (event.button !== 0) {
    return;
  }
  event.stopPropagation();
  const target = event.currentTarget;
  if (target instanceof Element) {
    target.setPointerCapture(event.pointerId);
  }
  drag = {
    pointerId: event.pointerId,
    id: node.id,
    originX: event.clientX,
    originY: event.clientY,
    nodeX: node.x,
    nodeY: node.y,
    moved: false,
  };
}

function onPointerMove(event: PointerEvent) {
  if (drag === null || drag.pointerId !== event.pointerId) {
    return;
  }
  const dx = event.clientX - drag.originX;
  const dy = event.clientY - drag.originY;
  if (Math.hypot(dx, dy) > 3) {
    drag.moved = true;
  }
  const k = transformState.k;
  store.moveNode(drag.id, drag.nodeX + dx / k, drag.nodeY + dy / k);
}

function onPointerUp(event: PointerEvent) {
  if (drag === null || drag.pointerId !== event.pointerId) {
    return;
  }
  const finished = drag;
  drag = null;
  if (!finished.moved && props.needsSource) {
    store.setSource(finished.id);
  }
}

watch(
  () => props.graph.nodes,
  (next) => {
    nodes = next;
  },
  { immediate: true },
);

watch(
  () => props.fitToken,
  () => {
    fitted = false;
    fit();
  },
  { flush: "post", immediate: true },
);

watch(
  () => props.arranging,
  (arranging) => {
    if (wasArranging && !arranging) {
      fit();
    }
    wasArranging = arranging;
  },
  { flush: "post", immediate: true },
);

onMounted(() => {
  const svg = svgRef.value;
  if (svg === null) {
    return;
  }
  const behavior = zoom<SVGSVGElement, unknown>()
    .scaleExtent([MIN_SCALE, MAX_SCALE])
    .extent(function () {
      const box = this.getBoundingClientRect();
      return [
        [0, 0],
        [box.width, box.height],
      ];
    })
    .filter((event: { type: string; ctrlKey?: boolean; button?: number; target: EventTarget | null }) => {
      const onVertex =
        event.type !== "wheel" &&
        event.target instanceof Element &&
        event.target.closest("[data-vertex]") !== null;
      return !onVertex && (!event.ctrlKey || event.type === "wheel") && !event.button;
    })
    .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
      transformState = event.transform;
      transform.value = event.transform;
    });
  const selection = select(svg);
  selection.call(behavior);
  selection.on("dblclick.zoom", null);
  zoomBehavior = behavior;
  fit();

  resizeObserver = new ResizeObserver(() => {
    if (!fitted) {
      fit();
    }
  });
  resizeObserver.observe(svg);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  const svg = svgRef.value;
  if (svg !== null) {
    select(svg).on(".zoom", null);
  }
  zoomBehavior = null;
});

/** The transform that puts every vertex inside the svg, with a margin. */
function viewTransform(svg: SVGSVGElement, graphNodes: readonly GraphNode[]): ZoomTransform | null {
  const { width, height } = svg.getBoundingClientRect();
  if (width === 0 || height === 0 || graphNodes.length === 0) {
    return null;
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const node of graphNodes) {
    minX = Math.min(minX, node.x - NODE_RADIUS);
    minY = Math.min(minY, node.y - NODE_RADIUS - 48);
    maxX = Math.max(maxX, node.x + NODE_RADIUS + 28);
    maxY = Math.max(maxY, node.y + NODE_RADIUS + 40);
  }
  const pad = 32;
  const graphWidth = Math.max(maxX - minX, 1);
  const graphHeight = Math.max(maxY - minY, 1);
  const k = Math.min(
    MAX_SCALE,
    Math.max(MIN_SCALE, Math.min((width - pad * 2) / graphWidth, (height - pad * 2) / graphHeight)),
  );
  return zoomIdentity
    .translate((width - graphWidth * k) / 2 - minX * k, (height - graphHeight * k) / 2 - minY * k)
    .scale(k);
}
</script>

<template>
  <div class="relative h-full min-h-0 overflow-hidden">
    <svg
      ref="svgRef"
      class="h-full w-full touch-none select-none"
      role="application"
      aria-label="Graph canvas"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
    >
      <rect width="100%" height="100%" fill="var(--app-canvas)" />
      <g :transform="transform.toString()">
        <defs>
          <pattern id="graph-dots" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="var(--app-line)" />
          </pattern>
          <marker
            id="graph-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" fill="context-stroke" />
          </marker>
        </defs>
        <rect x="-2000" y="-2000" width="6000" height="6000" fill="url(#graph-dots)" pointer-events="none" />
        <EdgeShape
          v-for="edge in orderedEdges"
          :key="edge.id"
          :edge="edge"
          :edges="graph.edges"
          :directed="graph.directed"
          :state="view.edges[edge.id]"
          :source="graph.nodes.find((node) => node.id === edge.source)"
          :target="graph.nodes.find((node) => node.id === edge.target)"
        />
        <NodeShape
          v-for="node in graph.nodes"
          :key="node.id"
          :node="node"
          :state="view.nodes[node.id]"
          :layer="view.numbers[node.id]"
          :needs-source="needsSource"
          @pointer-down="onNodePointerDown($event, node)"
          @select-source="store.setSource"
        />
      </g>
    </svg>
    <div class="absolute top-3 right-3 flex flex-col gap-1">
      <button
        type="button"
        aria-label="Zoom in"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--app-line)] bg-[var(--app-surface)] text-[var(--app-ink)] shadow-sm"
        @click="zoomBy(1.15)"
      >
        <Plus aria-hidden="true" :size="16" />
      </button>
      <button
        type="button"
        aria-label="Zoom out"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--app-line)] bg-[var(--app-surface)] text-[var(--app-ink)] shadow-sm"
        @click="zoomBy(1 / 1.15)"
      >
        <Minus aria-hidden="true" :size="16" />
      </button>
      <button
        type="button"
        aria-label="Fit view"
        class="inline-flex h-8 w-8 items-center justify-center rounded-md border border-[var(--app-line)] bg-[var(--app-surface)] text-[var(--app-ink)] shadow-sm"
        @click="fit"
      >
        <LocateFixed aria-hidden="true" :size="16" />
      </button>
    </div>
  </div>
</template>
