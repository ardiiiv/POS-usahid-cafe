<script setup>
definePageMeta({ layout: false });
import FormLogin from "~/components/auth/FormLogin.vue";
</script>

<template>
  <div
    class="w-screen h-screen flex items-center justify-center p-4 relative overflow-hidden"
  >
    <div
      class="absolute inset-0 bg-[url('https://res.cloudinary.com/dts9igkjv/image/upload/v1776844720/Cafe_zzrjwu.jpg')] bg-cover bg-center"
    />
    <div class="absolute inset-0 bg-black/50" />

    <div class="relative z-10 w-full max-w-md">
      <div class="flex flex-col items-center mb-6 text-white">
        <div
          class="w-20 h-20 rounded-full bg-primary mb-3 shadow-lg flex items-center justify-center"
        >
          <UIcon name="i-lucide-coffee" class="size-10 text-white" />
        </div>
        <h1 class="text-2xl font-bold font-poppins tracking-wide">
          USAHID CAFE
        </h1>
        <p class="text-white/60 text-sm font-poppins mt-1">
          Point of Sale System
        </p>
      </div>

      <div class="bg-white rounded-3xl p-8 shadow-2xl">
        <div class="mb-6">
          <h2 class="text-2xl font-bold font-poppins text-gray-900">Login</h2>
          <p class="text-gray-400 text-sm mt-1 font-poppins">
            Masukkan kredensial Anda untuk melanjutkan.
          </p>
        </div>

        <FormLogin />
      </div>

      <p class="text-center text-white/40 text-xs mt-6 font-poppins">
        &copy; {{ new Date().getFullYear() }} USAHID Cafe. All rights reserved.
      </p>
    </div>
  </div>
</template>
