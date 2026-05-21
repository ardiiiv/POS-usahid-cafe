<script setup>
import ModalConfirm from "~/components/modal/ModalConfirm.vue";
import ModalForm from "~/components/modal/ModalForm.vue";
import CardProducts from "~/components/products/CardProducts.vue";
import FormProduct from "~/components/products/FormProduct.vue";
import NavigationProducts from "~/components/products/NavigationProduct.vue";
import BaseButton from "~/components/ui/BaseButton.vue";
import BaseCard from "~/components/ui/BaseCard.vue";

const product = useProductsStore();
const upload = useUploadStore();
const users = useUsersStore();
const toast = useToast();
const addProduct = ref(false);
const selectedProduct = ref(null);
const open = ref(false);
const isConfirmOpen = ref(false);
const selectedDeleteProduct = ref(null);

onMounted(async () => {
  await users.getProfile();
});
onMounted(async () => await product.fetchProducts());

function openEdit(p) {
  selectedProduct.value = p;
  open.value = true;
}

function closeEdit() {
  open.value = false;
  selectedProduct.value = null;
}

function openConfirmDelete(p) {
  selectedDeleteProduct.value = p;
  isConfirmOpen.value = true;
}

async function confirmDelete() {
  if (!selectedDeleteProduct.value) return;

  const p = selectedDeleteProduct.value;
  isConfirmOpen.value = false;
  selectedDeleteProduct.value = null;

  const { success, message } = await product.deleteProduct(p.id);

  if (success) {
    toast.add({ title: "Produk berhasil dihapus!", color: "success" });
    if (p?.imageUrl) {
      await upload.deleteImage(p.imageUrl);
    }
  } else {
    toast.add({ title: message, color: "error" });
  }
}

async function handleStock(id, delta) {
  const { success, message } = await product.adjustStock(id, delta);
  if (!success) {
    toast.add({ title: message, color: "error" });
  }
}
</script>

<template>
  <section class="flex flex-col gap-6">
    <div class="flex lg:flex-row flex-col lg:justify-between gap-2">
      <div>
        <h1 class="text-xl font-bold text-slate-800 tracking-tight">Produk</h1>
        <p class="text-sm text-slate-400 mt-0.5">
          Kelola daftar produk dan menu cafe
        </p>
      </div>
      <NavigationProducts>
        <ModalForm v-model="addProduct" :title="`Tambah Produk`">
          <template #trigger>
            <BaseButton
              :variant="`solid`"
              :size="`lg`"
              :icon="`i-lucide-plus`"
              :title="`Tambah Produk`"
              @click="addProduct = true"
              :block="true"
            />
          </template>
          <FormProduct @close="addProduct = false" />
        </ModalForm>
      </NavigationProducts>
    </div>

    <CardProducts>
      <ModalForm v-model="open" :title="`Edit Produk`">
        <FormProduct
          v-if="selectedProduct"
          :mode="`edit`"
          :initial-state="selectedProduct"
          @close="closeEdit"
        />
      </ModalForm>

      <div
        class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-6"
      >
        <BaseCard
          :ui="{ body: 'flex flex-col gap-4' }"
          v-for="p in product.filteredProducts"
          :key="p.id"
          class="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
        >
          <div class="flex justify-between">
            <UBadge
              color="primary"
              variant="subtle"
              class="font-poppins"
              size="md"
              :icon="p.category.icon"
            >
              {{ p.category.name }}
            </UBadge>

            <div class="flex gap-2">
              <BaseButton
                :variant="`outline`"
                :color="`neutral`"
                :size="`md`"
                :icon="`i-lucide-pencil`"
                :title="``"
                @click="openEdit(p)"
              />

              <BaseButton
                v-if="users.profile && users.profile.role !== 'Karyawan'"
                :title="``"
                :variant="`solid`"
                :color="`error`"
                :size="`md`"
                :icon="`i-lucide-trash`"
                @click="openConfirmDelete(p)"
              />
            </div>
          </div>

          <div>
            <div class="overflow-hidden rounded-xl relative group">
              <img
                :src="
                  p.imageUrl === null
                    ? 'https://res.cloudinary.com/dts9igkjv/image/upload/v1776869660/Not_avaliable_pyp8yu.png'
                    : p.imageUrl
                "
                :alt="p.name"
                class="w-full h-36 object-cover transition duration-300 group-hover:scale-110"
              />

              <div
                class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"
              ></div>
            </div>

            <h3 class="text-lg font-poppins font-semibold mt-4">
              {{ p.name }}
            </h3>

            <p class="text-sm text-muted truncate">
              {{ p.description }}
            </p>
          </div>

          <p class="text-base font-semibold font-poppins text-primary">
            Rp {{ Number(p.price).toLocaleString("id-ID") }}
          </p>

          <div class="flex justify-between items-center">
            <BaseButton
              :title="``"
              :color="`neutral`"
              :variant="`outline`"
              :size="`md`"
              :icon="`i-lucide-minus`"
              :disabled="p.stock <= 0 || product.loading"
              @click="handleStock(p.id, -1)"
            />

            <div class="flex flex-col items-center">
              <span class="text-xs text-muted font-poppins">Stok</span>
              <span
                class="text-lg font-semibold font-poppins"
                :class="p.stock === 0 ? 'text-red-500' : ''"
              >
                {{ p.stock }}
              </span>
            </div>

            <BaseButton
              :title="``"
              :color="`neutral`"
              :variant="`outline`"
              :size="`md`"
              :icon="`i-lucide-plus`"
              :disabled="product.loading"
              @click="handleStock(p.id, +1)"
            />
          </div>
        </BaseCard>
      </div>
    </CardProducts>
  </section>

  <ModalConfirm
    v-model="isConfirmOpen"
    :name="selectedDeleteProduct?.name"
    @confirm="confirmDelete"
  />
</template>
