<script setup>
import BaseButton from "../ui/BaseButton.vue";

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
  name: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue", "confirm"]);
</script>

<template>
  <UModal
    :open="modelValue"
    title="Konfirmasi Hapus"
    @update:open="emit('update:modelValue', $event)"
  >
    <template #body>
      <p class="text-sm text-gray-600 dark:text-gray-400">
        Apakah kamu yakin ingin menghapus
        <span class="font-semibold text-gray-900 dark:text-white">
          {{ name }} </span
        >? Tindakan ini tidak bisa dibatalkan.
      </p>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2">
        <BaseButton
          :color="`neutral`"
          :variant="`outline`"
          :title="`Batal`"
          @click="emit('update:modelValue', false)"
        />
        <BaseButton
          :color="`error`"
          :variant="`solid`"
          :title="`Hapus`"
          :icon="`i-lucide-trash`"
          @click="emit('confirm')"
        />
      </div>
    </template>
  </UModal>
</template>
