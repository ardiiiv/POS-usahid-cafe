<script setup>
import BaseButton from "../ui/BaseButton.vue";

const ALL_CATEGORIES = "all";
const category = useCategoriesStore();
const product = useProductsStore();

onMounted(async () => await category.fetchCategories());

const categoryItems = computed(() => [
  { label: "Semua Kategori", value: ALL_CATEGORIES },
  ...category.categories.map((c) => ({
    label: c.name,
    value: c.id,
  })),
]);

const selectedCategory = computed({
  get() {
    return product.selectedCategoryId || ALL_CATEGORIES;
  },
  set(val) {
    product.setCategory(val === ALL_CATEGORIES ? "" : val);
  },
});

function handleSearch(val) {
  product.setSearch(val);
}
</script>

<template>
  <div class="flex flex-col sm:flex-row items-start sm:items-center gap-2">
    <!-- Search & Filter -->
    <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
      <UInput
        icon="i-lucide-search"
        placeholder="Cari produk..."
        size="lg"
        :model-value="product.searchQuery"
        @update:model-value="handleSearch"
        class="w-full sm:w-56"
      />
      <USelect
        :items="categoryItems"
        size="lg"
        v-model="selectedCategory"
        class="w-full sm:w-48"
      />
      <BaseButton
        v-if="product.searchQuery || product.selectedCategoryId"
        :variant="`ghost`"
        :color="`neutral`"
        :size="`lg`"
        :icon="`i-lucide-x`"
        :title="`Reset`"
        @click="product.resetFilter()"
      />
    </div>

    <slot />
  </div>
</template>
