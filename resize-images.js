import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const inputDir = path.join(__dirname, 'public', 'assets', 'img');
const outputDir = path.join(__dirname, 'public', 'assets', 'img', 'mobile');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function resizeImages() {
  try {
    const files = fs.readdirSync(inputDir);
    let count = 0;
    
    console.log('Iniciando optimización de imágenes para versión mobile...');
    
    for (const file of files) {
      if (file.endsWith('.avif') || file.endsWith('.jpg')) {
        const inputPath = path.join(inputDir, file);
        const outputPath = path.join(outputDir, file);
        
        console.log(`Procesando ${file}...`);
        
        await sharp(inputPath)
          .resize({ width: 768 }) // Redimensiona el ancho a 768px (pantalla móvil) manteniendo el aspect ratio
          .withMetadata()
          .toFile(outputPath);
          
        count++;
        console.log(`✅ ${file} guardado en /mobile/`);
      }
    }
    console.log(`\n¡Éxito! Se han optimizado ${count} imágenes para dispositivos móviles.`);
    console.log('Ahora puedes correr tu test de Lighthouse de nuevo.');
  } catch (error) {
    console.error('\n❌ Hubo un error procesando las imágenes:');
    console.error(error.message);
    if (error.code === 'ERR_MODULE_NOT_FOUND' || error.message.includes('sharp')) {
      console.log('\nParece que no tienes "sharp" instalado. Instálalo con este comando (puedes usar el Command Prompt si PowerShell está bloqueado):');
      console.log('npm install sharp');
    }
  }
}

resizeImages();
