/**
 * loader.js
 * Maneja la animación del loader con GSAP y la carga progresiva de imágenes.
 * Al completarse, revela la UI principal.
 */
import gsap from 'gsap'

export function initLoader(onComplete) {
  // Bloquear scroll durante la carga (clase CSS lo gestiona)
  document.body.classList.add('is-loading')

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

  let imagesReady = false
  let introCompleted = false
  let uiRevealed = false

  // Animación de entrada ágil, pulida y elegante (~600ms)
  const introTl = gsap.timeline({
    onComplete: () => {
      introCompleted = true
      _checkReady()
    }
  })

  introTl
    .to(el.first, {
      y: 0,
      opacity: 1,
      duration: 0.55,
      ease: 'power3.out',
    })
    .to(el.last, {
      y: 0,
      opacity: 1,
      duration: 0.55,
      ease: 'power3.out',
    }, '-=0.4')
    .to(el.tagline, {
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out',
    }, '-=0.25')

  function _checkReady() {
    if (imagesReady && introCompleted && !uiRevealed) {
      uiRevealed = true
      // Breve pausa respiratoria natural antes de revelar la UI
      setTimeout(() => {
        _revealUI()
      }, 100)
    }
  }

  /**
   * Actualiza la barra de progreso según la cantidad de imágenes cargadas.
   */
  function setProgress(loaded, total) {
    const required = 2
    const pct = Math.min(100, Math.round((loaded / required) * 100))
    if (el.bar) el.bar.style.width = `${pct}%`
    if (el.counter) el.counter.textContent = `${pct}%`

    if (loaded >= required) {
      imagesReady = true
      _checkReady()
    }
  }

  /** Fallback de seguridad: nunca bloquear más de 1.2s */
  setTimeout(() => {
    if (!uiRevealed) {
      uiRevealed = true
      _revealUI()
    }
  }, 1200)

  /** Timeline de salida del loader + entrada sincronizada de la UI */
  function _revealUI() {
    const exitTl = gsap.timeline({
      onComplete: () => {
        if (el.loader) el.loader.style.display = 'none'
        // Liberar scroll/touch al terminar la animación del loader
        document.body.classList.remove('is-loading')
        onComplete?.()
      },
    })

    exitTl
      .to(el.loader, {
        opacity: 0,
        duration: 0.45,
        ease: 'power2.inOut',
      })
      .to([el.header, el.footer], {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out',
      }, '-=0.25')
      .to(el.location, {
        opacity: 1,
        y: 0,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.15')
      .to(el.title, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out',
      }, '-=0.2')
      .to(el.scroll, {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out',
      }, '-=0.3')
  }

  return { setProgress }
}
