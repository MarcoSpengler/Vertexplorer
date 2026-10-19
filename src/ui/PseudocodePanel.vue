<script setup lang="ts">
import { computed, ref, watch } from "vue";
import type { PseudocodeLine } from "../algorithms/types";

const props = defineProps<{
  lines: readonly PseudocodeLine[];
  active: string | readonly string[] | undefined;
}>();

const currentRef = ref<HTMLLIElement | null>(null);

const activeIds = computed(() => {
  const active = props.active;
  if (active === undefined) {
    return new Set<string>();
  }
  return new Set(typeof active === "string" ? [active] : active);
});

const activeKey = computed(() => {
  const active = props.active;
  if (active === undefined) {
    return "";
  }
  return typeof active === "string" ? active : active.join(",");
});

const firstActiveIndex = computed(() => props.lines.findIndex((line) => activeIds.value.has(line.id)));

function bindCurrent(element: unknown) {
  currentRef.value = element instanceof HTMLLIElement ? element : null;
}

watch(
  activeKey,
  () => {
    currentRef.value?.scrollIntoView({ block: "nearest" });
  },
  { flush: "post", immediate: true },
);
</script>

<template>
  <section class="min-h-0 flex-1 overflow-auto px-4 py-3" aria-label="Pseudocode">
    <h2 class="mb-2 text-xs font-semibold tracking-wide text-[var(--app-muted)] uppercase">Pseudocode</h2>
    <ol class="font-mono text-sm leading-6">
      <li
        v-for="(line, index) in lines"
        :key="`${line.id}-${index}`"
        :ref="index === firstActiveIndex ? bindCurrent : undefined"
        :aria-current="activeIds.has(line.id) ? 'step' : undefined"
        class="rounded-sm pr-2"
        :style="{
          paddingLeft: `${0.4 + (line.indent ?? 0)}rem`,
          background: activeIds.has(line.id) ? 'var(--app-accent-soft)' : undefined,
          boxShadow: activeIds.has(line.id) ? 'inset 3px 0 0 var(--app-accent)' : undefined,
        }"
      >
        <span class="mr-3 inline-block w-5 text-right text-xs text-[var(--app-muted)]">{{ index + 1 }}</span>
        {{ line.text }}
      </li>
    </ol>
  </section>
</template>
