<script setup lang="ts">
import { computed, onMounted, onUnmounted, watch } from "vue";
import { ChevronLeft, ChevronRight, Pause, Play, SkipBack, SkipForward } from "lucide-vue-next";
import { PLAYBACK_SPEEDS, useAppStore, type SpeedId } from "../store/useAppStore";

const store = useAppStore();
const total = computed(() => store.steps.length);
const atStart = computed(() => store.stepIndex <= 0);
const atEnd = computed(() => total.value === 0 || store.stepIndex >= total.value - 1);
const label = computed(() => (total.value === 0 ? "Step 0 / 0" : `Step ${store.stepIndex + 1} / ${total.value}`));

watch(
  () => [store.playing, store.speedId] as const,
  ([playing, speedId], _previous, onCleanup) => {
    if (!playing) {
      return;
    }
    const speed = PLAYBACK_SPEEDS.find((item) => item.id === speedId) ?? PLAYBACK_SPEEDS[1];
    const intervalMs = speed?.intervalMs ?? 800;
    const timer = window.setInterval(() => {
      if (store.stepIndex >= store.steps.length - 1) {
        store.pause();
        return;
      }
      store.stepIndex += 1;
    }, intervalMs);
    onCleanup(() => window.clearInterval(timer));
  },
  { immediate: true },
);

function onKey(event: KeyboardEvent) {
  const target = event.target;
  if (target instanceof HTMLElement && target.closest("input, select, textarea, button, a") !== null) {
    return;
  }
  if (event.key === "ArrowLeft") {
    event.preventDefault();
    store.setStep(store.stepIndex - 1);
  } else if (event.key === "ArrowRight") {
    event.preventDefault();
    store.setStep(store.stepIndex + 1);
  } else if (event.key === "Home") {
    event.preventDefault();
    store.setStep(0);
  } else if (event.key === "End") {
    event.preventDefault();
    store.setStep(store.steps.length - 1);
  } else if (event.key === " ") {
    event.preventDefault();
    store.togglePlay();
  }
}

function onScrub(event: Event) {
  const target = event.target;
  if (target instanceof HTMLInputElement) {
    store.setStep(Number(target.value));
  }
}

function selectSpeed(id: SpeedId) {
  store.setSpeed(id);
}

onMounted(() => window.addEventListener("keydown", onKey));
onUnmounted(() => window.removeEventListener("keydown", onKey));
</script>

<template>
  <footer class="shrink-0 border-t border-[var(--app-line)] bg-[var(--app-surface)] px-4 py-3">
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        aria-label="First step"
        :disabled="atStart"
        class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--app-line)] bg-[var(--app-surface)] disabled:opacity-40"
        @click="store.setStep(0)"
      >
        <SkipBack aria-hidden="true" :size="16" />
      </button>
      <button
        type="button"
        aria-label="Previous step"
        :disabled="atStart"
        class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--app-line)] bg-[var(--app-surface)] disabled:opacity-40"
        @click="store.setStep(store.stepIndex - 1)"
      >
        <ChevronLeft aria-hidden="true" :size="18" />
      </button>
      <button
        type="button"
        :aria-label="store.playing ? 'Pause' : 'Play'"
        :disabled="total === 0"
        class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--app-line)] bg-[var(--app-surface)] disabled:opacity-40"
        @click="store.togglePlay"
      >
        <Pause v-if="store.playing" aria-hidden="true" :size="16" />
        <Play v-else aria-hidden="true" :size="16" />
      </button>
      <button
        type="button"
        aria-label="Next step"
        :disabled="atEnd"
        class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--app-line)] bg-[var(--app-surface)] disabled:opacity-40"
        @click="store.setStep(store.stepIndex + 1)"
      >
        <ChevronRight aria-hidden="true" :size="18" />
      </button>
      <button
        type="button"
        aria-label="Last step"
        :disabled="atEnd"
        class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--app-line)] bg-[var(--app-surface)] disabled:opacity-40"
        @click="store.setStep(total - 1)"
      >
        <SkipForward aria-hidden="true" :size="16" />
      </button>
      <p class="w-24 text-center text-sm tabular-nums" aria-live="polite">{{ label }}</p>
      <input
        class="scrubber min-w-32 flex-1"
        type="range"
        :min="0"
        :max="Math.max(total - 1, 0)"
        :value="total === 0 ? 0 : store.stepIndex"
        :disabled="total === 0"
        aria-label="Current step"
        :aria-valuemin="total === 0 ? 0 : 1"
        :aria-valuemax="Math.max(total, 0)"
        :aria-valuenow="total === 0 ? 0 : store.stepIndex + 1"
        :aria-valuetext="label"
        @input="onScrub"
      />
      <div class="flex items-center gap-1" role="group" aria-label="Playback speed">
        <button
          v-for="speed in PLAYBACK_SPEEDS"
          :key="speed.id"
          type="button"
          :aria-pressed="speed.id === store.speedId"
          class="h-8 rounded-md border border-[var(--app-line)] px-2 text-xs"
          :style="{
            background: speed.id === store.speedId ? 'var(--app-accent-soft)' : 'var(--app-surface)',
          }"
          @click="selectSpeed(speed.id)"
        >
          {{ speed.label }}
        </button>
      </div>
    </div>
    <p class="mt-2 text-xs text-[var(--app-muted)]">
      Arrange lets vertices repel and edges tug until the drawing settles. Drag a vertex while
      that runs to pin it. When an algorithm needs a source, click a vertex to set it. Keys: left,
      right, space, home, end.
    </p>
  </footer>
</template>
