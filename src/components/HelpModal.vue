<script setup>
import { store } from '../store.js'

const { ayudaOpen } = store

function cerrar() {
  ayudaOpen.value = false
}
</script>

<template>
  <transition name="modal">
    <div v-if="ayudaOpen" class="modal-overlay" @click.self="cerrar">
      <div class="modal" style="max-width:500px">
        <div class="modal-header">
          <h2>Ayuda</h2>
          <button class="modal-close" @click="cerrar">
            <svg viewBox="0 0 24 24"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
        <div class="modal-body" style="font-size:13.5px;color:var(--text-secondary);line-height:1.8">
          <p style="margin-bottom:14px"><strong>Sistema de Seguimiento Clínico — Academia Galileo</strong></p>
          <div style="display:flex;flex-direction:column;gap:12px">
            <p>1. <strong>Dashboard</strong>: panel general con estadísticas del seguimiento.</p>
            <p>2. <strong>Alumnos</strong>: lista completa organizada por las 19 secciones. Haz click en un alumno para seleccionarlo.</p>
            <p>3. <strong>Seguimiento</strong>: registra visitas con fecha, peso, talla, temperatura y observaciones.</p>
            <p>4. <strong>Reporte</strong>: muestra alumnos que deben derivarse a centro de salud por falta de continuidad.</p>
            <hr style="border:none;border-top:1px solid var(--border);margin:4px 0" />
            <p><strong>Exportar:</strong> Usa los botones del sidebar para descargar JSON o CSV (compatible con Excel).</p>
            <p><strong>LocalStorage:</strong> los datos se guardan en tu navegador. No se pierden al recargar.</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-primary" @click="cerrar">Entendido</button>
        </div>
      </div>
    </div>
  </transition>
</template>