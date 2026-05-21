<script setup>
const emit = defineEmits(["submit"]);
</script>

<template>
  <UForm
    class="flex flex-col gap-5 w-full mx-auto md:pb-0 pb-4"
    @submit="emit('submit')"
  >
    <slot />
  </UForm>
</template>
