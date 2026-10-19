<script setup lang="ts">
import { computed } from "vue";
import { Moon, Sun } from "lucide-vue-next";
import { algorithms, getAlgorithm } from "../algorithms/registry";
import { useAppStore } from "../store/useAppStore";

const store = useAppStore();
const algorithm = computed(() => getAlgorithm(store.algorithmId));
const examples = computed(() => algorithm.value?.examples ?? []);
const example = computed(() => examples.value.find((item) => item.id === store.exampleId));

function onAlgorithmChange(event: Event) {
  const target = event.target;
  if (target instanceof HTMLSelectElement) {
    store.setAlgorithm(target.value);
  }
}

function onExampleChange(event: Event) {
  const target = event.target;
  if (target instanceof HTMLSelectElement) {
    store.setExample(target.value);
  }
}
</script>

<template>
  <header class="flex flex-wrap items-end gap-x-4 gap-y-3 border-b border-[var(--app-line)] px-4 py-3">
    <div class="mr-auto min-w-48">
      <p class="text-xs font-semibold tracking-wide text-[var(--app-muted)] uppercase">
        Graph algorithms
      </p>
      <p class="max-w-xl text-sm text-[var(--app-muted)]">
        {{ example?.description ?? algorithm?.description }}
      </p>
    </div>
    <label class="flex flex-col gap-1 text-xs text-[var(--app-muted)]">
      Algorithm
      <select
        class="h-9 min-w-48 rounded-md border border-[var(--app-line)] bg-[var(--app-surface)] px-2 text-sm text-[var(--app-ink)]"
        :value="store.algorithmId"
        aria-label="Algorithm"
        @change="onAlgorithmChange"
      >
        <option v-for="item in algorithms" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>
    </label>
    <label class="flex flex-col gap-1 text-xs text-[var(--app-muted)]">
      Example
      <select
        class="h-9 min-w-56 rounded-md border border-[var(--app-line)] bg-[var(--app-surface)] px-2 text-sm text-[var(--app-ink)]"
        :value="store.exampleId"
        aria-label="Example graph"
        @change="onExampleChange"
      >
        <option v-for="item in examples" :key="item.id" :value="item.id">
          {{ item.name }}
        </option>
      </select>
    </label>
    <button
      type="button"
      class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[var(--app-line)] bg-[var(--app-surface)]"
      :aria-label="store.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
      @click="store.toggleTheme"
    >
      <Sun v-if="store.theme === 'dark'" aria-hidden="true" :size="16" />
      <Moon v-else aria-hidden="true" :size="16" />
    </button>
  </header>
</template>
