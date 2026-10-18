/**
 * main.js — Entry point del portfolio
 * Orquesta la inicialización del loader, el slider 3D y el cursor.
 */
import './style.css'
import { initLoader } from './loader.js'
import { initSlider } from './slider.js'
import { initCursor } from './cursor.js'
import { initNavModal } from './nav-modal.js'
import { injectSpeedInsights } from '@vercel/speed-insights'

injectSpeedInsights()

async function main() {
  // Cursor personalizado (independiente del loader)
  initCursor()

  // Modal para Work, About y Contact
  initNavModal()

  // Iniciar loader primero para que el controlador esté listo de inmediato
  const loaderController = initLoader(() => {
    // UI revealed — listo
  })

  // Iniciar slider pasando el progreso de precarga al loader
  const sliderPromise = initSlider((loaded, total) => {
    loaderController.setProgress(loaded, total)
  })

  await sliderPromise
}

main()
