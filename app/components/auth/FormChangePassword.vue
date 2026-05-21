<script setup>
import InputField from "../ui/BaseInput.vue";
import BaseButton from "../ui/BaseButton.vue";
import FormAuth from "../ui/BaseForm.vue";

const state = reactive({
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const toast = useToast();
const usersStore = useUsersStore();

const handleChangePassword = async () => {
  const { success, message } = await usersStore.changePassword(state);

  if (success) {
    console.log("bsrhasil ubah password");

    toast.add({
      title: "Berhasil",
      description: message,
      color: "success",
    });

    setTimeout(() => {
      navigateTo("/");
    }, 1500);
  } else {
    toast.add({
      title: "Gagal",
      description: message,
      color: "error",
    });
  }
};
</script>

<template>
  <FormAuth @submit="handleChangePassword()">
    <InputField
      :title="`Password Saat Ini`"
      :type="`password`"
      :name="`currentPassword`"
      :required="true"
      :placeholder="`Masukkan password saat ini...`"
      v-model="state.currentPassword"
    />
    <InputField
      :title="`Password Baru`"
      :type="`password`"
      :name="`newPassword`"
      :required="true"
      :placeholder="`Masukkan password baru...`"
      v-model="state.newPassword"
    />
    <InputField
      :title="`Konfirmasi Password`"
      :type="`password`"
      :name="`confirmPassword`"
      :required="true"
      :placeholder="`Ulangi password baru...`"
      v-model="state.confirmPassword"
    />
    <BaseButton
      :variant="`solid`"
      :type="`submit`"
      :size="`xl`"
      :block="true"
      :title="`Ubah Password`"
      :loading="usersStore.loading"
    />
  </FormAuth>
</template>
