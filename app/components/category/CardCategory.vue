<script setup>
import BaseCard from "../ui/BaseCard.vue";
import BaseButton from "../ui/BaseButton.vue";
import ModalForm from "../modal/ModalForm.vue";
import FormCategory from "./FormCategory.vue";

const category = useCategoriesStore();
const toast = useToast();

const open = ref(false);
const selectedCategory = ref(null);

function openEdit(cat) {
  selectedCategory.value = cat;
  open.value = true;
}

function closeEdit() {
  open.value = false;
  selectedCategory.value = null;
}

onMounted(async () => {
  await category.fetchCategories();
});

async function handleDelete(id) {
  const { success, message } = await category.deleteCategory(id);
  if (success) {
    await category.fetchCategories();
    toast.add({ title: "Hapus kategori sukses", color: "success" });
  } else {
    toast.add({ title: message, color: "error" });
  }
}
</script>

<template>
  <!-- ✅ ModalForm di LUAR v-for -->
  <ModalForm v-model="open" :title="`Edit Kategori`">
    <FormCategory
      v-if="selectedCategory"
      :mode="`edit`"
      :initial-state="selectedCategory"
      @close="closeEdit"
    />
  </ModalForm>

  <div
    v-if="category.totalCategories === 0"
    class="flex flex-col items-center justify-center py-16 text-muted gap-2"
  >
    <UIcon
      name="i-lucide-tags
    "
      class="text-4xl"
    />
    <p class="font-poppins text-sm">Kategori tidak ditemukan.</p>
  </div>

  <div
    class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    v-else
  >
    <BaseCard
      v-for="cat in category.categories"
      :key="cat.id"
      :ui="{ body: 'flex flex-col items-center gap-4 p-5' }"
    >
      <div
        class="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10"
      >
        <UIcon :name="cat.icon" class="size-8 text-primary" />
      </div>

      <h3 class="text-base font-semibold text-center text-gray-800">
        {{ cat.name }}
      </h3>

      <div class="grid lg:grid-cols-2 grid-cols-1 gap-2 w-full">
        <BaseButton
          :variant="`outline`"
          :color="`neutral`"
          :size="`md`"
          :title="`Edit`"
          :block="true"
          @click="openEdit(cat)"
        />
        <BaseButton
          :title="`Hapus`"
          :variant="`solid`"
          :color="`error`"
          :size="`md`"
          :block="true"
          @click="handleDelete(cat.id)"
        />
      </div>
    </BaseCard>
  </div>
</template>
