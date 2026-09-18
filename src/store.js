import { ref, reactive, computed } from 'vue'
import { alumnos } from './data/alumnos.js'
import escudoDefault from './assets/escudo.png'

const STORAGE_KEY = 'seguimientoGalileo_vue'
const STORAGE_KEY_FICHAS = 'seguimientoGalileo_fichas_vue'
const STORAGE_KEY_LOGO = 'seguimientoGalileo_logo'

const alumnosPorSeccion = ref(alumnos)

const historial = ref({})
try {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) historial.value = JSON.parse(stored)
} catch (e) {
  /* ignore */
}

const fichas = ref({})
try {
  const storedF = localStorage.getItem(STORAGE_KEY_FICHAS)
  if (storedF) fichas.value = JSON.parse(storedF)
} catch (e) {
  /* ignore */
}

const logoEscuela = ref(escudoDefault)
try {
  const storedLogo = localStorage.getItem(STORAGE_KEY_LOGO)
  if (storedLogo) logoEscuela.value = storedLogo
} catch (e) {
  /* ignore */
}

const activePage = ref('dashboard')
const busquedaAlumnos = ref('')
const seccionActiva = ref(null)
const alumnoSeleccionado = ref(null)
const modalVisita = ref(false)
const ayudaOpen = ref(false)
const toast = ref({ show: false, msg: '', cls: 'info', icon: 'info' })

const visitaForm = reactive({
  fecha: '',
  tipo: 'Control General',
  peso: null,
  talla: null,
  temp: null,
  hemoglobina: null,
  fc: null,
  fr: null,
  paSis: null,
  paDia: null,
  spo2: null,
  destino: 'salon',
  destinoOtro: '',
  obs: '',
  continua: 'si'
})

const fichaForm = reactive({
  dni: '',
  fechaNacimiento: '',
  madreApoderado: '',
  telefono: '',
  antecedentes: {
    enfermedades: '',
    discapacidades: '',
    hospitalizaciones: '',
    tratamiento: '',
    medicamentos: '',
    dosis: ''
  },
  alergias: '',
  clasificacion: 'apto',
  nota: ''
})

const destinos = [
  { id: 'salon', label: 'Regresa a su salón' },
  { id: 'centro_salud', label: 'Derivado a centro de salud' },
  { id: 'casa', label: 'Enviado a su casa' },
  { id: 'otro', label: 'Otro destino' }
]

function destinoLabel(v) {
  if (!v) return '—'
  if (v.destino === 'otro') return v.destinoOtro ? 'Otro: ' + v.destinoOtro : 'Otro'
  const d = destinos.find(x => x.id === v.destino)
  return d ? d.label : '—'
}

const vacunasForm = ref([])

const menuItems = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'alumnos', label: 'Alumnos' },
  { id: 'fichas', label: 'Fichas de Salud' },
  { id: 'reporte', label: 'Reporte' }
]

const criterios = [
  'Su ficha de salud está clasificada como "Requiere atención médica".',
  'Fue derivado a un centro de salud en alguna visita registrada.'
]

const clasificaciones = [
  { id: 'apto', label: 'Apto', cls: 'badge-ok', color: '#0d9c6b', bg: '#e6f7ef', desc: 'Sin restricciones. Puede realizar toda actividad.' },
  { id: 'con_observacion', label: 'Apto con observación', cls: 'badge-warn', color: '#e37400', bg: '#fff4e0', desc: 'Apto con limitaciones o recomendaciones (p. ej. evitar esfuerzo intenso).' },
  { id: 'requiere_atencion', label: 'Requiere atención médica', cls: 'badge-bad', color: '#d93025', bg: '#fde8e8', desc: 'No apto. Debe ser derivado y atendido por personal de salud.' }
]

const totalAlumnos = computed(() => {
  let c = 0
  for (const s of Object.keys(alumnosPorSeccion.value)) c += alumnosPorSeccion.value[s].length
  return c
})

const stats = computed(() => {
  let ok = 0
  let warn = 0
  let bad = 0
  for (const sec of Object.keys(alumnosPorSeccion.value)) {
    for (let i = 0; i < alumnosPorSeccion.value[sec].length; i++) {
      const e = calcularEstado(obtenerHistorial(sec, i))
      if (e.estado === 'ok') ok++
      else if (e.estado === 'warn') warn++
      else if (e.estado === 'bad') bad++
    }
  }
  return { ok, warning: warn, bad }
})

const statsFichas = computed(() => {
  const res = { apto: 0, obs: 0, req: 0, sin: 0 }
  for (const sec of Object.keys(alumnosPorSeccion.value)) {
    for (let i = 0; i < alumnosPorSeccion.value[sec].length; i++) {
      const f = fichas.value[sec + '_' + i]
      if (!f || !f.clasificacion) res.sin++
      else if (f.clasificacion === 'apto') res.apto++
      else if (f.clasificacion === 'con_observacion') res.obs++
      else if (f.clasificacion === 'requiere_atencion') res.req++
    }
  }
  return res
})

const edadFicha = computed(() => {
  const fn = fichaForm.fechaNacimiento
  if (!fn) return ''
  const n = new Date(fn)
  if (isNaN(n.getTime())) return ''
  const hoy = new Date()
  let edad = hoy.getFullYear() - n.getFullYear()
  const m = hoy.getMonth() - n.getMonth()
  if (m < 0 || (m === 0 && hoy.getDate() < n.getDate())) edad--
  return edad >= 0 ? edad : ''
})

const topRisk = computed(() => {
  const lista = []
  for (const sec of Object.keys(alumnosPorSeccion.value)) {
    for (let i = 0; i < alumnosPorSeccion.value[sec].length; i++) {
      const e = calcularEstado(obtenerHistorial(sec, i))
      if (e.estado === 'bad' || e.estado === 'warn') {
        const v = obtenerHistorial(sec, i)
        const ult = v.length ? v[v.length - 1].fecha : 'Nunca'
        const dias = diasDesde(ult)
        lista.push({ nombre: alumnosPorSeccion.value[sec][i].nombre, sec, ultima: ult, dias, idx: i })
      }
    }
  }
  lista.sort((a, b) => b.dias - a.dias)
  return lista.slice(0, 5)
})

const seccionesFiltradas = computed(() => {
  const q = busquedaAlumnos.value.toLowerCase().trim()
  if (!q) return Object.keys(alumnosPorSeccion.value).sort()
  return Object.keys(alumnosPorSeccion.value)
    .filter(sec =>
      sec.toLowerCase().includes(q) ||
      alumnosPorSeccion.value[sec].some(a => a.nombre.toLowerCase().includes(q))
    )
    .sort()
})

const seccionesFiltradasObj = computed(() => {
  const q = busquedaAlumnos.value.toLowerCase().trim()
  const obj = {}
  for (const sec of seccionesFiltradas.value) {
    let lista = alumnosPorSeccion.value[sec]
    if (q) lista = lista.filter(a => a.nombre.toLowerCase().includes(q))
    if (seccionActiva.value && seccionActiva.value !== sec) continue
    obj[sec] = lista
  }
  return obj
})

const alumnoActual = computed(() => {
  if (!alumnoSeleccionado.value) return null
  const { sec, idx } = alumnoSeleccionado.value
  return alumnosPorSeccion.value[sec]?.[idx] || null
})

const alumnoHistorial = computed(() => {
  if (!alumnoSeleccionado.value) return []
  const { sec, idx } = alumnoSeleccionado.value
  return historial.value[sec + '_' + idx] || []
})

const ultimaFecha = computed(() => {
  if (!alumnoHistorial.value.length) return '—'
  return alumnoHistorial.value[alumnoHistorial.value.length - 1].fecha
})

const alumnoEstado = computed(() => {
  return calcularEstado(alumnoHistorial.value)
})

function requiereDerivacion(sec, i) {
  const f = getFicha(sec, i)
  if (f && f.clasificacion === 'requiere_atencion') return true
  return obtenerHistorial(sec, i).some(x => x.destino === 'centro_salud')
}

const derivados = computed(() => {
  const lista = []
  for (const sec of Object.keys(alumnosPorSeccion.value)) {
    for (let i = 0; i < alumnosPorSeccion.value[sec].length; i++) {
      if (!requiereDerivacion(sec, i)) continue
      const v = obtenerHistorial(sec, i)
      const f = getFicha(sec, i)
      const motivos = []
      if (f && f.clasificacion === 'requiere_atencion') motivos.push('Ficha: requiere atención médica')
      const derivaciones = v.filter(x => x.destino === 'centro_salud')
      if (derivaciones.length) {
        const ult = derivaciones[derivaciones.length - 1]
        motivos.push('Derivado a centro de salud (' + ult.fecha + ')')
      }
      lista.push({
        nombre: alumnosPorSeccion.value[sec][i].nombre,
        sec,
        idx: i,
        ultima: v.length ? v[v.length - 1].fecha : 'Nunca',
        raza: motivos.join(' · ')
      })
    }
  }
  return lista
})

function setPage(p) {
  activePage.value = p
}

function mostrarAyuda() {
  ayudaOpen.value = !ayudaOpen.value
}

function LimpiarDatos() {
  if (!confirm('¿Eliminar todos los registros de visitas? Esta acción no se puede deshacer.')) return
  historial.value = {}
  localStorage.removeItem(STORAGE_KEY)
  toastMsg('Registros eliminados', 'warning', 'warning')
}

function toastMsg(msg, cls = 'info', icon) {
  toast.value = { show: true, msg, cls, icon: icon || 'info' }
  setTimeout(() => { toast.value.show = false }, 3000)
}

function obtenerHistorial(sec, i) {
  return historial.value[sec + '_' + i] || []
}

function diasDesde(fechaStr) {
  if (!fechaStr || fechaStr === 'Nunca') return 9999
  const hoy = new Date()
  const f = new Date(fechaStr)
  return Math.floor((hoy - f) / (1000 * 60 * 60 * 24))
}

function calcularEstado(visitas) {
  if (!visitas.length) return {
    estado: 'neutral',
    label: 'Sin seguimiento',
    cls: 'badge-warn',
    bg: '#fff4e0',
    color: '#e37400',
    msg: 'No hay visitas registradas. Inicia el seguimiento.'
  }
  const hoy = new Date()
  const treinta = new Date()
  treinta.setDate(hoy.getDate() - 30)
  let maxBrecha = 0
  let ult = null
  for (const v of visitas) {
    const f = new Date(v.fecha)
    if (!ult || f > ult) ult = f
  }
  for (let i = 1; i < visitas.length; i++) {
    const d1 = new Date(visitas[i - 1].fecha)
    const d2 = new Date(visitas[i].fecha)
    const dif = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24))
    if (dif > maxBrecha) maxBrecha = dif
  }
  if (maxBrecha > 60) return {
    estado: 'bad',
    label: 'Brecha >60 días',
    cls: 'badge-bad',
    bg: '#fde8e8',
    color: '#d93025',
    msg: `Brecha de ${maxBrecha} días detectada. Derivar a centro de salud.`
  }
  if (!visitas.some(v => new Date(v.fecha) >= treinta)) return {
    estado: 'warn',
    label: 'Sin visita en 30 días',
    cls: 'badge-warn',
    bg: '#fff4e0',
    color: '#e37400',
    msg: 'No hay visita registrada en los últimos 30 días. Revisar prontamente.'
  }
  return {
    estado: 'ok',
    label: 'Seguimiento OK',
    cls: 'badge-ok',
    bg: '#e6f7ef',
    color: '#0d9c6b',
    msg: 'El seguimiento es continuo.'
  }
}

function getEstadoClass(estado) {
  return estado.cls
}

function getAlumnoEstado(sec, i) {
  return calcularEstado(obtenerHistorial(sec, i))
}

function seleccionarAlumno(sec, i) {
  alumnoSeleccionado.value = { sec, idx: i }
}

function irAlumno() {
  setPage('fichas')
}

function getFicha(sec, i) {
  return fichas.value[sec + '_' + i] || null
}

function infoClasificacion(id) {
  return clasificaciones.find(c => c.id === id) || null
}

function clasificacionAlumno(sec, i) {
  const f = getFicha(sec, i)
  if (!f || !f.clasificacion) return null
  return infoClasificacion(f.clasificacion)
}

function abrirFichaForm() {
  if (!alumnoSeleccionado.value) return
  const { sec, idx } = alumnoSeleccionado.value
  const f = getFicha(sec, idx)
  fichaForm.dni = f?.dni || ''
  fichaForm.fechaNacimiento = f?.fechaNacimiento || ''
  fichaForm.madreApoderado = f?.madreApoderado || ''
  fichaForm.telefono = f?.telefono || ''
  fichaForm.antecedentes.enfermedades = f?.antecedentes?.enfermedades || ''
  fichaForm.antecedentes.discapacidades = f?.antecedentes?.discapacidades || ''
  fichaForm.antecedentes.hospitalizaciones = f?.antecedentes?.hospitalizaciones || ''
  fichaForm.antecedentes.tratamiento = f?.antecedentes?.tratamiento || ''
  fichaForm.antecedentes.medicamentos = f?.antecedentes?.medicamentos || ''
  fichaForm.antecedentes.dosis = f?.antecedentes?.dosis || ''
  fichaForm.alergias = f?.alergias || ''
  fichaForm.clasificacion = f?.clasificacion || 'apto'
  fichaForm.nota = f?.nota || ''
  vacunasForm.value = (f?.vacunas || []).map(v => ({
    vacuna: v.vacuna || '',
    fecha: v.fecha || '',
    dosis: v.dosis || ''
  }))
  if (!vacunasForm.value.length) vacunasForm.value.push({ vacuna: '', fecha: '', dosis: '' })
}

function agregarVacuna() {
  vacunasForm.value.push({ vacuna: '', fecha: '', dosis: '' })
}

function quitarVacuna(i) {
  vacunasForm.value.splice(i, 1)
}

function guardarFicha() {
  if (!alumnoSeleccionado.value) return
  const { sec, idx } = alumnoSeleccionado.value
  const id = sec + '_' + idx
  fichas.value[id] = {
    dni: fichaForm.dni.trim(),
    fechaNacimiento: fichaForm.fechaNacimiento,
    madreApoderado: fichaForm.madreApoderado.trim(),
    telefono: fichaForm.telefono.trim(),
    antecedentes: {
      enfermedades: fichaForm.antecedentes.enfermedades.trim(),
      discapacidades: fichaForm.antecedentes.discapacidades.trim(),
      hospitalizaciones: fichaForm.antecedentes.hospitalizaciones.trim(),
      tratamiento: fichaForm.antecedentes.tratamiento.trim(),
      medicamentos: fichaForm.antecedentes.medicamentos.trim(),
      dosis: fichaForm.antecedentes.dosis.trim()
    },
    alergias: fichaForm.alergias.trim(),
    vacunas: vacunasForm.value.filter(v => v.vacuna.trim()).map(v => ({
      vacuna: v.vacuna.trim(),
      fecha: v.fecha,
      dosis: v.dosis.trim()
    })),
    clasificacion: fichaForm.clasificacion,
    nota: fichaForm.nota.trim(),
    actualizada: new Date().toISOString()
  }
  try {
    localStorage.setItem(STORAGE_KEY_FICHAS, JSON.stringify(fichas.value))
  } catch (e) {
    /* ignore */
  }
  toastMsg('Ficha de salud guardada', 'success', 'check_circle')
}

function abrirModalVisita() {
  if (!alumnoSeleccionado.value) return
  visitaForm.fecha = new Date().toISOString().split('T')[0]
  visitaForm.tipo = 'Control General'
  visitaForm.peso = null
  visitaForm.talla = null
  visitaForm.temp = null
  visitaForm.hemoglobina = null
  visitaForm.fc = null
  visitaForm.fr = null
  visitaForm.paSis = null
  visitaForm.paDia = null
  visitaForm.spo2 = null
  visitaForm.destino = 'salon'
  visitaForm.destinoOtro = ''
  visitaForm.obs = ''
  visitaForm.continua = 'si'
  modalVisita.value = true
}

function cerrarModalVisita() {
  modalVisita.value = false
}

function guardarVisita() {
  if (!visitaForm.fecha) {
    toastMsg('La fecha es obligatoria', 'error', 'error')
    return
  }
  const { sec, idx } = alumnoSeleccionado.value
  const id = sec + '_' + idx
  if (!historial.value[id]) historial.value[id] = []
  historial.value[id].push({
    fecha: visitaForm.fecha,
    tipo: visitaForm.tipo,
    peso: visitaForm.peso || null,
    talla: visitaForm.talla || null,
    temp: visitaForm.temp || null,
    hemoglobina: visitaForm.hemoglobina || null,
    fc: visitaForm.fc || null,
    fr: visitaForm.fr || null,
    paSis: visitaForm.paSis || null,
    paDia: visitaForm.paDia || null,
    spo2: visitaForm.spo2 || null,
    destino: visitaForm.destino,
    destinoOtro: visitaForm.destinoOtro || '',
    obs: visitaForm.obs || '',
    continua: visitaForm.continua
  })
  guardarStorage()
  cerrarModalVisita()
  toastMsg('Visita registrada correctamente', 'success', 'check_circle')
}

function eliminarVisita(i) {
  if (!confirm('Eliminar esta visita?')) return
  const { sec, idx } = alumnoSeleccionado.value
  const id = sec + '_' + idx
  historial.value[id].splice(i, 1)
  if (!historial.value[id].length) delete historial.value[id]
  guardarStorage()
  toastMsg('Visita eliminada', 'info', 'delete')
}

function guardarStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(historial.value))
}

function descargarJSON() {
  const datos = {
    fechaRespaldo: new Date().toISOString(),
    totalAlumnos: totalAlumnos.value,
    secciones: alumnosPorSeccion.value,
    registrosVisitas: historial.value,
    fichasSalud: fichas.value
  }
  const blob = new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'seguimiento_clinico_galileo_' + new Date().toISOString().slice(0, 10) + '.json'
  a.click()
  URL.revokeObjectURL(url)
  toastMsg('JSON exportado correctamente', 'success', 'file_download')
}

function descargarCSV() {
  let csv = 'Alumno,Seccion,TotalVisitas,UltimaVisita,DiasDesdeUltima,Estado,RequiereDerivacion,ClasificacionSalud,Dni,MadreApoderado,Telefono\n'
  for (const sec of Object.keys(alumnosPorSeccion.value)) {
    for (let i = 0; i < alumnosPorSeccion.value[sec].length; i++) {
      const id = sec + '_' + i
      const a = alumnosPorSeccion.value[sec][i]
      const v = historial.value[id] || []
      const e = calcularEstado(v)
      const ult = v.length ? v[v.length - 1].fecha : 'Nunca'
      const dias = v.length ? diasDesde(ult) : 9999
      const f = fichas.value[id]
      const cls = f ? (infoClasificacion(f.clasificacion)?.label || '') : ''
      csv += `"${a.nombre}","${sec}",${v.length},"${ult}",${dias},"${e.label}",${requiereDerivacion(sec, i) ? 'SI' : 'NO'},"${cls}","${f?.dni || ''}","${f?.madreApoderado || ''}","${f?.telefono || ''}"\n`
    }
  }
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'seguimiento_clinico_galileo_' + new Date().toISOString().slice(0, 10) + '.csv'
  a.click()
  URL.revokeObjectURL(url)
  toastMsg('CSV exportado — compatible con Excel', 'success', 'file_download')
}

function subirJSON() {
  const inp = document.createElement('input')
  inp.type = 'file'
  inp.accept = '.json'
  inp.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const datos = JSON.parse(ev.target.result)
        if (datos.registrosVisitas) {
          historial.value = datos.registrosVisitas
          guardarStorage()
          if (datos.fichasSalud) {
            fichas.value = datos.fichasSalud
            localStorage.setItem(STORAGE_KEY_FICHAS, JSON.stringify(fichas.value))
          }
          toastMsg('Registros importados correctamente', 'success', 'check_circle')
        } else toastMsg('El archivo no contiene registros válidos', 'error', 'error')
      } catch (err) {
        toastMsg('Error al leer el archivo', 'error', 'error')
      }
    }
    reader.readAsText(file)
  }
  inp.click()
}

function subirLogo() {
  const inp = document.createElement('input')
  inp.type = 'file'
  inp.accept = 'image/*'
  inp.onchange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      logoEscuela.value = ev.target.result
      try { localStorage.setItem(STORAGE_KEY_LOGO, logoEscuela.value) } catch (err) { /* ignore */ }
      toastMsg('Logo actualizado correctamente', 'success', 'check_circle')
    }
    reader.readAsDataURL(file)
  }
  inp.click()
}

function quitarLogo() {
  logoEscuela.value = escudoDefault
  localStorage.removeItem(STORAGE_KEY_LOGO)
  toastMsg('Logo restaurado al escudo del colegio', 'info', 'delete')
}

const store = {
  alumnosPorSeccion, historial, fichas,
  activePage, busquedaAlumnos, seccionActiva,
  alumnoSeleccionado, alumnoActual, alumnoHistorial, ultimaFecha, alumnoEstado,
  modalVisita, ayudaOpen, toast, visitaForm,
  fichaForm, vacunasForm, edadFicha, clasificaciones, statsFichas, logoEscuela,
  destinos, destinoLabel,
  menuItems, criterios,
  totalAlumnos, stats, topRisk,
  seccionesFiltradas, seccionesFiltradasObj, derivados,
  setPage, mostrarAyuda, LimpiarDatos, toastMsg,
  seleccionarAlumno, irAlumno, abrirModalVisita, cerrarModalVisita,
  guardarVisita, eliminarVisita, descargarJSON, descargarCSV, subirJSON,
  getEstadoClass, getAlumnoEstado,
  getFicha, infoClasificacion, clasificacionAlumno, requiereDerivacion,
  abrirFichaForm, guardarFicha, agregarVacuna, quitarVacuna,
  subirLogo, quitarLogo
}

export { store }