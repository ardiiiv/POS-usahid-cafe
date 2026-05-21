<script setup>
import ModalForm from "~/components/modal/ModalForm.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import FormCategory from "~/components/category/FormCategory.vue";
import CardCategory from "~/components/category/CardCategory.vue";

const open = ref(false);
const category = useCategoriesStore();
const users = useUsersStore();

onMounted(async () => {
  await users.getProfile();
});
onMounted(async () => category.fetchCategories());
</script>

<template>
  <section class="flex flex-col gap-6 p-1">
    <!-- ── Page Header ── -->
    <div
      class="flex md:flex-row flex-col md:items-center md:justify-between md:gap-0 gap-4"
    >
      <div>
        <h1 class="text-xl font-bold text-slate-800 tracking-tight">
          Kategori
        </h1>
        <p class="text-sm text-slate-400 mt-0.5">
          Kelola kategori produk menu cafe
        </p>
      </div>

      <div>
        <ModalForm v-model="open" :title="`Tambah Kategori`">
          <template #trigger>
            <BaseButton
              :variant="`solid`"
              :size="`lg`"
              :icon="`i-lucide-plus`"
              :title="`Tambah Kategori`"
              @click="open = true"
              block
            />
          </template>
          <FormCategory :mode="`add`" @close="open = false" />
        </ModalForm>
      </div>
    </div>

    <CardCategory />
  </section>
</template>
