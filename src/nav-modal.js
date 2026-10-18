/**
 * nav-modal.js — Modales minimalistas para WORK, ABOUT y CONTACT
 * Sigue la estética cinematográfica del portfolio evitando sobre-ingeniería.
 */

let modalEl = null
let currentView = null
let lastFocusedElement = null
let lenisInstance = null

export function setNavModalLenis(lenis) {
  lenisInstance = lenis
}

export function initNavModal() {
  modalEl = document.getElementById('infoModal')
  if (!modalEl) return

  // Asegurar estado inicial inerte
  modalEl.setAttribute('inert', '')

  const closeBtn = document.getElementById('infoModalClose')
  const backdrop = document.getElementById('infoModalBackdrop')

  closeBtn?.addEventListener('click', closeNavModal)
  backdrop?.addEventListener('click', closeNavModal)

  // Botón para cerrar desde el panel de Work ("Explorar Galería")
  const exploreBtn = document.getElementById('workExploreBtn')
  exploreBtn?.addEventListener('click', closeNavModal)

  // Evitar que el scroll del modal se propague al slider 3D del fondo
  modalEl.addEventListener('wheel', (e) => e.stopPropagation(), { passive: true })
  modalEl.addEventListener('touchmove', (e) => e.stopPropagation(), { passive: true })

  // Escuchar todos los enlaces con data-nav
  document.querySelectorAll('[data-nav]').forEach((trigger) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault()
      const target = trigger.getAttribute('data-nav')
      if (target) {
        lastFocusedElement = trigger
        openNavModal(target)
      }
    })
  })

  // Cerrar con Escape
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl.classList.contains('is-open')) {
      closeNavModal()
    }
  })
}

export function openNavModal(viewName) {
  if (!modalEl) return

  // Ocultar todas las vistas
  modalEl.querySelectorAll('.info-modal__view').forEach((view) => {
    view.classList.remove('is-active')
  })

  // Activar la vista solicitada
  const targetView = document.getElementById(`view-${viewName}`)
  if (targetView) {
    targetView.classList.add('is-active')
    currentView = viewName
  }

  modalEl.removeAttribute('inert')
  modalEl.setAttribute('aria-hidden', 'false')
  modalEl.classList.add('is-open')
  document.body.classList.add('info-modal-open')
  lenisInstance?.stop()
}

export function closeNavModal() {
  if (!modalEl) return

  // Evitar advertencia W3C: si un descendiente tiene el foco, liberarlo antes de ocultar
  if (modalEl.contains(document.activeElement)) {
    document.activeElement.blur()
  }

  modalEl.classList.remove('is-open')
  modalEl.setAttribute('inert', '')
  modalEl.setAttribute('aria-hidden', 'true')
  document.body.classList.remove('info-modal-open')
  lenisInstance?.start()

  // Restaurar el foco accesible al disparador original
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus()
  }
}
