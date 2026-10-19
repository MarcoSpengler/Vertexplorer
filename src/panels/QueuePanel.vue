<script setup lang="ts">
import { computed } from "vue";
import type { Pile, PileItem } from "../core/types";

const props = withDefaults(
  defineProps<{
    pile: Pile;
    items: readonly PileItem[];
    valueName?: string;
  }>(),
  { valueName: "B" },
);

const title = computed(() => (props.pile === "stack" ? "Stack" : "Queue"));
const end = computed(() => (props.pile === "stack" ? "top" : "front"));
</script>

<template>
  <section class="min-w-56" :aria-label="title">
    <h2 class="mb-2 text-xs font-semibold tracking-wide text-[var(--app-muted)] uppercase">{{ title }}</h2>
    <p v-if="items.length === 0" class="text-sm text-[var(--app-muted)]">The {{ title.toLowerCase() }} is empty.</p>
    <ol v-else class="flex flex-wrap gap-2">
      <li
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="rounded-md border px-2 py-1 text-sm"
        :style="{
          background: 'var(--sem-node-frontier-fill)',
          borderColor: 'var(--sem-node-frontier-stroke)',
          color: 'var(--sem-node-frontier-text)',
        }"
      >
        <span class="font-semibold">{{ item.label }}</span>
        <span v-if="item.value !== undefined" class="ml-2 text-xs">{{ valueName }} = {{ item.value }}</span>
        <span v-if="index === 0" class="ml-2 text-xs tracking-wide uppercase">{{ end }}</span>
      </li>
    </ol>
  </section>
</template>
