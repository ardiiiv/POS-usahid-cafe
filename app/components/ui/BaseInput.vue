<script setup>
const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  title: {
    type: String,
    default: "...",
  },
  name: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "",
  },
  minlength: {
    type: Number,
    default: 0,
  },
  readOnly: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <UFormField
    :label="title"
    :name="name"
    :required="required"
    class="text-base"
  >
    <UInput
      :value="modelValue"
      :type="type"
      class="w-full"
      :placeholder="placeholder"
      size="xl"
      :minlength="minlength"
      :readonly="readOnly"
      @input="emit('update:modelValue', $event.target.value)"
    />
  </UFormField>
</template>
