/**
 * main.js — Entry point del portfolio
 * Orquesta la inicialización del loader, el slider 3D y el cursor.
 */
import './style.css'
import { initLoader } from './loader.js'
import { initSlider } from './slider.js'
import { initCursor } from './cursor.js'
import { injectSpeedInsights } from '@vercel/speed-insights'

injectSpeedInsights()

async function main() {
  // Cursor personalizado (independiente del loader)
  initCursor()

  // Iniciar slider: pasa el callback de progreso al loader
  let loaderController = null

  const sliderPromise = initSlider((loaded, total) => {
    loaderController?.setProgress(loaded, total)
  })

  // Iniciar loader: cuando termina, el slider ya está listo
  loaderController = initLoader(() => {
    // UI revealed — nada extra por ahora
  })

  await sliderPromise
}

main()
