/**
 * loader.js
 * Maneja la animación del loader con GSAP y la carga progresiva de imágenes.
 * Al completarse, revela la UI principal.
 */
import gsap from 'gsap'

const MIN_DISPLAY_MS = 100 // Acelerado para que se descubra el DOM y mejore el LCP
const startTime = Date.now()
let uiRevealed = false

export function initLoader(onComplete) {
  const el = {
    loader:   document.getElementById('loader'),
    first:    document.querySelector('.loader__first'),
    last:     document.querySelector('.loader__last'),
    tagline:  document.querySelector('.loader__tagline'),
    bar:      document.getElementById('loaderBar'),
    counter:  document.getElementById('loaderCounter'),
    header:   document.getElementById('header'),
    footer:   document.querySelector('.footer'),
    hero:     document.querySelector('.hero__content'),
    location: document.querySelector('.hero__location'),
    title:    document.querySelector('.hero__title'),
    scroll:   document.querySelector('.hero__scroll-hint'),
  }

  // Animación inicial del loader
  const introTl = gsap.timeline()

  introTl
    .to(el.first, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out',
    })
    .to(el.last, {
      y: 0,
      opacity: 1,
      duration: 0.9,
      ease: 'power3.out',
    }, '-=0.6')
    .to(el.tagline, {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
    }, '-=0.3')

  /**
   * Actualiza la barra de progreso según la cantidad de imágenes cargadas.
   * @param {number} loaded - imágenes ya cargadas
   * @param {number} total  - total de imágenes
   */
  function setProgress(loaded, total) {
    const required = 2
    const pct = Math.min(100, Math.round((loaded / required) * 100))
    el.bar.style.width = `${pct}%`
    el.counter.textContent = `${pct}%`

    if (loaded >= required && !uiRevealed) {
      uiRevealed = true
      _maybeReveal()
    }
  }

  /** Revela la UI sólo cuando han pasado los ms mínimos Y las imágenes están cargadas. */
  function _maybeReveal() {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed)

    setTimeout(() => {
      _revealUI()
    }, remaining)
  }

  /** Timeline de salida del loader + entrada de la UI. */
  function _revealUI() {
    const exitTl = gsap.timeline({
      onComplete: () => {
        el.loader.style.display = 'none'
        onComplete?.()
      },
    })

    exitTl
      // Fade out del loader más rápido
      .to(el.loader, {
        opacity: 0,
        duration: 0.4,
        ease: 'power2.inOut',
      })
      // Header y footer entran
      .to([el.header, el.footer], {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      }, '-=0.2')
      // Hero location
      .to(el.location, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.1')
      // Título principal con split manual (línea a línea)
      .to(el.title, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
      }, '-=0.2')
      // Scroll hint
      .to(el.scroll, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.3')
  }

  return { setProgress }
}
