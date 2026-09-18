<script setup>
import { store } from '../store.js'

const {
  totalAlumnos,
  busquedaAlumnos,
  seccionActiva,
  seccionesFiltradas,
  seccionesFiltradasObj,
  seleccionarAlumno,
  getAlumnoEstado,
  getEstadoClass
} = store
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Alumnos por Sección</h1>
        <p class="page-subtitle">{{ totalAlumnos }} alumnos · 19 secciones</p>
      </div>
    </div>

    <div class="search-box">
      <span class="material-icons">search</span>
      <input type="text" v-model="busquedaAlumnos" placeholder="Buscar por nombre o sección..." />
    </div>

    <div class="tabs-scroll" v-if="seccionesFiltradas.length > 1">
      <button
        v-for="sec in seccionesFiltradas"
        :key="sec"
        class="tab-btn"
        :class="{ active: seccionActiva === sec || !seccionActiva }"
        @click="seccionActiva = sec"
      >{{ sec }}</button>
    </div>

    <div class="section-list">
      <div v-for="(lista, sec) in seccionesFiltradasObj" :key="sec">
        <div class="card">
          <div class="card-header">
            <h3>
              <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              {{ sec }} · {{ lista.length }} alumnos
            </h3>
            <span style="font-size:12px;color:var(--text-muted)">
              {{ seccionActiva !== sec ? 'Ver' : 'Filtrando' }}
            </span>
          </div>
          <div class="card-body">
            <div
              v-for="(alumno, i) in lista"
              :key="i"
              class="alumno-row"
              @click="seleccionarAlumno(sec, i)"
            >
              <span class="alumno-name">{{ alumno.nombre }}</span>
              <span class="alumno-sec">{{ sec }}</span>
              <span class="alumno-status">
                <span class="badge" :class="getEstadoClass(getAlumnoEstado(sec, i))">
                  <svg v-if="getAlumnoEstado(sec, i).estado === 'ok'" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                  <svg v-else-if="getAlumnoEstado(sec, i).estado === 'warn'" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                  <svg v-else-if="getAlumnoEstado(sec, i).estado === 'bad'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                  <svg v-else viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  {{ getAlumnoEstado(sec, i).label }}
                </span>
              </span>
            </div>
            <div v-if="!lista.length" class="empty">
              <span class="material-icons">search_off</span>
              <p>No se encontraron alumnos</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>