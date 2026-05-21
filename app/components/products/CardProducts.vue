<script setup>
import BaseButton from "../ui/BaseButton.vue";

const product = useProductsStore();
onMounted(async () => await product.fetchProducts());
</script>

<template>
  <slot />

  <div
    v-if="product.filteredProducts.length === 0"
    class="flex flex-col items-center justify-center py-16 text-muted gap-2"
  >
    <UIcon name="i-lucide-package-search" class="text-4xl" />
    <p class="font-poppins text-sm">Produk tidak ditemukan.</p>
    <BaseButton
      v-if="product.searchQuery || product.selectedCategoryId"
      :variant="`ghost`"
      :color="`neutral`"
      :size="`sm`"
      :title="`Reset filter`"
      @click="product.resetFilter()"
    />
  </div>
</template>
