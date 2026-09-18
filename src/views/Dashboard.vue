<script setup>
import { store } from '../store.js'

const { historial, stats, statsFichas, topRisk, totalAlumnos, descargarCSV, descargarJSON } = store
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">Resumen general del seguimiento clínico</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-secondary" @click="descargarCSV">
          <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          CSV
        </button>
        <button class="btn btn-primary" @click="descargarJSON">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
          Exportar JSON
        </button>
      </div>
    </div>

    <div class="stat-grid">
      <div class="stat-card">
        <div class="stat-icon blue">
          <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ totalAlumnos }}</span>
          <span class="stat-label">Total alumnos</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon green">
          <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.ok }}</span>
          <span class="stat-label">Seguimiento OK</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon orange">
          <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.warning }}</span>
          <span class="stat-label">Sin visitas últimos 30 días</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon red">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stats.bad }}</span>
          <span class="stat-label">Derivar a centro de salud</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon nurse">
          <svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ Object.keys(historial).length }}</span>
          <span class="stat-label">Alumnos con visitas registradas</span>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3><span class="material-icons">verified</span> Clasificación de salud</h3>
      </div>
      <div class="card-body">
        <div class="clasif-grid">
          <div class="clasif-stat">
            <span class="clasif-dot ok"></span>
            <div>
              <span class="clasif-num">{{ statsFichas.apto }}</span>
              <span class="clasif-name">Apto</span>
            </div>
          </div>
          <div class="clasif-stat">
            <span class="clasif-dot warn"></span>
            <div>
              <span class="clasif-num">{{ statsFichas.obs }}</span>
              <span class="clasif-name">Apto con observación</span>
            </div>
          </div>
          <div class="clasif-stat">
            <span class="clasif-dot bad"></span>
            <div>
              <span class="clasif-num">{{ statsFichas.req }}</span>
              <span class="clasif-name">Requieren atención médica</span>
            </div>
          </div>
          <div class="clasif-stat">
            <span class="clasif-dot none"></span>
            <div>
              <span class="clasif-num">{{ statsFichas.sin }}</span>
              <span class="clasif-name">Sin ficha registrada</span>
            </div>
          </div>
        </div>
        <p style="font-size:12.5px;color:var(--text-muted);margin-top:8px">
          Las fichas de salud se crean desde la sección <strong>Fichas de Salud</strong>.
        </p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3><span class="material-icons">info</span> Resumen del sistema</h3>
      </div>
      <div class="card-body">
        <div class="alert alert-info" v-if="Object.keys(historial).length === 0">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          <span>Comenzando sesión. Abre la sección <strong>Fichas de Salud</strong> para crear la ficha y registrar las atenciones de cada alumno.</span>
        </div>
        <div v-else class="alert alert-success">
          <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
          <span>Hay <strong>{{ Object.keys(historial).length }}</strong> alumnos con al menos una visita registrada. {{ stats.bad }} alumnos requieren derivación.</span>
        </div>
        <p style="font-size:13px;color:var(--text-secondary);margin-top:4px">
          💡 <strong>Criterios de derivación:</strong> brecha entre visitas mayor a 60 días, o sin visita en los últimos 30 días.
        </p>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3><span class="material-icons">trending_up</span> Alumnos con mayor riesgo (top 5)</h3>
      </div>
      <div class="card-body">
        <div v-if="topRisk.length === 0" class="empty">
          <span class="material-icons">check_circle</span>
          <p>No hay alumnos en riesgo. Todos están en seguimiento correcto.</p>
        </div>
        <div v-else class="table-wrap">
          <table class="tabla">
            <thead>
              <tr><th>Alumno</th><th>Sección</th><th>Última visita</th><th>Días desde última</th><th>Riesgo</th></tr>
            </thead>
            <tbody>
              <tr v-for="(item, idx) in topRisk" :key="idx">
                <td style="font-weight:500">{{ item.nombre }}</td>
                <td>{{ item.sec }}</td>
                <td>{{ item.ultima }}</td>
                <td :style="{ color: item.dias > 60 ? 'var(--danger)' : item.dias > 30 ? 'var(--warning)' : 'var(--text)' }">
                  {{ item.dias }} días
                </td>
                <td>
                  <span class="badge" :class="item.dias > 60 ? 'badge-bad' : 'badge-warn'">
                    {{ item.dias > 60 ? 'Derivar' : 'Sin visita reciente' }}
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>