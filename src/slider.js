/**
 * slider.js
 * Carrusel "CoverFlow Vertical Parabólico" Nativo DOM
 * Simula la curva de Three.js pero usando CSS transforms hyper-optimizados (hardware acceleration).
 * Scroll infinito y fluidísimo con Lenis.
 */
import Lenis from 'lenis'

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
    
    // Por si queremos dar asimetría base al track container
    const img = document.createElement('img')
    img.className = 'slide__img'
    img.src = images[i]
    img.decoding = 'async' // Reduce TBT
    img.alt = SLIDE_TITLES[i] // Accesibilidad
    
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
    slide.appendChild(content)
    
    // Optimization (set up once to avoid doing this in requestAnimationFrame)
    slide.style.willChange = 'transform, opacity'
    
    // El orden base en CSS no importa mucho porque usaremos zIndex y transform dinámicos
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
    duration: 1.2, // Más ligero para que persiga el scroll suavemente
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    infinite: true // Loop natural en body
  })

  // Cache window dimensions to prevent forced reflows during scroll
  let winHeight = window.innerHeight
  let winWidth = window.innerWidth

  // Tamaño de separación virtual (px de scroll para saltar de 1 slide a la siguiente)
  let PX_PER_SLIDE = winHeight * 1.2
  // Unidades de curva: que tan atrás se van en Z al alejarse del centro
  let CURVE_AMOUNT = winWidth > 768 ? 450 : 250
  let Y_OFFSET_MULTIPLIER = winHeight * 0.7 

  window.addEventListener('resize', () => {
    winHeight = window.innerHeight
    winWidth = window.innerWidth
    PX_PER_SLIDE = winHeight * 1.2
    CURVE_AMOUNT = winWidth > 768 ? 450 : 250
    Y_OFFSET_MULTIPLIER = winHeight * 0.7 
  })

  let currentScroll = 0
  let targetScroll = 0
  let lastScroll = 0

  lenis.on('scroll', ({ scroll }) => {
    let delta = scroll - lastScroll
    // Anti-snap de Lenis en infinite wraparound
    if (Math.abs(delta) > winHeight * 2) {
      delta = 0
    }
    targetScroll += delta
    lastScroll = scroll
  })

  function raf(time) {
    lenis.raf(time)
    
    // Lerp ultra suave sobre el delta
    currentScroll += (targetScroll - currentScroll) * 0.08
    
    // "progress" general de todo el carrusel (0 = primera slide en centro, 1 = segunda, y así sucesivamente)
    const progress = currentScroll / PX_PER_SLIDE

    slides.forEach((slide, i) => {
      // Diferencia entre la slide actual y el centro de pantalla
      // Para hacer loop virtual infinito: Math.abs% o modulo
      // Ej. si progress = 7, y hay 7 slides. Modulo hace que la 0 se acerque
      // Para ello usamos modulo centrado:
      let dist = (i - progress) % SLIDE_COUNT
      if (dist < -SLIDE_COUNT / 2) dist += SLIDE_COUNT
      if (dist > SLIDE_COUNT / 2)  dist -= SLIDE_COUNT
      
      // 'dist' ahora representa cuantas slides de distancia está este elemento del 'foco central' (-3 a +3)

      const absDist = Math.abs(dist)

      // 1. Posición Y: simple separación
      const posY = dist * Y_OFFSET_MULTIPLIER

      // 2. Curvatura en Z y Rotación X (Simulación del 3D parabólico)
      // Cuanto más lejos del centro, más profundo hacia adentro (translade z negativo) y rotado
      const posZ = Math.pow(absDist, 2) * -CURVE_AMOUNT
      const rotX = -dist * 18 // Los de arriba se inclinan "mirando hacia abajo" y los de abajo "mirando hacia arriba"

      // 3. Opacity y Escala (Fading)
      const opacity = Math.max(0, 1 - (absDist * 0.35))
      const scale = 1

      // 4. Z-Index para jerarquía visual. El más central (absDist ≈ 0) va arriba
      const zIndex = Math.round(100 - absDist * 10)
      
      // Aplicar al DOM de inmediato
      slide.style.zIndex = zIndex
      slide.style.opacity = opacity
      slide.style.transform = `translate3d(-50%, calc(-50% + ${posY}px), ${posZ}px) rotateX(${rotX}deg) scale(${scale})`
    })

    requestAnimationFrame(raf)
  }

  requestAnimationFrame(raf)
}
