<script setup>
import { ref, computed } from 'vue'
import { store } from '../store.js'

const {
  alumnosPorSeccion,
  alumnoSeleccionado,
  alumnoActual,
  alumnoHistorial,
  ultimaFecha,
  alumnoEstado,
  abrirModalVisita,
  eliminarVisita,
  seleccionarAlumno,
  getEstadoClass
} = store

const busqueda = ref('')

const resultados = computed(() => {
  const q = busqueda.value.toLowerCase().trim()
  const lista = []
  for (const sec of Object.keys(alumnosPorSeccion.value)) {
    alumnosPorSeccion.value[sec].forEach((a, i) => {
      if (!q || a.nombre.toLowerCase().includes(q) || sec.toLowerCase().includes(q)) {
        lista.push({ sec, idx: i, nombre: a.nombre })
      }
    })
  }
  if (q) return lista
  return lista.slice(0, 50)
})

function limpiarSeleccion() {
  alumnoSeleccionado.value = null
  busqueda.value = ''
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Seguimiento Clínico</h1>
        <p class="page-subtitle">Busca un alumno y registra sus visitas</p>
      </div>
      <button class="btn btn-primary" :disabled="!alumnoSeleccionado" @click="abrirModalVisita">
        <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        Nueva Visita
      </button>
    </div>

    <!-- ===== SELECTOR DE ALUMNO ===== -->
    <div v-if="!alumnoSeleccionado" class="card">
      <div class="card-header">
        <h3><span class="material-icons">person_search</span> Seleccionar alumno</h3>
      </div>
      <div class="card-body">
        <div class="search-box">
          <span class="material-icons">search</span>
          <input
            type="text"
            v-model="busqueda"
            placeholder="Buscar por nombre o sección..."
            autofocus
          />
        </div>

        <div class="alert alert-info" v-if="!busqueda.trim()">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
          <span>Escribe el nombre o la sección para encontrar al alumno y seleccionarlo.</span>
        </div>

        <div v-if="resultados.length" class="section-list" style="margin-top:6px">
          <div class="card" style="box-shadow:none;border:1px solid var(--border-light);margin-bottom:0;overflow:visible">
            <div
              v-for="(item, i) in resultados"
              :key="i"
              class="alumno-row"
              @click="seleccionarAlumno(item.sec, item.idx)"
            >
              <span class="alumno-name">{{ item.nombre }}</span>
              <span class="alumno-sec">{{ item.sec }}</span>
            </div>
            <div v-if="!busqueda.trim() && resultados.length === 50" style="padding:12px 16px;font-size:12.5px;color:var(--text-muted);text-align:center">
              Mostrando los primeros 50. Escribe para refinar la búsqueda.
            </div>
          </div>
        </div>

        <div v-if="busqueda.trim() && !resultados.length" class="empty">
          <span class="material-icons">search_off</span>
          <p>No se encontraron alumnos</p>
        </div>
      </div>
    </div>

    <!-- ===== PANEL DEL ALUMNO ===== -->
    <div v-else>
      <div class="card">
        <div class="card-header">
          <h3>
            <svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:currentColor;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {{ alumnoActual.nombre }}
          </h3>
          <div style="display:flex;align-items:center;gap:10px">
            <span class="badge" :class="getEstadoClass(alumnoEstado)">
              <svg v-if="alumnoEstado.estado === 'ok'" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
              <svg v-else viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
              {{ alumnoEstado.label }}
            </span>
            <button class="btn btn-ghost btn-sm" @click="limpiarSeleccion">
              Cambiar alumno
            </button>
          </div>
        </div>
        <div class="card-body">
          <div class="field-row">
            <div class="field">
              <label>Sección</label>
              <input type="text" :value="alumnoActual.sec" readonly style="background:var(--surface-alt);color:var(--text-secondary)" />
            </div>
            <div class="field">
              <label>Total de visitas</label>
              <input type="text" :value="alumnoHistorial.length" readonly style="background:var(--surface-alt);color:var(--text-secondary)" />
            </div>
            <div class="field">
              <label>Última visita</label>
              <input type="text" :value="ultimaFecha" readonly style="background:var(--surface-alt);color:var(--text-secondary)" />
            </div>
            <div class="field">
              <label>Estado</label>
              <input type="text" :value="alumnoEstado.label" readonly :style="{ background: alumnoEstado.bg, color: alumnoEstado.color }" />
            </div>
          </div>
          <div
            class="alert"
            :class="alumnoEstado.cls === 'ok' ? 'alert-success' : alumnoEstado.cls === 'bad' ? 'alert-danger' : 'alert-warning'"
            v-if="alumnoEstado.estado !== 'ok'"
          >
            <svg v-if="alumnoEstado.estado === 'bad'" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
            <svg v-else viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <span>{{ alumnoEstado.msg }}</span>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3><span class="material-icons">history</span> Historial de visitas</h3>
          <span style="font-size:12px;color:var(--text-muted)">{{ alumnoHistorial.length }} registros</span>
        </div>
        <div class="card-body" style="padding:0">
          <div v-if="!alumnoHistorial.length" style="padding:28px;text-align:center;color:var(--text-muted)">
            <span class="material-icons" style="font-size:36px;display:block;margin-bottom:8px">event_note</span>
            <p>No hay visitas registradas</p>
          </div>
          <div v-else class="table-wrap">
            <table class="tabla">
              <thead>
                <tr>
                  <th>Fecha</th><th>Tipo</th><th>Peso (kg)</th><th>Talla (cm)</th>
                  <th>Temp (°C)</th><th>Observaciones</th><th>Continua</th><th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(v, i) in alumnoHistorial" :key="i">
                  <td style="font-weight:500">{{ v.fecha }}</td>
                  <td>{{ v.tipo }}</td>
                  <td>{{ v.peso != null ? v.peso : '—' }}</td>
                  <td>{{ v.talla != null ? v.talla : '—' }}</td>
                  <td>{{ v.temp != null ? v.temp : '—' }}</td>
                  <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis">{{ v.obs || '—' }}</td>
                  <td>
                    <span v-if="v.continua === 'si'" class="badge badge-ok">
                      <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      Sí
                    </span>
                    <span v-else class="badge badge-bad">
                      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                      No
                    </span>
                  </td>
                  <td>
                    <button class="btn-icon danger" @click="eliminarVisita(i)" title="Eliminar visita">
                      <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>