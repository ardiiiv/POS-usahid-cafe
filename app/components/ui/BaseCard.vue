<script setup>
const props = defineProps({
  ui: {
    type: Object,
    default: {},
  },
});
</script>

<template>
  <UCard variant="outline" class="hover:shadow-md transition-shadow" :ui="ui">
    <slot />
  </UCard>
</template>
