<script setup>
import { ref, computed, watch } from 'vue'
import { store } from '../store.js'

const {
  alumnosPorSeccion,
  alumnoSeleccionado,
  seleccionarAlumno,
  fichaForm,
  vacunasForm,
  edadFicha,
  abrirFichaForm,
  guardarFicha,
  agregarVacuna,
  quitarVacuna,
  clasificaciones,
  infoClasificacion,
  getFicha,
  alumnoHistorial,
  ultimaFecha,
  alumnoEstado,
  getEstadoClass,
  abrirModalVisita,
  eliminarVisita,
  logoEscuela,
  subirLogo,
  quitarLogo,
  destinoLabel
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

watch(alumnoSeleccionado, () => {
  if (alumnoSeleccionado.value) abrirFichaForm()
}, { immediate: true })

const fichaGuardada = computed(() => {
  if (!alumnoSeleccionado.value) return null
  return getFicha(alumnoSeleccionado.value.sec, alumnoSeleccionado.value.idx)
})

const clasificacionActual = computed(() => {
  return infoClasificacion(fichaForm.clasificacion)
})

const nombreAlumno = computed(() => {
  if (!alumnoSeleccionado.value) return ''
  return alumnosPorSeccion.value[alumnoSeleccionado.value.sec]?.[alumnoSeleccionado.value.idx]?.nombre || ''
})

const seccionAlumno = computed(() => alumnoSeleccionado.value?.sec || '')

const fechaEmision = computed(() =>
  new Date().toLocaleDateString('es-PE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

function limpiarSeleccion() {
  alumnoSeleccionado.value = null
  busqueda.value = ''
}

function descargarPDF() {
  window.print()
}

function paTexto(v) {
  if (!v) return '—'
  if (v.paSis != null && v.paDia != null) return v.paSis + '/' + v.paDia
  if (v.paSis != null) return v.paSis + '/—'
  return '—'
}

function paTextoFicha() {
  const paSis = fichaForm.signosVitales.presionArterialSistolica
  const paDia = fichaForm.signosVitales.presionArterialDiastolica
  if (paSis != null && paDia != null) return paSis + '/' + paDia
  if (paSis != null) return paSis + '/—'
  return '—'
}
</script>

<template>
  <div class="page">
    <div class="page-header" v-if="!alumnoSeleccionado">
      <div>
        <h1 class="page-title">Fichas de Salud</h1>
        <p class="page-subtitle">Registro de datos personales, antecedentes, vacunación, atenciones y clasificación médica</p>
      </div>
      <div class="no-print" style="display:flex;gap:8px;align-items:center">
        <img v-if="logoEscuela" :src="logoEscuela" class="logo-preview" title="Logo actual" />
        <button class="btn btn-secondary" @click="subirLogo">
          <svg viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          Subir logo
        </button>
        <button v-if="logoEscuela" class="btn btn-secondary" @click="quitarLogo">
          <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
          Restaurar escudo
        </button>
      </div>
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
          <span>Elige al alumno para crear su ficha, registrar sus atenciones o descargar su ficha en PDF.</span>
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
              <span v-if="getFicha(item.sec, item.idx)?.clasificacion && infoClasificacion(getFicha(item.sec, item.idx).clasificacion)" class="alumno-status">
                <span class="badge" :class="infoClasificacion(getFicha(item.sec, item.idx).clasificacion).cls">
                  {{ infoClasificacion(getFicha(item.sec, item.idx).clasificacion).label }}
                </span>
              </span>
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
            {{ nombreAlumno }}
          </h3>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span class="badge" :class="clasificacionActual?.cls || 'badge-neutral'">
              {{ clasificacionActual?.label || 'Sin clasificar' }}
            </span>
            <button class="btn btn-secondary btn-sm no-print" @click="abrirModalVisita">
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Nueva Visita
            </button>
            <button class="btn btn-accent btn-sm no-print" @click="descargarPDF" title="Descargar ficha como PDF">
              <svg viewBox="0 0 24 24"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
              Descargar PDF
            </button>
            <button class="btn btn-ghost btn-sm no-print" @click="limpiarSeleccion">Cambiar alumno</button>
          </div>
        </div>
        <div class="card-body">
          <div class="field-row">
            <div class="field">
              <label>Sección</label>
              <input type="text" :value="seccionAlumno" readonly style="background:var(--surface-alt);color:var(--text-secondary)" />
            </div>
            <div class="field">
              <label>Total de atenciones</label>
              <input type="text" :value="alumnoHistorial.length" readonly style="background:var(--surface-alt);color:var(--text-secondary)" />
            </div>
            <div class="field">
              <label>Última visita</label>
              <input type="text" :value="ultimaFecha" readonly style="background:var(--surface-alt);color:var(--text-secondary)" />
            </div>
            <div class="field">
              <label>Estado del seguimiento</label>
              <input type="text" :value="alumnoEstado.label" readonly :style="{ background: alumnoEstado.bg, color: alumnoEstado.color }" />
            </div>
          </div>
          <div class="alert alert-warning no-print" v-if="fichaForm.clasificacion === 'requiere_atencion'" style="margin-top:0">
            <svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
            <span>Este alumno <strong>NO es apto</strong> y debe recibir atención médica. Se recomienda informar a los padres y derivar a un centro de salud.</span>
          </div>
          <div class="alert alert-info no-print" v-else-if="fichaForm.clasificacion === 'con_observacion'" style="margin-top:0">
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
            <span>Apto pero con observaciones. Revisa la nota de clasificación para conocer las recomendaciones.</span>
          </div>
        </div>
      </div>

      <!-- Datos personales -->
      <div class="card">
        <div class="card-header">
          <h3><span class="material-icons">badge</span> Datos personales</h3>
        </div>
        <div class="card-body">
          <div class="field-row">
            <div class="field">
              <label>DNI</label>
              <input type="text" v-model="fichaForm.dni" placeholder="ej. 12345678" maxlength="8" />
            </div>
            <div class="field">
              <label>Fecha de nacimiento</label>
              <input type="date" v-model="fichaForm.fechaNacimiento" />
            </div>
            <div class="field">
              <label>Edad</label>
              <input type="text" :value="edadFicha ? edadFicha + ' años' : '—'" readonly style="background:var(--surface-alt);color:var(--text-secondary)" />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Madre o apoderado</label>
              <input type="text" v-model="fichaForm.madreApoderado" placeholder="Nombre completo" />
            </div>
            <div class="field">
              <label>Teléfono</label>
              <input type="text" v-model="fichaForm.telefono" placeholder="ej. 987 654 321" />
            </div>
          </div>
        </div>
      </div>

      <!-- Antecedentes personales -->
      <div class="card">
        <div class="card-header">
          <h3><span class="material-icons">health_and_safety</span> Antecedentes personales</h3>
        </div>
        <div class="card-body">
          <div class="field-row">
            <div class="field">
              <label>Enfermedades</label>
              <input v-model="fichaForm.antecedentes.enfermedades" placeholder="ej. Asma, anemia, diabetes..." />
            </div>
            <div class="field">
              <label>Discapacidades</label>
              <input v-model="fichaForm.antecedentes.discapacidades" placeholder="ej. Ninguna; motora; visual..." />
            </div>
          </div>
          <div class="field">
            <label>Hospitalizaciones</label>
            <input v-model="fichaForm.antecedentes.hospitalizaciones" placeholder="ej. Ninguna; apendicitis en 2023..." />
          </div>
          <div class="field-row">
            <div class="field">
              <label>Tratamiento</label>
              <input v-model="fichaForm.antecedentes.tratamiento" placeholder="ej. Ninguno; fisioterapia; control..." />
            </div>
            <div class="field">
              <label>¿Toma algún medicamento?</label>
              <input v-model="fichaForm.antecedentes.medicamentos" placeholder="ej. Salbutamol 2 puff" />
            </div>
            <div class="field">
              <label>Dosis / frecuencia</label>
              <input v-model="fichaForm.antecedentes.dosis" placeholder="ej. Cada 8 horas" />
            </div>
          </div>
        </div>
      </div>

      <!-- Alergias -->
      <div class="card">
        <div class="card-header">
          <h3><span class="material-icons">report</span> Alergias</h3>
        </div>
        <div class="card-body">
          <div class="field">
            <textarea v-model="fichaForm.alergias" placeholder="ej. Ninguna conocida; Penicilina; maní; polvo..." rows="3"></textarea>
          </div>
        </div>
      </div>

      <!-- Vacunación -->
      <div class="card">
        <div class="card-header">
          <h3><span class="material-icons">vaccines</span> Vacunación / Control de vacunación</h3>
        </div>
        <div class="card-body">
          <div v-for="(v, i) in vacunasForm" :key="i" class="field-row" style="align-items:flex-end">
            <div class="field" style="flex:2">
              <label>Vacuna</label>
              <input v-model="v.vacuna" placeholder="ej. Pentavalente" />
            </div>
            <div class="field">
              <label>Fecha</label>
              <input type="date" v-model="v.fecha" />
            </div>
            <div class="field">
              <label>Dosis</label>
              <input v-model="v.dosis" placeholder="ej. 2da dosis" />
            </div>
            <button class="btn-icon danger" style="margin-bottom:14px;flex-shrink:0" @click="quitarVacuna(i)" title="Quitar vacuna">
              <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><line x1="10" y1="11" x2="10" y2="17" /><line x1="14" y1="11" x2="14" y2="17" /></svg>
            </button>
          </div>
          <button class="btn btn-secondary btn-sm" @click="agregarVacuna">
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Agregar vacuna
          </button>
        </div>
      </div>

      <!-- Signos Vitales -->
      <div class="card">
        <div class="card-header">
          <h3><span class="material-icons">monitor_heart</span> Signos Vitales</h3>
        </div>
        <div class="card-body">
          <div class="field-row">
            <div class="field">
              <label>Frecuencia Cardíaca (lpm)</label>
              <input type="number" v-model.number="fichaForm.signosVitales.frecuenciaCardiaca" placeholder="ej. 80" />
            </div>
            <div class="field">
              <label>Frecuencia Respiratoria (rpm)</label>
              <input type="number" v-model.number="fichaForm.signosVitales.frecuenciaRespiratoria" placeholder="ej. 20" />
            </div>
            <div class="field">
              <label>Presión Arterial Sistólica (mmHg)</label>
              <input type="number" v-model.number="fichaForm.signosVitales.presionArterialSistolica" placeholder="ej. 120" />
            </div>
            <div class="field">
              <label>Presión Arterial Diastólica (mmHg)</label>
              <input type="number" v-model.number="fichaForm.signosVitales.presionArterialDiastolica" placeholder="ej. 80" />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Temperatura (°C)</label>
              <input type="number" step="0.1" v-model.number="fichaForm.signosVitales.temperatura" placeholder="ej. 36.5" />
            </div>
            <div class="field">
              <label>Saturación O₂ (%)</label>
              <input type="number" v-model.number="fichaForm.signosVitales.saturacionO2" placeholder="ej. 98" />
            </div>
          </div>
        </div>
      </div>

      <!-- Evaluación de Triaje -->
      <div class="card">
        <div class="card-header">
          <h3><span class="material-icons">assessment</span> Evaluación de Triaje</h3>
        </div>
        <div class="card-body">
          <div class="field-row">
            <div class="field">
              <label>Peso (kg)</label>
              <input type="number" step="0.1" v-model.number="fichaForm.evaluacionTriaje.peso" placeholder="ej. 25.5" />
            </div>
            <div class="field">
              <label>Talla (cm)</label>
              <input type="number" v-model.number="fichaForm.evaluacionTriaje.talla" placeholder="ej. 120" />
            </div>
            <div class="field">
              <label>IMC</label>
              <input type="number" step="0.1" v-model.number="fichaForm.evaluacionTriaje.imc" placeholder="ej. 17.7" />
            </div>
            <div class="field">
              <label>Puntuación Z</label>
              <input type="number" step="0.1" v-model.number="fichaForm.evaluacionTriaje.puntuacionZ" placeholder="ej. 0.5" />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Hemoglobina (g/dL)</label>
              <input type="number" step="0.1" v-model.number="fichaForm.evaluacionTriaje.hemoglobina" placeholder="ej. 12.5" />
            </div>
            <div class="field">
              <label>Salud Bucal</label>
              <input v-model="fichaForm.evaluacionTriaje.saludBucal" placeholder="ej. Normal" />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Salud Ocular - Ojo Izquierdo</label>
              <input v-model="fichaForm.evaluacionTriaje.saludOcularIzquierdo" placeholder="ej. Normal" />
            </div>
            <div class="field">
              <label>Salud Ocular - Ojo Derecho</label>
              <input v-model="fichaForm.evaluacionTriaje.saludOcularDerecho" placeholder="ej. Normal" />
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label>Salud Auditiva - Oído Izquierdo</label>
              <input v-model="fichaForm.evaluacionTriaje.saludAuditivaIzquierdo" placeholder="ej. Normal" />
            </div>
            <div class="field">
              <label>Salud Auditiva - Oído Derecho</label>
              <input v-model="fichaForm.evaluacionTriaje.saludAuditivaDerecho" placeholder="ej. Normal" />
            </div>
          </div>
          <div class="field">
            <label>Observaciones de Triaje</label>
            <textarea v-model="fichaForm.evaluacionTriaje.observaciones" placeholder="Observaciones adicionales..." rows="3"></textarea>
          </div>
        </div>
      </div>

      <!-- Historico de atenciones -->
      <div class="card">
        <div class="card-header">
          <h3><span class="material-icons">history</span> Atenciones / visitas clínicas</h3>
          <span style="font-size:12px;color:var(--text-muted)">{{ alumnoHistorial.length }} registros</span>
        </div>
        <div class="card-body" style="padding:0">
          <div v-if="!alumnoHistorial.length" style="padding:28px;text-align:center;color:var(--text-muted)">
            <span class="material-icons" style="font-size:36px;display:block;margin-bottom:8px">event_note</span>
            <p>No hay atenciones registradas</p>
            <button class="btn btn-nurse btn-sm" style="margin-top:10px" @click="abrirModalVisita">
              <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              Registrar primera visita
            </button>
          </div>
          <div v-else class="table-wrap">
            <table class="tabla">
              <thead>
                <tr>
                  <th>Fecha</th><th>Tipo</th><th>Destino</th><th>Peso (kg)</th><th>Talla (cm)</th>
                  <th>Temp (°C)</th><th>Hemo (g/dL)</th><th>F.C. (lpm)</th><th>F.R. (rpm)</th>
                  <th>P.A. (mmHg)</th><th>SpO₂ (%)</th><th>Observaciones</th><th>Continua</th><th></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(v, i) in alumnoHistorial" :key="i">
                  <td style="font-weight:500">{{ v.fecha }}</td>
                  <td>{{ v.tipo }}</td>
                  <td>{{ destinoLabel(v) }}</td>
                  <td>{{ v.peso != null ? v.peso : '—' }}</td>
                  <td>{{ v.talla != null ? v.talla : '—' }}</td>
                  <td>{{ v.temp != null ? v.temp : '—' }}</td>
                  <td>{{ v.hemoglobina != null ? v.hemoglobina : '—' }}</td>
                  <td>{{ v.fc != null ? v.fc : '—' }}</td>
                  <td>{{ v.fr != null ? v.fr : '—' }}</td>
                  <td>{{ v.paSis != null && v.paDia != null ? v.paSis + '/' + v.paDia : (v.paSis != null ? v.paSis + '/—' : '—') }}</td>
                  <td>{{ v.spo2 != null ? v.spo2 : '—' }}</td>
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

      <!-- Clasificación -->
      <div class="card">
        <div class="card-header">
          <h3><span class="material-icons">verified</span> Clasificación médica</h3>
        </div>
        <div class="card-body">
          <div class="clasif-options">
            <div
              v-for="c in clasificaciones"
              :key="c.id"
              class="clasif-option"
              :class="{ active: fichaForm.clasificacion === c.id }"
              @click="fichaForm.clasificacion = c.id"
            >
              <span class="radio-dot"></span>
              <div>
                <div class="clasif-label" :style="{ color: c.color }">{{ c.label }}</div>
                <div class="clasif-desc">{{ c.desc }}</div>
              </div>
            </div>
          </div>
          <div class="field" style="margin-top:14px;margin-bottom:0">
            <label>Observaciones / recomendaciones</label>
            <textarea v-model="fichaForm.nota" placeholder="Detalles del diagnóstico o recomendaciones médicas..." rows="3"></textarea>
          </div>
        </div>
      </div>

      <div class="no-print" style="display:flex;justify-content:space-between;gap:8px">
        <button class="btn btn-secondary" @click="limpiarSeleccion">Salir</button>
        <div style="display:flex;gap:8px">
          <button class="btn btn-primary" @click="guardarFicha">
            <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
            Guardar Ficha de Salud
          </button>
          <button class="btn btn-accent" @click="descargarPDF">
            <svg viewBox="0 0 24 24"><path d="M6 9V2h12v7" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
            Descargar PDF
          </button>
        </div>
      </div>

      <!-- ===== DOCUMENTO PARA PDF ===== -->
      <div id="ficha-print">
        <div class="fp-header">
          <img v-if="logoEscuela" :src="logoEscuela" class="fp-logo" alt="Logo del colegio" />
          <div class="fp-encabezado">
            <div class="fp-escuela">COLEGIO GALILEO</div>
            <div class="fp-titulo">FICHA DE SALUD</div>
            <div class="fp-subtitulo">Control de salud escolar · {{ seccionAlumno }}</div>
          </div>
          <div class="fp-clasif-badge" :class="clasificacionActual?.id || 'sin'">
            {{ clasificacionActual?.label || 'Sin clasificar' }}
          </div>
        </div>

        <div class="fp-section">
          <h3>Datos del alumno</h3>
          <div class="fp-grid">
            <div class="fp-campo">
              <label>Apellidos y nombres</label>
              <p>{{ nombreAlumno || '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Sección</label>
              <p>{{ seccionAlumno || '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>DNI</label>
              <p :class="{ blank: !fichaForm.dni }">{{ fichaForm.dni || '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Fecha de nacimiento</label>
              <p :class="{ blank: !fichaForm.fechaNacimiento }">{{ fichaForm.fechaNacimiento || '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Edad</label>
              <p :class="{ blank: !edadFicha }">{{ edadFicha ? edadFicha + ' años' : '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Madre o apoderado</label>
              <p :class="{ blank: !fichaForm.madreApoderado }">{{ fichaForm.madreApoderado || '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Teléfono</label>
              <p :class="{ blank: !fichaForm.telefono }">{{ fichaForm.telefono || '—' }}</p>
            </div>
          </div>
        </div>

        <div class="fp-section">
          <h3>Antecedentes personales</h3>
          <div class="fp-grid">
            <div class="fp-campo">
              <label>Enfermedades</label>
              <p :class="{ blank: !fichaForm.antecedentes.enfermedades }">{{ fichaForm.antecedentes.enfermedades || 'Ninguna' }}</p>
            </div>
            <div class="fp-campo">
              <label>Discapacidades</label>
              <p :class="{ blank: !fichaForm.antecedentes.discapacidades }">{{ fichaForm.antecedentes.discapacidades || 'Ninguna' }}</p>
            </div>
            <div class="fp-campo">
              <label>Hospitalizaciones</label>
              <p :class="{ blank: !fichaForm.antecedentes.hospitalizaciones }">{{ fichaForm.antecedentes.hospitalizaciones || 'Ninguna' }}</p>
            </div>
            <div class="fp-campo">
              <label>Tratamiento</label>
              <p :class="{ blank: !fichaForm.antecedentes.tratamiento }">{{ fichaForm.antecedentes.tratamiento || 'Ninguno' }}</p>
            </div>
            <div class="fp-campo">
              <label>Medicamentos</label>
              <p :class="{ blank: !fichaForm.antecedentes.medicamentos }">{{ fichaForm.antecedentes.medicamentos || 'No' }}</p>
            </div>
            <div class="fp-campo">
              <label>Dosis / frecuencia</label>
              <p :class="{ blank: !fichaForm.antecedentes.dosis }">{{ fichaForm.antecedentes.dosis || '—' }}</p>
            </div>
          </div>
        </div>

        <div class="fp-section">
          <h3>Alergias</h3>
          <p :class="{ blank: !fichaForm.alergias }">{{ fichaForm.alergias || 'Ninguna conocida' }}</p>
        </div>

        <div class="fp-section">
          <h3>Vacunación / Control de vacunación</h3>
          <table class="fp-table">
            <thead>
              <tr><th>Vacuna</th><th>Fecha</th><th>Dosis</th></tr>
            </thead>
            <tbody>
              <tr v-for="(v, i) in vacunasForm.filter(x => x.vacuna.trim())" :key="i">
                <td>{{ v.vacuna }}</td>
                <td>{{ v.fecha || '—' }}</td>
                <td>{{ v.dosis || '—' }}</td>
              </tr>
              <tr v-if="!vacunasForm.filter(x => x.vacuna.trim()).length">
                <td colspan="3" style="text-align:center;color:var(--text-muted);font-style:italic">Sin registros de vacunación</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="fp-section">
          <h3>Signos Vitales</h3>
          <div class="fp-grid">
            <div class="fp-campo">
              <label>Frecuencia Cardíaca</label>
              <p :class="{ blank: !fichaForm.signosVitales.frecuenciaCardiaca }">{{ fichaForm.signosVitales.frecuenciaCardiaca ? fichaForm.signosVitales.frecuenciaCardiaca + ' lpm' : '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Frecuencia Respiratoria</label>
              <p :class="{ blank: !fichaForm.signosVitales.frecuenciaRespiratoria }">{{ fichaForm.signosVitales.frecuenciaRespiratoria ? fichaForm.signosVitales.frecuenciaRespiratoria + ' rpm' : '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Presión Arterial</label>
              <p :class="{ blank: !fichaForm.signosVitales.presionArterialSistolica && !fichaForm.signosVitales.presionArterialDiastolica }">
                {{ fichaForm.signosVitales.presionArterialSistolica && fichaForm.signosVitales.presionArterialDiastolica ? fichaForm.signosVitales.presionArterialSistolica + '/' + fichaForm.signosVitales.presionArterialDiastolica + ' mmHg' : '—' }}
              </p>
            </div>
            <div class="fp-campo">
              <label>Temperatura</label>
              <p :class="{ blank: !fichaForm.signosVitales.temperatura }">{{ fichaForm.signosVitales.temperatura ? fichaForm.signosVitales.temperatura + ' °C' : '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Saturación O₂</label>
              <p :class="{ blank: !fichaForm.signosVitales.saturacionO2 }">{{ fichaForm.signosVitales.saturacionO2 ? fichaForm.signosVitales.saturacionO2 + ' %' : '—' }}</p>
            </div>
          </div>
        </div>

        <div class="fp-section">
          <h3>Evaluación de Triaje</h3>
          <div class="fp-grid">
            <div class="fp-campo">
              <label>Peso</label>
              <p :class="{ blank: !fichaForm.evaluacionTriaje.peso }">{{ fichaForm.evaluacionTriaje.peso ? fichaForm.evaluacionTriaje.peso + ' kg' : '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Talla</label>
              <p :class="{ blank: !fichaForm.evaluacionTriaje.talla }">{{ fichaForm.evaluacionTriaje.talla ? fichaForm.evaluacionTriaje.talla + ' cm' : '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>IMC</label>
              <p :class="{ blank: !fichaForm.evaluacionTriaje.imc }">{{ fichaForm.evaluacionTriaje.imc || '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Puntuación Z</label>
              <p :class="{ blank: !fichaForm.evaluacionTriaje.puntuacionZ }">{{ fichaForm.evaluacionTriaje.puntuacionZ || '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Hemoglobina</label>
              <p :class="{ blank: !fichaForm.evaluacionTriaje.hemoglobina }">{{ fichaForm.evaluacionTriaje.hemoglobina ? fichaForm.evaluacionTriaje.hemoglobina + ' g/dL' : '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Salud Bucal</label>
              <p :class="{ blank: !fichaForm.evaluacionTriaje.saludBucal }">{{ fichaForm.evaluacionTriaje.saludBucal || '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Salud Ocular - Izquierdo</label>
              <p :class="{ blank: !fichaForm.evaluacionTriaje.saludOcularIzquierdo }">{{ fichaForm.evaluacionTriaje.saludOcularIzquierdo || '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Salud Ocular - Derecho</label>
              <p :class="{ blank: !fichaForm.evaluacionTriaje.saludOcularDerecho }">{{ fichaForm.evaluacionTriaje.saludOcularDerecho || '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Salud Auditiva - Izquierdo</label>
              <p :class="{ blank: !fichaForm.evaluacionTriaje.saludAuditivaIzquierdo }">{{ fichaForm.evaluacionTriaje.saludAuditivaIzquierdo || '—' }}</p>
            </div>
            <div class="fp-campo">
              <label>Salud Auditiva - Derecho</label>
              <p :class="{ blank: !fichaForm.evaluacionTriaje.saludAuditivaDerecho }">{{ fichaForm.evaluacionTriaje.saludAuditivaDerecho || '—' }}</p>
            </div>
          </div>
          <div v-if="fichaForm.evaluacionTriaje.observaciones" style="margin-top:12px">
            <label>Observaciones de Triaje</label>
            <p :class="{ blank: !fichaForm.evaluacionTriaje.observaciones }">{{ fichaForm.evaluacionTriaje.observaciones }}</p>
          </div>
        </div>

        <div class="fp-section">
          <h3>Historial de atenciones / visitas</h3>
          <table class="fp-table">
            <thead>
              <tr>
                <th>Fecha</th><th>Tipo</th><th>Destino</th><th>Peso</th><th>Talla</th><th>T°</th><th>Hemo</th>
                <th>F.C.</th><th>F.R.</th><th>P.A.</th><th>SpO₂</th><th>Observaciones</th><th>Continua</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(v, i) in alumnoHistorial" :key="i">
                <td>{{ v.fecha }}</td>
                <td>{{ v.tipo }}</td>
                <td>{{ destinoLabel(v) }}</td>
                <td>{{ v.peso ?? '—' }}</td>
                <td>{{ v.talla ?? '—' }}</td>
                <td>{{ v.temp ?? '—' }}</td>
                <td>{{ v.hemoglobina ?? '—' }}</td>
                <td>{{ v.fc ?? '—' }}</td>
                <td>{{ v.fr ?? '—' }}</td>
                <td>{{ paTexto(v) }}</td>
                <td>{{ v.spo2 ?? '—' }}</td>
                <td style="min-width:120px">{{ v.obs || '—' }}</td>
                <td>{{ v.continua === 'si' ? 'Sí' : 'No' }}</td>
              </tr>
              <tr v-if="!alumnoHistorial.length">
                <td colspan="13" style="text-align:center;color:var(--text-muted);font-style:italic">Sin atenciones registradas.</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="fp-clasif-box" :class="clasificacionActual?.id || 'sin'">
          <h4>Clasificación médica: {{ clasificacionActual?.label || 'Sin clasificar' }}</h4>
          <p>{{ clasificacionActual?.desc }}</p>
          <p v-if="fichaForm.nota" class="fp-nota"><strong>Observaciones:</strong> {{ fichaForm.nota }}</p>
        </div>

        <div class="fp-footer">
          <div>Fecha de emisión: {{ fechaEmision }}</div>
          <div class="fp-firma">
            <div>____________________________</div>
            <div>Responsable de salud del colegio · Colegio Galileo</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>