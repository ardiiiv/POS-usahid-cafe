<script setup>
import FormAuth from "../ui/BaseForm.vue";
import InputField from "../ui/BaseInput.vue";
import BaseButton from "../ui/BaseButton.vue";

const state = reactive({
  email: "",
  password: "",
});

const auth = useAuthStore();
const toast = useToast();

async function handleLogin() {
  const { success, message } = await auth.login(state);

  if (success) {
    toast.add({ title: "Login berhasil.", color: "success" });
    navigateTo("/kasir");
  } else {
    toast.add({ title: message, color: "error" });
  }
}
</script>

<template>
  <div class="w-full">
    <FormAuth @submit="handleLogin()">
      <InputField
        :title="`Email`"
        :name="`email`"
        :type="`email`"
        :required="true"
        :placeholder="`Masukan Email Anda...`"
        v-model="state.email"
      />
      <InputField
        :title="`Password`"
        :name="`password`"
        :type="`password`"
        :required="true"
        :placeholder="`Masukan Password Anda...`"
        v-model="state.password"
      />
      <BaseButton
        :variant="`solid`"
        :type="`submit`"
        :size="`xl`"
        :block="true"
        :title="`Masuk`"
        :loading="auth.loading"
      />
    </FormAuth>
  </div>
</template>
