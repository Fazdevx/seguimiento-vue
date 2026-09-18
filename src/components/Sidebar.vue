<script setup>
import { store } from '../store.js'

const { menuItems, activePage, setPage, descargarJSON, descargarCSV, subirJSON } = store
</script>

<template>
  <nav class="sidebar">
    <div class="sidebar-logo">G</div>

    <button
      v-for="item in menuItems"
      :key="item.id"
      class="sidebar-icon"
      :class="{ active: activePage === item.id }"
      @click="setPage(item.id)"
      :title="item.label"
    >
      <svg v-if="item.id === 'dashboard'" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
      <svg v-else-if="item.id === 'alumnos'" viewBox="0 0 24 24">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
      <svg v-else-if="item.id === 'fichas'" viewBox="0 0 24 24">
        <path d="M16 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="16 2 16 8 22 8" />
        <path d="M9 15l2 2 4-4" />
      </svg>
      <svg v-else-if="item.id === 'reporte'" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    </button>

    <div class="sidebar-spacer"></div>

    <div class="sidebar-footer">
      <button class="sidebar-icon" @click="descargarJSON" title="Exportar JSON">
        <svg viewBox="0 0 24 24" style="width:18px;height:18px">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      </button>
      <button class="sidebar-icon" @click="descargarCSV" title="Exportar CSV (Excel)">
        <svg viewBox="0 0 24 24" style="width:18px;height:18px">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </button>
      <button class="sidebar-icon" @click="subirJSON" title="Importar JSON">
        <svg viewBox="0 0 24 24" style="width:18px;height:18px">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </button>
    </div>
  </nav>
</template>