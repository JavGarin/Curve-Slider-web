/**
 * lightbox.js — Visor en detalle cinematográfico para fotografías de autor
 * Diseñado con cero impacto en el rendimiento:
 * - Aceleración por hardware (GPU transforms & opacity).
 * - Pausa de Lenis durante la observación para CPU en reposo (0% uso).
 * - Carga selectiva de imagen según viewport.
 * - Soporte accesible de teclado (Escape, Flechas) y gestos táctiles.
 */

export const PHOTO_METADATA = [
  {
    series: '— 01',
    title: 'Atacama I',
    location: 'Valle de la Muerte · Desierto de Atacama',
    tech: 'Sony A7 IV · 24mm · f/1.4 · 20s · ISO 3200',
    desc: 'Larga exposición capturando el cielo más nítido del planeta sobre las formaciones de sal y arcilla esculpidas por el viento milenario.',
  },
  {
    series: '— 02',
    title: 'Vía Láctea',
    location: 'Salar de Tara · 4.300 msnm',
    tech: 'Sony A7 IV · 14mm · f/1.8 · 25s · ISO 6400',
    desc: 'El arco galáctico completo elevándose sobre los monolitos del altiplano andino en ausencia total de contaminación lumínica.',
  },
  {
    series: '— 03',
    title: 'Desierto Vivo',
    location: 'Laguna Chaxa · Reserva Los Flamencos',
    tech: 'Sony A7 IV · 35mm · f/2.0 · 15s · ISO 1600',
    desc: 'Espejo de agua salobre que refleja el cosmos austral en calma absoluta, donde la quietud nocturna transforma la sal en plata.',
  },
  {
    series: '— 04',
    title: 'Cielito Norte',
    location: 'Meseta de Chajnantor · ALMA Observatory',
    tech: 'Sony A7 IV · 20mm · f/1.8 · 30s · ISO 4000',
    desc: 'Convergencia de ciencia y naturaleza bajo el manto estelar del hemisferio sur a 5.000 metros de altitud.',
  },
  {
    series: '— 05',
    title: 'Horizonte',
    location: 'Cordillera de la Sal · San Pedro',
    tech: 'Sony A7 IV · 50mm · f/2.8 · 10s · ISO 800',
    desc: 'El gradiente crepuscular desvaneciéndose hacia la oscuridad profunda, marcando el inicio de la vigilia astronómica.',
  },
  {
    series: '— 06',
    title: 'Exposición',
    location: 'Campo Geotérmico El Tatio',
    tech: 'Sony A7 IV · 16mm · f/2.8 · 20s · ISO 3200',
    desc: 'Columnas de vapor termal iluminadas por el brillo estelar en una de las zonas geotérmicas más altas del mundo.',
  },
  {
    series: '— 07',
    title: 'Nocturno',
    location: 'Pukará de Quitor',
    tech: 'Sony A7 IV · 24mm · f/1.4 · 15s · ISO 2500',
    desc: 'Vestigios arqueológicos prehispánicos vigilados eternamente por las constelaciones que guiaron a las antiguas culturas atacameñas.',
  },
]

let currentIndex = 0
let lenisInstance = null
let isOpen = false

let modalEl = null
let imgEl = null
let seriesEl = null
let titleEl = null
let locationEl = null
let techEl = null
let descEl = null
let counterEl = null

export function initLightbox(lenis) {
  lenisInstance = lenis

  modalEl = document.getElementById('detailView')
  if (!modalEl) return

  modalEl.setAttribute('inert', '')

  imgEl = document.getElementById('detailImg')
  seriesEl = document.getElementById('detailSeries')
  titleEl = document.getElementById('detailTitle')
  locationEl = document.getElementById('detailLocation')
  techEl = document.getElementById('detailTech')
  descEl = document.getElementById('detailDesc')
  counterEl = document.getElementById('detailCounter')

  const closeBtn = document.getElementById('detailCloseBtn')
  const prevBtn = document.getElementById('detailPrevBtn')
  const nextBtn = document.getElementById('detailNextBtn')
  const backdrop = document.getElementById('detailBackdrop')

  closeBtn?.addEventListener('click', closeLightbox)
  backdrop?.addEventListener('click', closeLightbox)

  prevBtn?.addEventListener('click', () => navigateDetail(-1))
  nextBtn?.addEventListener('click', () => navigateDetail(1))

  // Navegación por teclado accesible
  window.addEventListener('keydown', (e) => {
    if (!isOpen) return
    if (e.key === 'Escape') closeLightbox()
    if (e.key === 'ArrowLeft') navigateDetail(-1)
    if (e.key === 'ArrowRight') navigateDetail(1)
  })

  // Soporte de Swipe táctil en móvil para cerrar o navegar
  let touchStartX = 0
  let touchStartY = 0

  modalEl.addEventListener(
    'touchstart',
    (e) => {
      touchStartX = e.changedTouches[0].screenX
      touchStartY = e.changedTouches[0].screenY
    },
    { passive: true }
  )

  modalEl.addEventListener(
    'touchend',
    (e) => {
      if (!isOpen) return
      const diffX = e.changedTouches[0].screenX - touchStartX
      const diffY = e.changedTouches[0].screenY - touchStartY

      // Deslizar hacia abajo más de 90px cierra el visor
      if (diffY > 90 && Math.abs(diffX) < 80) {
        closeLightbox()
        return
      }

      // Deslizar horizontalmente navega entre fotos
      if (Math.abs(diffX) > 60 && Math.abs(diffY) < 60) {
        if (diffX > 0) navigateDetail(-1)
        else navigateDetail(1)
      }
    },
    { passive: true }
  )
}

function updateContent(index) {
  currentIndex = (index + PHOTO_METADATA.length) % PHOTO_METADATA.length
  const data = PHOTO_METADATA[currentIndex]
  const photoNum = currentIndex + 1

  // Resolución adaptativa: mobile usa /mobile para no saturar memoria en celulares
  const isMobile = window.innerWidth <= 768
  const imageSrc = isMobile
    ? `/assets/img/mobile/img${photoNum}.avif`
    : `/assets/img/img${photoNum}.avif`

  if (imgEl) {
    imgEl.style.opacity = '0'
    imgEl.src = imageSrc
    imgEl.alt = `${data.title} — ${data.location}`
    imgEl.onload = () => {
      imgEl.style.opacity = '1'
    }
    // Fallback jpg si avif no está disponible
    imgEl.onerror = () => {
      imgEl.src = `/assets/img/img${photoNum}.jpg`
      imgEl.style.opacity = '1'
    }
  }

  if (seriesEl) seriesEl.textContent = data.series
  if (titleEl) titleEl.textContent = data.title
  if (locationEl) locationEl.textContent = data.location
  if (techEl) techEl.textContent = data.tech
  if (descEl) descEl.textContent = data.desc
  if (counterEl) counterEl.textContent = `${photoNum} / ${PHOTO_METADATA.length}`
}

export function openLightbox(index) {
  if (!modalEl) return
  isOpen = true
  updateContent(index)

  // Pausar Lenis para que la web entre en reposo absoluto mientras se admira la foto
  lenisInstance?.stop?.()

  modalEl.removeAttribute('inert')
  modalEl.setAttribute('aria-hidden', 'false')
  modalEl.classList.add('is-active')
  document.body.classList.add('lightbox-open')
}

export function closeLightbox() {
  if (!modalEl || !isOpen) return
  isOpen = false

  // Evitar advertencia W3C: si un descendiente tiene el foco, liberarlo antes de ocultar
  if (modalEl.contains(document.activeElement)) {
    document.activeElement.blur()
  }

  modalEl.classList.remove('is-active')
  modalEl.setAttribute('inert', '')
  modalEl.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('lightbox-open')

  // Reanudar Lenis suavemente al cerrar el detalle
  setTimeout(() => {
    lenisInstance?.start?.()
  }, 250)
}

function navigateDetail(direction) {
  updateContent(currentIndex + direction)
}
