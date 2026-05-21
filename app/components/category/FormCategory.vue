<script setup>
import BaseForm from "../ui/BaseForm.vue";
import BaseButton from "../ui/BaseButton.vue";
import BaseInput from "../ui/BaseInput.vue";

const emit = defineEmits(["close"]);
const props = defineProps({
  mode: {
    type: String,
    default: "add",
  },
  initialState: {
    type: Object,
    default: () => ({ name: "", icon: "i-lucide-tag" }),
  },
});

const state = reactive({ ...props.initialState });

const iconOptions = [
  { label: "Tag", value: "i-lucide-tag" },
  { label: "Makanan", value: "i-lucide-utensils" },
  { label: "Minuman", value: "i-lucide-cup-soda" },
  { label: "Snack", value: "i-lucide-cookie" },
  { label: "Alat Tulis", value: "i-lucide-book" },
  { label: "Aksesoris", value: "i-lucide-handbag" },
  { label: "Print & Fotocopy", value: "i-lucide-printer" },
];

const toast = useToast();
const categories = useCategoriesStore();

async function handleSubmit() {
  if (props.mode === "edit") {
    const { success, message } = await categories.updateCategory(
      props.initialState.id,
      state,
    );
    if (success) {
      toast.add({ title: "Edit kategori berhasil.", color: "success" });
      emit("close");
    } else {
      toast.add({ title: message, color: "error" });
    }
  } else {
    const { success, message } = await categories.createCategory(state);
    if (success) {
      toast.add({ title: "Tambah kategori sukses", color: "success" });
      emit("close");
    } else {
      toast.add({ title: message, color: "error" });
    }
  }
}
</script>

<template>
  <BaseForm @submit="handleSubmit()">
    <BaseInput
      :name="`name`"
      :title="`Kategori`"
      :type="`text`"
      :required="true"
      :placeholder="`Masukan kategori...`"
      v-model="state.name"
    />
    <USelect v-model="state.icon" :items="iconOptions" required />
    <BaseButton
      :type="`submit`"
      :title="mode === 'edit' ? 'Simpan perubahan' : 'Tambah kategori'"
      :block="true"
      :size="`lg`"
      :variant="`solid`"
      :loading="categories.loading"
    />
  </BaseForm>
</template>
