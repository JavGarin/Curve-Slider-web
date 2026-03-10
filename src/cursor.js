/**
 * cursor.js
 * Cursor personalizado (dot + ring) con lag y efecto hover magnético en links.
 * Se desactiva en dispositivos táctiles.
 */

export function initCursor() {
  // No inicializar en touch (no hay mouse)
  if (window.matchMedia('(hover: none)').matches) return

  const dot  = document.querySelector('.cursor__dot')
  const ring = document.querySelector('.cursor__ring')

  if (!dot || !ring) return

  // Posición actual del ring (con lag)
  let ringX = 0, ringY = 0
  // Posición objetivo (directo al mouse)
  let mouseX = 0, mouseY = 0

  const RING_LAG = 0.1 // 0 = nada de lag, 1 = instantáneo

  // Mover el dot directo al mouse
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX
    mouseY = e.clientY

    dot.style.transform  = `translate(${mouseX}px, ${mouseY}px)`
  })

  // Ring con interpolación (lerp)
  function animateRing() {
    ringX += (mouseX - ringX) * RING_LAG
    ringY += (mouseY - ringY) * RING_LAG
    ring.style.transform = `translate(${ringX}px, ${ringY}px)`
    requestAnimationFrame(animateRing)
  }
  animateRing()

  // Hover magnético en links y botones
  const interactables = document.querySelectorAll(
    'a, button, [role="button"]'
  )

  interactables.forEach((el) => {
    el.addEventListener('mouseenter', () => {
      document.body.classList.add('cursor-hover')
    })
    el.addEventListener('mouseleave', () => {
      document.body.classList.remove('cursor-hover')
    })
  })

  // Ocultar cursor si sale de la ventana
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0'
    ring.style.opacity = '0'
  })
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1'
    ring.style.opacity = '1'
  })
}
