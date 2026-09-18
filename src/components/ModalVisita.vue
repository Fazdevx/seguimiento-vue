<script setup>
import { store } from '../store.js'

const { modalVisita, visitaForm, cerrarModalVisita, guardarVisita } = store
const opcionesTipo = [
  'Control General',
  'Revisión de Desarrollo',
  'Chequeo de Salud',
  'Vacunación',
  'Seguimiento Especial',
  'Derivación Interna'
]
</script>

<template>
  <transition name="modal">
    <div v-if="modalVisita" class="modal-overlay" @click.self="cerrarModalVisita">
      <div class="modal">
        <div class="modal-header">
          <h2>Registrar Visita Clínica</h2>
          <button class="modal-close" @click="cerrarModalVisita">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="field-row">
            <div class="field">
              <label>Fecha de visita *</label>
              <input type="date" v-model="visitaForm.fecha" />
            </div>
            <div class="field">
              <label>Tipo de visita</label>
              <select v-model="visitaForm.tipo">
                <option v-for="t in opcionesTipo" :key="t">{{ t }}</option>
              </select>
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Peso (kg)</label>
              <input type="number" v-model="visitaForm.peso" step="0.01" min="0" placeholder="ej. 22.5" />
            </div>
            <div class="field">
              <label>Talla (cm)</label>
              <input type="number" v-model="visitaForm.talla" step="0.1" min="0" placeholder="ej. 110.5" />
            </div>
            <div class="field">
              <label>Temperatura (°C)</label>
              <input type="number" v-model="visitaForm.temp" step="0.1" min="0" placeholder="ej. 36.5" />
            </div>
          </div>
          <div class="field">
            <label>Observaciones</label>
            <textarea v-model="visitaForm.obs" placeholder="Notas del control clínico..."></textarea>
          </div>
          <div class="field">
            <label>¿El seguimiento es continuo?</label>
            <select v-model="visitaForm.continua">
              <option value="si">Sí — Seguimiento continuo</option>
              <option value="no">No — Requiere derivación a centro de salud</option>
            </select>
          </div>
          <div class="alert alert-warning" v-if="visitaForm.continua === 'no'" style="margin-top:0">
            <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <span>Este alumno será marcado como <strong>pendiente de derivación</strong> al centro de salud.</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="cerrarModalVisita">Cancelar</button>
          <button class="btn btn-primary" @click="guardarVisita" :disabled="!visitaForm.fecha">
            <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            Guardar Visita
          </button>
        </div>
      </div>
    </div>
  </transition>
</template>