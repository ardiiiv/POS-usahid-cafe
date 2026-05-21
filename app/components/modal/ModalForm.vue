<script setup>
const open = defineModel();
const porps = defineProps({
  title: { type: String, default: "" },
});
</script>

<template>
  <UModal v-model:open="open" :title="title">
    <template #default>
      <slot name="trigger" />
    </template>

    <template #body>
      <slot />
    </template>
  </UModal>
</template>
