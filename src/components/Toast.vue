<script setup>
import { store } from '../store.js'

const { toast } = store
</script>

<template>
  <transition name="toast">
    <div v-if="toast.show" class="toast" :class="toast.cls">
      <span class="material-icons">{{ toast.icon }}</span>
      {{ toast.msg }}
    </div>
  </transition>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity .2s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
}
</style>