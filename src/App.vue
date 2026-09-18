<script setup>
import { store } from './store.js'
import Sidebar from './components/Sidebar.vue'
import HeaderBar from './components/HeaderBar.vue'
import Toast from './components/Toast.vue'
import ModalVisita from './components/ModalVisita.vue'
import HelpModal from './components/HelpModal.vue'
import Dashboard from './views/Dashboard.vue'
import Alumnos from './views/Alumnos.vue'
import Seguimiento from './views/Seguimiento.vue'
import Reporte from './views/Reporte.vue'

const { activePage, modalVisita, toast, ayudaOpen } = store
</script>

<template>
  <div class="app">
    <Sidebar />
    <div class="main">
      <HeaderBar />
      <div class="content">
        <Dashboard v-if="activePage === 'dashboard'" />
        <Alumnos v-else-if="activePage === 'alumnos'" />
        <Seguimiento v-else-if="activePage === 'seguimiento'" />
        <Reporte v-else-if="activePage === 'reporte'" />
      </div>
    </div>
    <ModalVisita v-if="modalVisita" />
    <HelpModal v-if="ayudaOpen" />
    <Toast v-if="toast.show" />
  </div>
</template>