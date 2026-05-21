<script setup>
const props = defineProps({
  variant: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "md",
  },
  block: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: "primary",
  },
  title: {
    type: String,
    default: "...",
  },
  icon: {
    type: String,
    default: "",
  },
});
</script>

<template>
  <UButton
    :variant="variant"
    :type="type"
    :color="color"
    :size="size"
    :block="block"
    :icon="icon"
    >{{ title }}
  </UButton>
</template>
