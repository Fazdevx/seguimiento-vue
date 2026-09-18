<script setup>
import { store } from '../store.js'

const { LimpiarDatos, mostrarAyuda } = store
</script>

<template>
  <header class="topbar">
    <div class="topbar-left">
      <span class="topbar-title">Seguimiento Clínico</span>
      <span class="topbar-badge">Academia Galileo</span>
    </div>
    <div class="topbar-right">
      <button class="icon-btn" @click="LimpiarDatos" title="Limpiar todos los registros">
        <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
      </button>
      <button class="icon-btn" @click="mostrarAyuda" title="Ayuda">
        <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
      </button>
    </div>
  </header>
</template>