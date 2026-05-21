<script setup>
import BaseForm from "../ui/BaseForm.vue";
import BaseInput from "../ui/BaseInput.vue";
import BaseButton from "../ui/BaseButton.vue";
import { useUsersStore } from "~/stores/usersStores";

const state = reactive({
  name: "",
  email: "",
  password: "",
  role: "Karyawan",
});

const items = reactive(["Karyawan", "Admin"]);

const users = useUsersStore();
const toast = useToast();

const emit = defineEmits(["close"]);

async function handleCreateUser() {
  const { success, message } = await users.createUser(state);

  if (success) {
    toast.add({ title: "Tambah akun sukses", color: "success" });
    emit("close");
  } else {
    toast.add({ title: message, color: "error" });
  }
}
</script>

<template>
  <BaseForm @submit="handleCreateUser()">
    <BaseInput
      :title="`Nama`"
      :name="`name`"
      :required="true"
      :placeholder="`Masukan Nama Anda...`"
      v-model="state.name"
    />
    <BaseInput
      :title="`Email`"
      :name="`email`"
      :type="`email`"
      :required="true"
      :placeholder="`Masukan Email Anda...`"
      v-model="state.email"
    />
    <BaseInput
      :title="`Password`"
      :type="`password`"
      :name="`password`"
      :required="true"
      :placeholder="`Masukan Password Anda...`"
      v-model="state.password"
    />
    <URadioGroup orientation="horizontal" :items="items" v-model="state.role" />
    <UBadge
      color="primary"
      variant="subtle"
      v-if="state.role === 'Karyawan'"
      class="text-sm"
      >Akses: kasir, tambah stok, lihat dashboard & laporan Tidak bisa: hapus
      produk, void, export, kelola akun"</UBadge
    >
    <UBadge color="secondary" variant="subtle" v-else class="text-sm"
      >Akses penuh: semua fitur, void transaksi, kelola produk & kategori,
      export laporan, manajemen akun</UBadge
    >
    <BaseButton
      :variant="`solid`"
      :type="`submit`"
      :size="`xl`"
      :block="true"
      :title="`Buat Akun`"
      :loading="users.loading"
    />
  </BaseForm>
</template>
