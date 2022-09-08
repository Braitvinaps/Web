<template>
  <hr :class="[text,'w-[150px]']">
  <hr :class="[text,'w-[180px]']">
  <hr :class="[text,'w-[170px]']">
  <hr :class="[text,'w-[140px]']">
  <hr :class="[lightText,'w-[190px]']">
  <hr :class="[lightText,'w-[200px]']">
  <hr :class="[lightText,'w-[160px]']">
  <hr :class="[lightText,'w-[180px]']">
  <hr :class="[lightText,'w-[160px]']">
  <hr :class="[lightText,'w-[170px]']">
  <hr :class="[lightText,'w-[140px]']">
  <br>
  <div class="flex items-center">
    <img
      :class="userIcon"
      src="https://web.leadertask.com/api/v1/fotos/getimage?uid=e3b8ee6f-6372-40f2-b19f-dd5d4f1ff78d&amp;size=b"
      alt="Avatar"
      data-v-7737e28d=""
    >
    <hr
      :class="[lightText,'w-[100px]']"
      class="mt-[5px]"
    >
  </div>
</template>

<script>
export default {
  data: () => ({
    lightText: 'block h-[8px] bg-neutral-200  mb-1.5 rounded-[10px]',
    text: 'block h-[10px] bg-neutral-300 mb-1.5 rounded-[10px]',
    userIcon: 'mr-2 w-[22px] h-[22px] rounded-[10px]'
  })
}
</script>
