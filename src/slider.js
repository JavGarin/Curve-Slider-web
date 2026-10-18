/**
 * slider.js
 * Carrusel "CoverFlow Vertical Parabólico" Nativo DOM
 * Simula la curva de Three.js pero usando CSS transforms hyper-optimizados (hardware acceleration).
 * Scroll infinito y fluidísimo con Lenis.
 */
import Lenis from 'lenis'
import { initLightbox, openLightbox } from './lightbox.js'

const SLIDE_COUNT = 7
const SLIDE_TITLES = [
  'Atacama I',
  'Vía Láctea',
  'Desierto Vivo',
  'Cielito Norte',
  'Horizonte',
  'Exposición',
  'Nocturno',
]

// ── Precarga Promisificada ─────────────────────────────────────────────────
function preloadImages(onProgress) {
  return new Promise((resolve) => {
    let loadedCount = 0
    const REQUIRED = 2
    
    // Detección responsive: determina qué directorio usar para imágenes
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    const imageDir = isMobile ? '/assets/img/mobile' : '/assets/img'
    
    const images = Array.from({ length: SLIDE_COUNT }, (_, i) => `${imageDir}/img${i + 1}.avif`)
    let resolved = false

    const onLoadDone = () => {
      loadedCount++
      onProgress?.(loadedCount, REQUIRED)
      if (loadedCount >= REQUIRED && !resolved) {
        resolved = true
        resolve(images)
      }
    }

    for (let i = 1; i <= REQUIRED; i++) {
      const idx = i - 1
      const img = new Image()
      img.decoding = 'async'
      if (i === 1) img.fetchPriority = 'high'
      
      img.onload = onLoadDone
      img.onerror = () => {
        images[idx] = `${imageDir}/img${i}.jpg`
        onLoadDone() // Proceder incluso con fallback lento
      }
      img.src = images[idx] // Dispara petición de red sólo para REQUIRED
    }

    // Fallback radical contra redes muy lentas: Unblock rendering en max. 1.5s
    setTimeout(() => {
      if (!resolved) {
        resolved = true
        resolve(images)
      }
    }, 1500)
  })
}

// ── Construir DOM ──────────────────────────────────────────────
function buildCarousel(images) {
  const track = document.getElementById('sliderTrack')
  if (!track) return null

  const slides = []

  for (let i = 0; i < SLIDE_COUNT; i++) {
    const slide = document.createElement('article')
    slide.className = 'slide'
    slide.setAttribute('role', 'button')
    slide.setAttribute('tabindex', '0')
    slide.setAttribute('aria-label', `Ver ${SLIDE_TITLES[i]} en detalle`)
    
    const img = document.createElement('img')
    img.className = 'slide__img'
    img.src = images[i]
    img.decoding = 'async' // Reduce TBT
    img.alt = SLIDE_TITLES[i] // Accesibilidad
    img.width = 1200
    img.height = 800
    
    if (i === 0) {
      img.fetchPriority = 'high' // Optimize LCP
    } else {
      img.loading = 'lazy'
    }
    
    // Auto-fallback local para lazy loaded images (i >= REQUIRED)
    img.onerror = function() {
      if (this.src.includes('.avif')) {
        this.src = this.src.replace('.avif', '.jpg')
      }
    }

    // Tag minimalista e intuitivo para indicar que es explorable
    const tag = document.createElement('div')
    tag.className = 'slide__tag'
    tag.innerHTML = `
      <span class="slide__tag-dot" aria-hidden="true"></span>
      <span class="slide__tag-text">Ver obra</span>
    `
    
    const content = document.createElement('div')
    content.className = 'slide__content'

    const series = document.createElement('p')
    series.className = 'slide__series'
    series.textContent = `— ${String(i + 1).padStart(2, '0')}`

    const title = document.createElement('h2')
    title.className = 'slide__title'
    title.textContent = SLIDE_TITLES[i]

    content.appendChild(series)
    content.appendChild(title)
    slide.appendChild(img)
    slide.appendChild(tag)
    slide.appendChild(content)

    // Detección de click genuino (sin dispararse durante un scroll o drag)
    let startX = 0
    let startY = 0
    let startTime = 0

    slide.addEventListener('pointerdown', (e) => {
      startX = e.clientX
      startY = e.clientY
      startTime = Date.now()
    })

    slide.addEventListener('click', (e) => {
      const dx = Math.abs(e.clientX - startX)
      const dy = Math.abs(e.clientY - startY)
      const dt = Date.now() - startTime
      // Si se movió más de 8px o tardó más de 450ms, es un gesto de scroll/drag y se ignora
      if (dx > 8 || dy > 8 || dt > 450) return
      openLightbox(i)
    })

    slide.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        openLightbox(i)
      }
    })
    
    // Optimization (set up once to avoid doing this in requestAnimationFrame)
    slide.style.willChange = 'transform, opacity'
    
    track.appendChild(slide)
    slides.push(slide)
  }

  // Tilt muy delicado en el Wrapper principal para asimetría
  track.style.transform = `rotateY(-8deg) rotateZ(-3deg)`

  return slides
}

// ── Loop Principal & Lenis ───────────────────────────────────────────
export async function initSlider(onProgress) {
  const imageUrls = await preloadImages(onProgress)
  const container = document.getElementById('sliderContainer')
  if (container) container.style.display = 'block'

  const slides = buildCarousel(imageUrls)
  if (!slides) return

  // Altura masiva para scroll infinito natural:
  document.body.style.height = '1000vh'

  const lenis = new Lenis({
    duration: 1.2, // Ligero y suave
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    smoothTouch: false,      // En touch, Lenis usa el scroll nativo del browser (mejor UX táctil)
    touchMultiplier: 1.5,    // Sensibilidad táctil adecuada sin ser excesiva
    infinite: true,          // Loop natural en body
    gestureOrientation: 'vertical', // Solo capturar gestos verticales; horizontales libres para swipe
  })

  // Inicializar el visor de detalle profesional con soporte de pausa de Lenis
  initLightbox(lenis)

  // Cache de dimensiones para evitar forced reflows durante el scroll
  let winHeight = window.innerHeight
  let winWidth = window.innerWidth

  // Detección de dispositivo táctil/móvil — evaluada una sola vez para evitar
  // crear un nuevo MediaQueryList en cada llamada al handler de resize
  const touchMediaQuery = window.matchMedia('(pointer: coarse)')
  const isTouchDevice = () => touchMediaQuery.matches || window.innerWidth <= 768
  let lerpFactor = isTouchDevice() ? 0.20 : 0.08

  // Tamaño de separación virtual (px de scroll para saltar de 1 slide a la siguiente)
  let PX_PER_SLIDE = winHeight * 1.2
  // Unidades de curva: qué tan atrás se van en Z al alejarse del centro
  let CURVE_AMOUNT = winWidth > 768 ? 450 : 250
  let Y_OFFSET_MULTIPLIER = winHeight * 0.7 

  // Filtro anti-jank en resize con debounce: evitar cálculos excesivos por
  // el colapso/expansión de la barra de URL en iOS Safari
  let resizeTimer = null
  window.addEventListener('resize', () => {
    if (resizeTimer) clearTimeout(resizeTimer)
    resizeTimer = setTimeout(() => {
      const newWinWidth = window.innerWidth
      const newWinHeight = window.innerHeight

      if (newWinWidth !== winWidth || Math.abs(newWinHeight - winHeight) > 120) {
        winHeight = newWinHeight
        winWidth = newWinWidth
        PX_PER_SLIDE = winHeight * 1.2
        CURVE_AMOUNT = winWidth > 768 ? 450 : 250
        Y_OFFSET_MULTIPLIER = winHeight * 0.7 
        lerpFactor = isTouchDevice() ? 0.20 : 0.08
        requestRender()
      }
    }, 150) // 150ms es suficiente para filtrar el rebote de barra de URL iOS
  })

  let currentScroll = 0
  let targetScroll = 0
  let lastScroll = 0
  let isRunning = false

  function requestRender() {
    if (!isRunning) {
      isRunning = true
      requestAnimationFrame(raf)
    }
  }

  lenis.on('scroll', ({ scroll }) => {
    let delta = scroll - lastScroll
    // Anti-snap de Lenis en infinite wraparound
    if (Math.abs(delta) > winHeight * 2) {
      delta = 0
    }
    targetScroll += delta
    lastScroll = scroll
    requestRender()
  })

  // Despertar el loop ante interacción táctil — se usa `requestRender` que es idémpotente
  // IMPORTANTE: no llamar raf() directamente aquí porque necesita el timestamp de rAF
  window.addEventListener('touchstart', requestRender, { passive: true })
  window.addEventListener('touchmove', requestRender, { passive: true })
  window.addEventListener('wheel', requestRender, { passive: true })

  function updateSlides() {
    // "progress" general del carrusel
    const progress = currentScroll / PX_PER_SLIDE

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      let dist = (i - progress) % SLIDE_COUNT
      if (dist < -SLIDE_COUNT / 2) dist += SLIDE_COUNT
      if (dist > SLIDE_COUNT / 2)  dist -= SLIDE_COUNT

      const absDist = Math.abs(dist)

      // Off-screen Culling: Ocultar slides fuera de pantalla para liberar la GPU móvil
      if (absDist > 2.85) {
        if (slide._visible !== false) {
          slide._visible = false
          slide.style.visibility = 'hidden'
        }
        continue
      } else if (slide._visible === false) {
        slide._visible = true
        slide.style.visibility = 'visible'
      }

      // 1. Posición Y: separación vertical
      const posY = dist * Y_OFFSET_MULTIPLIER

      // 2. Curvatura en Z y Rotación X (Simulación 3D parabólica)
      const posZ = Math.pow(absDist, 2) * -CURVE_AMOUNT
      const rotX = -dist * 18

      // 3. Opacidad y Z-Index
      const opacity = Math.max(0, 1 - (absDist * 0.35))
      const zIndex = Math.round(100 - absDist * 10)

      // Guardia para zIndex: evitar invalidar capas de composición si el valor no cambió
      if (slide._lastZ !== zIndex) {
        slide.style.zIndex = zIndex
        slide._lastZ = zIndex
      }

      slide.style.opacity = opacity.toFixed(3)
      // Transform compuesto limpio sin calc() para aceleración por hardware óptima
      slide.style.transform = `translate3d(-50%, -50%, 0) translate3d(0, ${posY.toFixed(1)}px, ${posZ.toFixed(1)}px) rotateX(${rotX.toFixed(2)}deg)`
    }
  }

  function raf(time) {
    lenis.raf(time)

    // Lerp adaptativo: ágil en mobile (0.20) para cero lag táctil, flotante en desktop (0.08)
    const delta = targetScroll - currentScroll
    currentScroll += delta * lerpFactor

    updateSlides()

    // Condición de reposo (Idle loop): apagar el RAF cuando no haya movimiento activo
    const isMoving = Math.abs(delta) > 0.05 || (lenis.velocity && Math.abs(lenis.velocity) > 0.05)
    if (!isMoving) {
      currentScroll = targetScroll
      updateSlides()
      isRunning = false
      return
    }

    requestAnimationFrame(raf)
  }

  // Primer cuadro de renderizado inicial
  requestRender()
}
