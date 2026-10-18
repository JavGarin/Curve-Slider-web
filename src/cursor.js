/**
 * cursor.js
 * Cursor personalizado (dot + ring) con lag y efecto hover magnético.
 * Desactivado de forma estricta en viewports mobile (<= 768px) y dispositivos táctiles (touch).
 */

export function initCursor() {
  const isTouchOrMobile = () => {
    return (
      window.matchMedia('(hover: none), (pointer: coarse)').matches ||
      window.innerWidth <= 768
    )
  }

  // Si estamos en mobile o táctil, no inicializar ningún bucle ni listener
  if (isTouchOrMobile()) return

  const cursorEl = document.getElementById('cursor')
  const dot = document.querySelector('.cursor__dot')
  const ring = document.querySelector('.cursor__ring')

  if (!cursorEl || !dot || !ring) return

  let ringX = 0, ringY = 0
  let mouseX = 0, mouseY = 0
  let isRunning = true
  let rafId = null

  const RING_LAG = 0.1

  const onMouseMove = (e) => {
    if (isTouchOrMobile()) return
    mouseX = e.clientX
    mouseY = e.clientY
    dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true })

  function animateRing() {
    if (!isRunning || isTouchOrMobile()) return
    ringX += (mouseX - ringX) * RING_LAG
    ringY += (mouseY - ringY) * RING_LAG
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`
    rafId = requestAnimationFrame(animateRing)
  }
  rafId = requestAnimationFrame(animateRing)

  // Hover magnético con delegación de eventos
  const onMouseOver = (e) => {
    if (isTouchOrMobile()) return
    if (e.target.closest('a, button, [role="button"], .slide, .detail-view__close, .detail-view__nav')) {
      document.body.classList.add('cursor-hover')
    }
  }

  const onMouseOut = (e) => {
    if (isTouchOrMobile()) return
    if (e.target.closest('a, button, [role="button"], .slide, .detail-view__close, .detail-view__nav')) {
      document.body.classList.remove('cursor-hover')
    }
  }

  document.addEventListener('mouseover', onMouseOver, { passive: true })
  document.addEventListener('mouseout', onMouseOut, { passive: true })

  document.addEventListener('mouseleave', () => {
    dot.style.opacity = '0'
    ring.style.opacity = '0'
  })

  document.addEventListener('mouseenter', () => {
    if (isTouchOrMobile()) return
    dot.style.opacity = '1'
    ring.style.opacity = '1'
  })

  // Listener de resize: apagar o reanudar el cursor si cambia de desktop a mobile
  window.addEventListener('resize', () => {
    if (isTouchOrMobile()) {
      isRunning = false
      if (rafId) cancelAnimationFrame(rafId)
      cursorEl.style.display = 'none'
      document.body.classList.remove('cursor-hover')
    } else {
      if (!isRunning) {
        isRunning = true
        cursorEl.style.display = ''
        rafId = requestAnimationFrame(animateRing)
      }
    }
  }, { passive: true })
}
