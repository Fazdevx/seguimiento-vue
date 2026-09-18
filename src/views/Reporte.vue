<script setup>
import { store } from '../store.js'

const { derivados, criterios, descargarCSV, seleccionarAlumno, irAlumno } = store

function abrirPerfil(sec, idx) {
  seleccionarAlumno(sec, idx)
  irAlumno()
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Reporte de Derivaciones</h1>
        <p class="page-subtitle">Alumnos que requieren atención en centro de salud</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" @click="descargarCSV">
          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          CSV
        </button>
      </div>
    </div>

    <div v-if="!derivados.length">
      <div class="card">
        <div class="card-body">
          <div class="deriva-empty">
            <span class="material-icons">health_and_safety</span>
            <p style="font-size:15px;color:var(--text-secondary);font-weight:500">✅ No hay alumnos para derivar</p>
            <p style="font-size:13px;color:var(--text-muted);margin-top:4px">Todos los alumnos están en seguimiento correcto</p>
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <div class="card">
        <div class="card-header" style="background:var(--danger-bg)">
          <h3>
            <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            Alumnos a derivar · {{ derivados.length }}
          </h3>
        </div>
        <div class="card-body">
          <div v-for="(item, idx) in derivados" :key="idx" class="deriva-item">
            <div class="info">
              <div class="name">{{ item.nombre }}</div>
              <div class="meta">Sección: {{ item.sec }} · Última visita: {{ item.ultima }} · {{ item.raza }}</div>
            </div>
            <button class="btn btn-danger btn-sm" @click="abrirPerfil(item.sec, item.idx)">
              <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
              Abrir perfil
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card" style="margin-top:16px">
      <div class="card-header">
        <h3><span class="material-icons">description</span> Criterios de derivación</h3>
      </div>
      <div class="card-body" style="font-size:13px;color:var(--text-secondary);line-height:1.7">
        <ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:8px">
          <li v-for="(criterio, i) in criterios" :key="i" style="display:flex;gap:10px;align-items:flex-start">
            <span style="color:var(--danger);flex-shrink:0;margin-top:2px">⚠️</span>
            <span>{{ criterio }}</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>