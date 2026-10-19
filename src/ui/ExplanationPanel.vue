<script setup lang="ts">
import type { Step } from "../core/types";

defineProps<{
  step: Step | undefined;
  index: number;
  total: number;
}>();
</script>

<template>
  <section class="min-h-0 flex-1 overflow-auto border-t border-[var(--app-line)] px-4 py-3" aria-label="Explanation">
    <p v-if="step === undefined" class="text-sm text-[var(--app-muted)]">Nothing to explain on this step.</p>
    <template v-else>
      <p class="text-xs font-semibold tracking-wide text-[var(--app-muted)] uppercase">
        Step {{ index + 1 }} of {{ total }}
      </p>
      <h2 class="mt-1 text-lg font-semibold">{{ step.title }}</h2>
      <p class="mt-2 text-sm leading-6">{{ step.text }}</p>
    </template>
  </section>
</template>
