<script setup>
import BaseButton from "../ui/BaseButton.vue";
import BaseForm from "../ui/BaseForm.vue";
import BaseInput from "../ui/BaseInput.vue";

const emit = defineEmits(["close"]);

const props = defineProps({
  mode: {
    type: String,
    default: "add",
  },
  initialState: {
    type: Object,
    default: () => ({
      name: "",
      categoryId: "",
      description: "",
      stock: 0,
      price: 0,
      imageUrl: "",
      barcode: "",
    }),
  },
});

const category = useCategoriesStore();
const products = useProductsStore();
const upload = useUploadStore();
const toast = useToast();

const state = reactive({ ...props.initialState });
const newImageFile = ref(null);

watch(
  () => props.initialState,
  (newVal) => {
    if (newVal && props.mode === "edit") {
      Object.assign(state, newVal);
      newImageFile.value = null;
    }
  },
  { deep: true, immediate: true },
);

onMounted(() => category.fetchCategories());

const items = computed(() =>
  category.categories.map((item) => ({
    label: item.name,
    value: item.id,
  })),
);

function generateEAN13() {
  const digits = Array.from({ length: 12 }, () =>
    Math.floor(Math.random() * 10),
  );
  const sum = digits.reduce((acc, d, i) => acc + d * (i % 2 === 0 ? 1 : 3), 0);
  const checkDigit = (10 - (sum % 10)) % 10;
  state.barcode = [...digits, checkDigit].join("");
}

async function handleSubmit() {
  if (props.mode === "edit") {
    let finalImageUrl = state.imageUrl; // default pakai URL lama

    // Jika ada file baru
    if (newImageFile.value instanceof File) {
      // 1. Hapus gambar lama dulu (jika ada)
      if (state.imageUrl) {
        const { success } = await upload.deleteImage(state.imageUrl);
        if (!success) {
          toast.add({ title: "Gagal menghapus gambar lama.", color: "error" });
          return;
        }
      }

      // 2. Upload gambar baru
      const { success, url, message } = await upload.uploadImage(
        newImageFile.value,
      );
      if (!success) {
        toast.add({ title: message, color: "error" });
        return;
      }
      finalImageUrl = url;
    }

    // 3. Update ke database
    const { success, message } = await products.updateProduct(
      props.initialState.id,
      {
        name: state.name,
        categoryId: state.categoryId,
        description: state.description,
        stock: Number(state.stock),
        price: Number(state.price),
        imageUrl: finalImageUrl || null,
        barcode: state.barcode || null,
      },
    );

    if (success) {
      toast.add({ title: "Produk berhasil diupdate.", color: "success" });
      emit("close");
    } else {
      toast.add({ title: message, color: "error" });
    }
  } else {
    // Mode add
    let finalImageUrl = null;

    if (newImageFile.value instanceof File) {
      const { success, url, message } = await upload.uploadImage(
        newImageFile.value,
      );
      if (!success) {
        toast.add({ title: message, color: "error" });
        return;
      }
      finalImageUrl = url;
    }

    const { success, message } = await products.createProduct({
      name: state.name,
      categoryId: state.categoryId,
      description: state.description,
      stock: Number(state.stock),
      price: Number(state.price),
      imageUrl: finalImageUrl || null,
      barcode: state.barcode || null,
    });

    if (success) {
      toast.add({ title: "Produk berhasil ditambahkan.", color: "success" });
      emit("close");
    } else {
      toast.add({ title: message, color: "error" });
    }
  }
}
</script>

<template>
  <BaseForm @submit="handleSubmit">
    <BaseInput
      title="Produk"
      name="name"
      :required="true"
      placeholder="Masukan nama produk..."
      v-model="state.name"
    />
    <USelect
      v-model="state.categoryId"
      :items="items"
      required
      placeholder="Pilih kategori..."
      size="lg"
      :required
    />
    <BaseInput
      title="Deskripsi"
      name="description"
      placeholder="Masukan deskripsi..."
      v-model="state.description"
    />
    <BaseInput
      type="number"
      title="Stok"
      name="stock"
      placeholder="Masukan stok..."
      :required="true"
      v-model="state.stock"
    />
    <BaseInput
      type="number"
      title="Harga"
      name="price"
      placeholder="Masukan harga..."
      :required="true"
      v-model="state.price"
    />

    <UFormField name="barcode" label="Barcode">
      <div class="flex gap-2">
        <UInput
          v-model="state.barcode"
          placeholder="Scan atau masukan barcode..."
          size="lg"
          class="flex-1"
        />
        <BaseButton
          type="button"
          title="Generate"
          variant="outline"
          color="neutral"
          size="lg"
          @click="generateEAN13"
        />
      </div>
    </UFormField>

    <!-- Preview gambar lama -->
    <div v-if="state.imageUrl && !newImageFile">
      <p class="text-xs text-muted mb-1">Gambar saat ini:</p>
      <img
        :src="state.imageUrl"
        class="w-32 h-32 object-cover rounded-xl mb-1"
      />
    </div>

    <UFormField
      name="image"
      label="Image"
      description="JPG, PNG, WEBP, or HEIC (max. 2MB)"
    >
      <UFileUpload
        size="xl"
        variant="area"
        label="Drop your image here"
        description="JPG, PNG, WEBP, or HEIC (max. 2MB)"
        v-model="newImageFile"
      />
    </UFormField>

    <BaseButton
      type="submit"
      :title="mode === 'edit' ? 'Simpan Perubahan' : 'Tambah Produk'"
      :block="true"
      size="lg"
      variant="solid"
      :loading="products.loading || upload.loading"
    />
  </BaseForm>
</template>
