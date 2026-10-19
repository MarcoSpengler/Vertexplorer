<script setup lang="ts">
defineProps<{
  errors: readonly string[];
}>();
</script>

<template>
  <div
    v-if="errors.length > 0"
    class="border-b border-[var(--app-line)] bg-[var(--sem-node-sink-fill)] px-4 py-2 text-sm"
    role="alert"
  >
    <p v-for="error in errors" :key="error">{{ error }}</p>
  </div>
</template>
